#!/usr/bin/env python3
"""
Phase 4 — the production CLI. Apply one author's Imp to a draft.

    python apply_imp.py --imp hemingway --input draft.txt --output result.txt
    echo "some draft" | python apply_imp.py --imp didion
    python apply_imp.py --imp thompson --input d.txt --structure hybrid --type "blog post"

By default it uses the winning structure from the tournament (see WINNING_STRUCTURE,
update after analysis). --structure overrides it. --type sets the content type so the
rewrite preserves the right functional shape.
"""
from __future__ import annotations

import argparse
import sys

from imp_common import IMPS, PROD_MODEL, STRUCTURES, call_claude, load_prompt
from imp_render import render_imp

# Set from the tournament result. Voice memo won the kickoff (overall 4.33, accuracy 5.00,
# and #1 for every author); update if the full 10x8x10 run differs.
WINNING_STRUCTURE = "voice_memo"


def apply_imp(slug: str, draft: str, structure: str, content_type: str) -> str:
    if not (IMPS / slug / f"{structure}.json").exists():
        sys.exit(f"no imp at imps/{slug}/{structure}.json — generate it first.")
    tmpl = load_prompt("rewrite_apply.txt")
    prompt = tmpl.format(
        content_type=content_type,
        structure_label=STRUCTURES[structure],
        imp_render=render_imp(slug, structure),
        draft=draft.strip(),
    )
    return call_claude(prompt, model=PROD_MODEL, max_tokens=1200, temperature=0.8,
                       tag=f"apply:{slug}:{structure}").strip()


def main() -> None:
    ap = argparse.ArgumentParser(description="Rewrite a draft in an author's voice.")
    ap.add_argument("--imp", required=True, help="author slug, e.g. hemingway")
    ap.add_argument("--input", help="input file; omit to read stdin")
    ap.add_argument("--output", help="output file; omit to print")
    ap.add_argument("--structure", default=WINNING_STRUCTURE, choices=list(STRUCTURES))
    ap.add_argument("--type", default="piece of writing", help="content type to preserve")
    args = ap.parse_args()

    draft = open(args.input).read() if args.input else sys.stdin.read()
    result = apply_imp(args.imp, draft, args.structure, args.type)
    if args.output:
        open(args.output, "w").write(result + "\n")
        print(f"wrote {args.output}")
    else:
        print(result)


if __name__ == "__main__":
    main()
