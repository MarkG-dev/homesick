#!/usr/bin/env python3
"""
Phase 2 — generate Imps in every structural approach.

For each author and each structure A–H, build the Imp and store it at
imps/{slug}/{structure}.json as {"author","structure","imp": <payload>}.

Structures A–F and H are LLM-generated from the corpus. Structure G (statistical) is
computed locally with no LLM. Hybrid (E) is assembled from the rules + voice memo + a
subset of the example pairs rather than a fresh call, so it literally is "A + C + D".

Caching: every LLM call is cached on disk (see imp_common), and a structure that already
has a file is skipped, so re-runs are cheap. Pass --force to regenerate.

Usage:
  python generate_imps.py                       # all authors, all structures
  python generate_imps.py hemingway didion      # subset of authors
  IMP_GEN_MODEL=claude-sonnet-4-6 python generate_imps.py hemingway --only rules_list
"""
from __future__ import annotations

import argparse
import json

from imp_common import (
    AUTHOR_NAME, AUTHORS, IMPS, STRUCTURES, call_claude, corpus_blob,
    extract_json, load_prompt,
)
from stats_fingerprint import compute_fingerprint
from imp_common import CORPUS


LLM_STRUCTURES = {
    "rules_list": "gen_rules_list.txt",
    "trait_vector": "gen_trait_vector.txt",
    "voice_memo": "gen_voice_memo.txt",
    "example_pairs": "gen_example_pairs.txt",
    "anti_patterns": "gen_anti_patterns.txt",
    "persona_prompt": "gen_persona_prompt.txt",
}


def _save(slug: str, structure: str, payload) -> None:
    out = IMPS / slug / f"{structure}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(
        {"author": slug, "structure": structure, "imp": payload}, indent=2,
    ))
    print(f"    saved {out.relative_to(IMPS.parent)}")


def gen_llm(slug: str, structure: str) -> None:
    tmpl = load_prompt(LLM_STRUCTURES[structure])
    prompt = tmpl.format(author_name=AUTHOR_NAME[slug], corpus=corpus_blob(slug))
    # 4000 tokens: verbose authors (Wallace, Baldwin) overran 1800 on example_pairs
    # and truncated the JSON. The larger cap also changes the cache key, so any
    # previously-cached truncated response is bypassed rather than re-read.
    raw = call_claude(prompt, max_tokens=4000, temperature=0.6,
                      tag=f"gen:{structure}:{slug}")
    _save(slug, structure, extract_json(raw))


def gen_statistical(slug: str) -> None:
    raw = (CORPUS / slug / "passages.jsonl")
    if not raw.exists():
        print(f"    statistical: no corpus for {slug}, skipping")
        return
    text = "\n\n".join(json.loads(l)["text"] for l in raw.read_text().splitlines() if l.strip())
    _save(slug, "statistical", compute_fingerprint(text))


def gen_hybrid(slug: str) -> None:
    rules = json.loads((IMPS / slug / "rules_list.json").read_text())["imp"]
    memo = json.loads((IMPS / slug / "voice_memo.json").read_text())["imp"]
    pairs = json.loads((IMPS / slug / "example_pairs.json").read_text())["imp"]
    memo_text = memo["voice_memo"] if isinstance(memo, dict) else memo
    _save(slug, "hybrid", {
        "voice_memo": memo_text,
        "rules": rules[:10],
        "pairs": pairs[:5],
    })


def generate_author(slug: str, only: set[str] | None, force: bool) -> None:
    print(f"  {slug}:")
    order = ["rules_list", "trait_vector", "voice_memo", "example_pairs",
             "anti_patterns", "persona_prompt", "statistical", "hybrid"]
    for structure in order:
        if only and structure not in only:
            continue
        out = IMPS / slug / f"{structure}.json"
        if out.exists() and not force:
            print(f"    {structure}: cached, skip")
            continue
        try:
            if structure in LLM_STRUCTURES:
                gen_llm(slug, structure)
            elif structure == "statistical":
                gen_statistical(slug)
            elif structure == "hybrid":
                gen_hybrid(slug)
        except Exception as err:  # don't let one bad structure abort the whole run
            print(f"    {structure}: FAILED ({err}); leaving unwritten, continuing")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("authors", nargs="*", help="author slugs; default all")
    ap.add_argument("--only", help="comma-separated structure ids to (re)generate")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    only = set(args.only.split(",")) if args.only else None
    slugs = args.authors or [s for s, _ in AUTHORS]
    for slug in slugs:
        generate_author(slug, only, args.force)
    print("done.")


if __name__ == "__main__":
    main()
