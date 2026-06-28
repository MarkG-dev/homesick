#!/usr/bin/env python3
"""
Phase 3b — score every rewrite with a SEPARATE model call (never the generator).

For each results/{slug}/{structure}/{case}.txt, run the eval rubric and store
evals/{slug}/{structure}/{case}.json with {distinctiveness, accuracy, usability, notes}.

The scorer is deliberately a fresh call with no knowledge of which structure produced
the text, so a structure can't flatter its own output. Temperature is low for stable
scores. Cached by eval-file existence.

Usage mirrors run_tournament.py:
  python run_evals.py --kickoff
  python run_evals.py
"""
from __future__ import annotations

import argparse
import json

from imp_common import (
    AUTHOR_NAME, AUTHORS, EVALS, KICKOFF_AUTHORS, KICKOFF_CASES, RESULTS,
    STRUCTURES, TEST_CASES, TEST_CASE_TYPES, call_claude, extract_json, load_prompt,
)


def eval_one(slug: str, structure: str, case: str, tmpl: str) -> dict | None:
    src = RESULTS / slug / structure / f"{case}.txt"
    if not src.exists():
        return None
    out = EVALS / slug / structure / f"{case}.json"
    if out.exists():
        return json.loads(out.read_text())

    original = (TEST_CASES / f"{case}.txt").read_text().strip()
    prompt = tmpl.format(
        author_name=AUTHOR_NAME[slug],
        original=original,
        rewritten=src.read_text().strip(),
        content_type=TEST_CASE_TYPES[case],
    )
    raw = call_claude(prompt, max_tokens=400, temperature=0.0,
                      tag=f"eval:{slug}:{structure}:{case}")
    score = extract_json(raw)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(score, indent=2))
    return score


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

    tmpl = load_prompt("eval_rubric.txt")
    done = 0
    for slug in authors:
        for structure in structures:
            for case in cases:
                if eval_one(slug, structure, case, tmpl) is not None:
                    done += 1
                    print(f"  [{done}] scored {slug}/{structure}/{case}")
    print(f"done. {done} evals.")


if __name__ == "__main__":
    main()
