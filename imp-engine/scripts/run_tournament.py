#!/usr/bin/env python3
"""
Phase 3a — the tournament. Apply every Imp to every test case.

For author x structure x test_case, render the Imp into the rewrite prompt, ask the
model to rewrite the draft in that voice, and store the output at
results/{slug}/{structure}/{case}.txt.

Cached by result-file existence AND by the underlying call cache, so interrupting and
resuming is free. Full run is 10 authors x 8 structures x 10 cases = 800 rewrites; the
--kickoff flag runs only the 3x8x3 = 72 subset to check the signal first.

Usage:
  python run_tournament.py --kickoff
  python run_tournament.py                       # full 800
  python run_tournament.py --authors hemingway --cases 06_tweet
"""
from __future__ import annotations

import argparse

from imp_common import (
    AUTHORS, KICKOFF_AUTHORS, KICKOFF_CASES, RESULTS, STRUCTURES,
    TEST_CASES, TEST_CASE_TYPES, call_claude, load_prompt,
)
from imp_render import render_imp


def read_case(case: str) -> str:
    return (TEST_CASES / f"{case}.txt").read_text().strip()


def rewrite(slug: str, structure: str, case: str, tmpl: str) -> str:
    out = RESULTS / slug / structure / f"{case}.txt"
    if out.exists():
        return out.read_text()
    prompt = tmpl.format(
        content_type=TEST_CASE_TYPES[case],
        structure_label=STRUCTURES[structure],
        imp_render=render_imp(slug, structure),
        draft=read_case(case),
    )
    text = call_claude(prompt, max_tokens=900, temperature=0.8,
                       tag=f"rewrite:{slug}:{structure}:{case}").strip()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text)
    return text


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--kickoff", action="store_true")
    ap.add_argument("--authors", nargs="*")
    ap.add_argument("--structures", nargs="*")
    ap.add_argument("--cases", nargs="*")
    args = ap.parse_args()

    authors = args.authors or (KICKOFF_AUTHORS if args.kickoff else [s for s, _ in AUTHORS])
    structures = args.structures or list(STRUCTURES)
    cases = args.cases or (KICKOFF_CASES if args.kickoff else list(TEST_CASE_TYPES))

    tmpl = load_prompt("rewrite_apply.txt")
    n = done = 0
    for slug in authors:
        for structure in structures:
            for case in cases:
                n += 1
                rewrite(slug, structure, case, tmpl)
                done += 1
                print(f"  [{done}/{len(authors)*len(structures)*len(cases)}] "
                      f"{slug}/{structure}/{case}")
    print(f"done. {done} rewrites.")


if __name__ == "__main__":
    main()
