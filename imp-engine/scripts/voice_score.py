"""
Voice / Slop scoring — the measurement product, validated against the tournament data.

Two numbers, both computational (no LLM, no GPU):
  slop_index(text)        -> AI-tell density per 1k words (corporate cliche + negation-antithesis
                             + buzzword lexicon). High = reads like generic AI slop.
  voice_match(text, ref)  -> 0..100 similarity of text's stylistic fingerprint to a reference
                             fingerprint (your/their corpus). Low = drifted off-voice.

The point of wide_validation.py is to check these cheap numbers actually track the expensive
LLM-judge ratings. If they do, you can sell the score.
"""
from __future__ import annotations

import math
import re

from stats_fingerprint import compute_fingerprint

# Scalar fingerprint features used for voice distance (top_words list excluded).
FEATURES = [
    "avg_sentence_length", "sentence_length_variance", "semicolons_per_1k",
    "em_dashes_per_1k", "ellipses_per_1k", "exclamations_per_1k", "questions_per_1k",
    "avg_paragraph_length", "dialogue_quote_marks_per_1k", "flesch_kincaid_grade",
    "adj_adv_density_per_1k", "type_token_ratio",
]

# --- slop markers -----------------------------------------------------------
_NEG = [
    r"\bnot just\b[^.?!]*\bbut\b", r"\bnot only\b[^.?!]*\bbut\b",
    r"\b(it'?s|it is|this is|that is|there is)\s+not\b[^.?!]*[,.]\s*(it'?s|it is|this is|that is)\b",
    r"\bnot\b[^.?!]{0,50}[.,]\s*(it is|it'?s|that is|this is)\s+\w",
    r"\bisn'?t (just|only|merely|simply)\b", r"\bnot (merely|simply)\b[^.?!]*\bbut\b",
]
_BUZZ = re.compile(r"\b(delve|tapestry|testament|navigat\w+|realm|elevate|unlock\w*|"
    r"seamless\w*|leverage|boast\w*|game-?chang\w+|in today'?s\b|fast-?paced|ever-?evolving|"
    r"landscape|harness\w*|robust|synerg\w+|cutting-?edge|in a world|at the end of the day|"
    r"when it comes to|look no further|next level|best-?in-?class|world-?class|empower\w*|"
    r"dive in|full potential|thrilled|excited to|passionate|grateful|journey|next chapter|"
    r"onward and upward|can'?t wait|reach out|game changer|unlock|drive impact)\b", re.I)


def slop_index(text: str) -> float:
    """AI-tell hits per 1000 words: corporate-cliche + buzzword + negation-antithesis."""
    t = text.lower()
    w = max(1, len(t.split()))
    hits = len(_BUZZ.findall(t)) + sum(len(re.findall(p, t)) for p in _NEG)
    return round(hits / w * 1000, 2)


# --- voice distance ---------------------------------------------------------

def vec(fp: dict) -> list[float]:
    return [float(fp.get(k, 0.0)) for k in FEATURES]


def norm_stats(ref_fps: list[dict]) -> tuple[list[float], list[float]]:
    """Per-feature mean/std across a set of reference fingerprints (z-normalisation basis)."""
    cols = list(zip(*[vec(f) for f in ref_fps]))
    means = [sum(c) / len(c) for c in cols]
    stds = []
    for c, m in zip(cols, means):
        v = sum((x - m) ** 2 for x in c) / len(c)
        stds.append(math.sqrt(v) or 1.0)
    return means, stds


def zdist(fp_a: dict, fp_b: dict, means: list[float], stds: list[float]) -> float:
    a, b = vec(fp_a), vec(fp_b)
    return math.sqrt(sum(((a[i] - means[i]) / stds[i] - (b[i] - means[i]) / stds[i]) ** 2
                         for i in range(len(a))))


def voice_match(text: str, ref_fp: dict, means, stds) -> float:
    """0..100: closeness of text's fingerprint to ref. 100 = identical style stats."""
    d = zdist(compute_fingerprint(text), ref_fp, means, stds)
    return round(100.0 / (1.0 + d), 1)


# --- tiny stats (stdlib) ----------------------------------------------------

def pearson(xs, ys) -> float:
    n = len(xs)
    if n < 3:
        return 0.0
    mx, my = sum(xs) / n, sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    dx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    dy = math.sqrt(sum((y - my) ** 2 for y in ys))
    return round(num / (dx * dy), 3) if dx and dy else 0.0


def spearman(xs, ys) -> float:
    def ranks(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        i = 0
        while i < len(v):
            j = i
            while j + 1 < len(v) and v[order[j + 1]] == v[order[i]]:
                j += 1
            avg = (i + j) / 2 + 1
            for k in range(i, j + 1):
                r[order[k]] = avg
            i = j + 1
        return r
    return pearson(ranks(xs), ranks(ys))
