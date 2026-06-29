"""
Shared infrastructure for the Imp Library Engine tournament.

Responsibilities:
  - A thin wrapper around the Anthropic Messages API with:
      * aggressive on-disk caching (never re-run a generation/eval that has a result)
      * exponential-backoff retry on transient errors / 429s
      * a simple token-bucket rate limiter
      * token-usage logging to scripts/token_usage.jsonl
  - Path helpers so every script agrees on the on-disk layout.
  - Prompt-template loading from prompts/.

Nothing here imports anything author-specific; it is pure plumbing so the
scripts that *do* the experiment stay short and readable.

Env:
  ANTHROPIC_API_KEY   required to make live calls
  IMP_GEN_MODEL       default generation/eval model  (claude-sonnet-4-6)
  IMP_PROD_MODEL      model for final production imps (claude-opus-4-6)
"""
from __future__ import annotations

import hashlib
import json
import os
import threading
import time
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent          # imp-engine/
CORPUS = ROOT / "corpus"
IMPS = ROOT / "imps"
TEST_CASES = ROOT / "test_cases"
RESULTS = ROOT / "results"
EVALS = ROOT / "evals"
ANALYSIS = ROOT / "analysis"
PROMPTS = ROOT / "prompts"
CACHE = ROOT / ".cache"
TOKEN_LOG = ROOT / "scripts" / "token_usage.jsonl"

GEN_MODEL = os.environ.get("IMP_GEN_MODEL", "claude-sonnet-4-6")
PROD_MODEL = os.environ.get("IMP_PROD_MODEL", "claude-opus-4-6")

# The ten voices, in the canonical order used everywhere.
AUTHORS = [
    ("hemingway", "Ernest Hemingway"),
    ("didion", "Joan Didion"),
    ("chandler", "Raymond Chandler"),
    ("baldwin", "James Baldwin"),
    ("parker", "Dorothy Parker"),
    ("wallace", "David Foster Wallace"),
    ("morrison", "Toni Morrison"),
    ("orwell", "George Orwell"),
    ("thompson", "Hunter S. Thompson"),
    ("ephron", "Nora Ephron"),
    # Real-corpus cohort (public domain, fetched from Standard Ebooks via fetch_corpus.py).
    ("poe", "Edgar Allan Poe"),
    ("james", "Henry James"),
    ("woolf", "Virginia Woolf"),
    ("joyce", "James Joyce"),
    ("fitzgerald", "F. Scott Fitzgerald"),
]

# Authors whose corpus is real published text (vs. the synthetic-pastiche seed cohort).
REAL_CORPUS_AUTHORS = ["poe", "james", "woolf", "joyce", "fitzgerald"]

# Controlled A/B: the SAME five authors, but built from synthetic pastiche instead of real
# text, with the same engine — isolates "corpus source" as the single variable. The display
# name is identical (the "_p" suffix only separates the on-disk namespace).
PASTICHE_TWINS = ["poe_p", "james_p", "woolf_p", "joyce_p", "fitzgerald_p"]
AUTHOR_NAME = dict(AUTHORS)
for _p in PASTICHE_TWINS:               # pastiche twins share their real author's display name
    AUTHOR_NAME[_p] = AUTHOR_NAME[_p[:-2]]

# Structure id -> human label. The id is the on-disk filename stem.
STRUCTURES = {
    "rules_list": "Rules list",
    "trait_vector": "Trait vector",
    "voice_memo": "Voice memo",
    "example_pairs": "Example pairs",
    "hybrid": "Hybrid (rules + memo + pairs)",
    "anti_patterns": "Anti-patterns + patterns",
    "statistical": "Statistical fingerprint",
    "persona_prompt": "Persona prompt",
}

# Test case slug -> declared content type (used in the eval rubric).
TEST_CASE_TYPES = {
    "01_linkedin_post": "LinkedIn post",
    "02_product_description": "product description",
    "03_email_decline": "polite meeting-decline email",
    "04_newsletter_intro": "newsletter intro",
    "05_landing_hero": "landing page hero (headline + subhead)",
    "06_tweet": "short-form social post / tweet",
    "07_blog_opening": "blog post opening paragraph",
    "08_crisis_apology": "crisis / product-recall apology",
    "09_about_page": "company about-us paragraph",
    "10_cold_outreach": "cold outreach / partnership pitch email",
}

# The kickoff subset: prove the signal cheaply before scaling to 10x8x10.
KICKOFF_AUTHORS = ["hemingway", "didion", "thompson"]
KICKOFF_CASES = ["01_linkedin_post", "07_blog_opening", "06_tweet"]


# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------

class _RateLimiter:
    """Minimal thread-safe token-bucket: at most `rate` calls/sec, smoothed."""

    def __init__(self, rate_per_sec: float = 2.0):
        self._min_interval = 1.0 / rate_per_sec
        self._lock = threading.Lock()
        self._next_allowed = 0.0

    def wait(self) -> None:
        with self._lock:
            now = time.monotonic()
            if now < self._next_allowed:
                time.sleep(self._next_allowed - now)
                now = time.monotonic()
            self._next_allowed = now + self._min_interval


_LIMITER = _RateLimiter(float(os.environ.get("IMP_RATE_PER_SEC", "2.0")))


# ---------------------------------------------------------------------------
# Caching
# ---------------------------------------------------------------------------

def _cache_key(model: str, system: str, prompt: str, max_tokens: int, temperature: float) -> str:
    blob = json.dumps(
        {"m": model, "s": system, "p": prompt, "mt": max_tokens, "t": temperature},
        sort_keys=True,
    )
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()[:32]


def _log_tokens(model: str, usage: dict, tag: str) -> None:
    TOKEN_LOG.parent.mkdir(parents=True, exist_ok=True)
    with TOKEN_LOG.open("a") as fh:
        fh.write(json.dumps({"model": model, "tag": tag, **usage}) + "\n")


# ---------------------------------------------------------------------------
# The one call everything routes through
# ---------------------------------------------------------------------------

def call_claude(
    prompt: str,
    *,
    system: str = "",
    model: str | None = None,
    max_tokens: int = 1500,
    temperature: float = 0.7,
    tag: str = "untagged",
    max_retries: int = 5,
) -> str:
    """Single cached, rate-limited, retried text completion.

    Returns the assistant's text. Results are cached on disk keyed by the
    full request, so re-running a tournament is free for anything already done.
    """
    model = model or GEN_MODEL
    key = _cache_key(model, system, prompt, max_tokens, temperature)
    cache_file = CACHE / f"{key}.json"
    if cache_file.exists():
        return json.loads(cache_file.read_text())["text"]

    # Imported lazily so the scripts can be inspected / unit-tested without the
    # SDK installed, and so corpus/analysis steps that need no API still run.
    import anthropic

    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env
    last_err: Exception | None = None
    for attempt in range(max_retries):
        _LIMITER.wait()
        try:
            kwargs: dict[str, Any] = dict(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
            )
            if system:
                kwargs["system"] = system
            resp = client.messages.create(**kwargs)
            text = "".join(b.text for b in resp.content if b.type == "text")
            _log_tokens(
                model,
                {"input": resp.usage.input_tokens, "output": resp.usage.output_tokens},
                tag,
            )
            CACHE.mkdir(parents=True, exist_ok=True)
            cache_file.write_text(json.dumps({"text": text}))
            return text
        except Exception as err:  # noqa: BLE001 - we retry everything transient
            last_err = err
            wait = 2 ** attempt
            print(f"  [retry {attempt+1}/{max_retries}] {tag}: {err} (sleep {wait}s)")
            time.sleep(wait)
    raise RuntimeError(f"call_claude failed after {max_retries} retries: {last_err}")


# ---------------------------------------------------------------------------
# Prompt templates & small helpers
# ---------------------------------------------------------------------------

def load_prompt(name: str) -> str:
    return (PROMPTS / name).read_text()


def load_passages(slug: str, limit: int | None = None) -> list[dict]:
    path = CORPUS / slug / "passages.jsonl"
    if not path.exists():
        return []
    rows = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    return rows[:limit] if limit else rows


def corpus_blob(slug: str, max_chars: int = 12000) -> str:
    """Concatenate passages into a single sample, bounded for prompt budget."""
    out, total = [], 0
    for row in load_passages(slug):
        t = row["text"].strip()
        if total + len(t) > max_chars:
            break
        out.append(t)
        total += len(t)
    return "\n\n".join(out)


def extract_json(text: str) -> Any:
    """Pull the first JSON object/array out of a model response."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.rsplit("```", 1)[0] if "```" in text else text
    start = min(
        (i for i in (text.find("{"), text.find("[")) if i != -1),
        default=-1,
    )
    if start == -1:
        raise ValueError(f"no JSON found in: {text[:200]}")
    # Find the matching close by scanning bracket depth.
    open_ch = text[start]
    close_ch = "}" if open_ch == "{" else "]"
    depth, in_str, esc = 0, False, False
    for i in range(start, len(text)):
        c = text[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == open_ch:
                depth += 1
            elif c == close_ch:
                depth -= 1
                if depth == 0:
                    return json.loads(text[start : i + 1])
    raise ValueError(f"unbalanced JSON in: {text[:200]}")
