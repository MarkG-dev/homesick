#!/usr/bin/env python3
"""
Phase 3c — read every eval JSON and emit the five analysis reports as markdown tables
in analysis/. Pure aggregation, no API calls.

  structure_leaderboard.md   avg scores per structure (overall + per dimension)
  author_difficulty.md       which authors are easiest/hardest to capture
  content_sensitivity.md     which test cases swing most by structure choice
  best_structure_per_author.md
  taste_transfer_verdict.md   the go/no-go read against the success criteria

Usage: python analyze_results.py
"""
from __future__ import annotations

import json
from collections import defaultdict
from statistics import mean, pstdev

from imp_common import (
    ANALYSIS, AUTHOR_NAME, EVALS, STRUCTURES, TEST_CASE_TYPES,
)

DIMS = ["distinctiveness", "accuracy", "usability"]


def load_all() -> list[dict]:
    rows = []
    for slug_dir in sorted(EVALS.iterdir()):
        if not slug_dir.is_dir():
            continue
        for struct_dir in sorted(slug_dir.iterdir()):
            for f in sorted(struct_dir.glob("*.json")):
                d = json.loads(f.read_text())
                rows.append({
                    "author": slug_dir.name,
                    "structure": struct_dir.name,
                    "case": f.stem,
                    **{k: float(d.get(k, 0)) for k in DIMS},
                })
    return rows


def _avg(rows, key):
    return mean([r[key] for r in rows]) if rows else 0.0


def table(headers, matrix) -> str:
    out = ["| " + " | ".join(headers) + " |",
           "| " + " | ".join("---" for _ in headers) + " |"]
    for row in matrix:
        out.append("| " + " | ".join(str(c) for c in row) + " |")
    return "\n".join(out)


def leaderboard(rows) -> str:
    by = defaultdict(list)
    for r in rows:
        by[r["structure"]].append(r)
    matrix = []
    for s in STRUCTURES:
        rs = by.get(s, [])
        if not rs:
            continue
        overall = mean([_avg([x], d) for x in rs for d in DIMS]) if rs else 0
        matrix.append([
            STRUCTURES[s],
            f"{_avg(rs,'distinctiveness'):.2f}",
            f"{_avg(rs,'accuracy'):.2f}",
            f"{_avg(rs,'usability'):.2f}",
            f"{mean([_avg(rs,d) for d in DIMS]):.2f}",
            len(rs),
        ])
    matrix.sort(key=lambda r: float(r[4]), reverse=True)
    body = table(["Structure", "Distinct.", "Accuracy", "Usability", "Overall", "n"], matrix)
    return f"# Structure leaderboard\n\nAveraged across all authors and test cases.\n\n{body}\n"


def author_difficulty(rows) -> str:
    by = defaultdict(list)
    for r in rows:
        by[r["author"]].append(r)
    matrix = []
    for a, rs in by.items():
        matrix.append([
            AUTHOR_NAME.get(a, a),
            f"{_avg(rs,'accuracy'):.2f}",
            f"{_avg(rs,'distinctiveness'):.2f}",
            f"{mean([_avg(rs,d) for d in DIMS]):.2f}",
        ])
    matrix.sort(key=lambda r: float(r[1]), reverse=True)
    body = table(["Author", "Accuracy", "Distinct.", "Overall"], matrix)
    return ("# Author difficulty ranking\n\nSorted by accuracy (how recognizably *them* "
            "the rewrites read). Higher = easier to capture.\n\n" + body + "\n")


def content_sensitivity(rows) -> str:
    by = defaultdict(lambda: defaultdict(list))
    for r in rows:
        by[r["case"]][r["structure"]].append(r)
    matrix = []
    for case, structs in by.items():
        means = [mean([_avg(rs, d) for d in DIMS]) for rs in structs.values() if rs]
        spread = pstdev(means) if len(means) > 1 else 0.0
        matrix.append([TEST_CASE_TYPES.get(case, case), f"{spread:.2f}",
                       f"{mean(means):.2f}" if means else "—"])
    matrix.sort(key=lambda r: float(r[1]), reverse=True)
    body = table(["Test case", "Std-dev across structures", "Mean overall"], matrix)
    return ("# Content-type sensitivity\n\nHow much the structure choice swings quality "
            "for each content type (higher std-dev = structure matters more here).\n\n"
            + body + "\n")


def best_per_author(rows) -> str:
    by = defaultdict(lambda: defaultdict(list))
    for r in rows:
        by[r["author"]][r["structure"]].append(r)
    matrix = []
    for a, structs in by.items():
        ranked = sorted(
            ((s, mean([_avg(rs, d) for d in DIMS])) for s, rs in structs.items()),
            key=lambda kv: kv[1], reverse=True,
        )
        best = ", ".join(f"{STRUCTURES[s]} ({v:.2f})" for s, v in ranked[:2])
        matrix.append([AUTHOR_NAME.get(a, a), best])
    body = table(["Author", "Top structures"], matrix)
    return "# Best structure per author\n\n" + body + "\n"


def verdict(rows) -> str:
    by = defaultdict(list)
    for r in rows:
        by[r["structure"]].append(r)
    winners = []
    for s, rs in by.items():
        d, a, u = (_avg(rs, "distinctiveness"), _avg(rs, "accuracy"), _avg(rs, "usability"))
        if d > 3.5 and a > 3.5 and u > 3.5:
            winners.append((STRUCTURES[s], d, a, u))
    overall_distinct = _avg(rows, "distinctiveness")
    lines = ["# Taste-transfer verdict\n"]
    lines.append(f"- Rewrites scored: **{len(rows)}**")
    lines.append(f"- Mean distinctiveness across everything: **{overall_distinct:.2f}**")
    if overall_distinct >= 3.5:
        lines.append("  - ✅ Above 3.5 — taste transfers; the product premise holds.")
    elif overall_distinct < 3.0:
        lines.append("  - ❌ Below 3.0 — the Imp concept may not transfer well enough.")
    else:
        lines.append("  - ⚠️ 3.0–3.5 — variety without reliable voice capture; iterate.")
    lines.append("")
    if winners:
        lines.append("Structures clearing **all three** dimensions > 3.5:")
        for name, d, a, u in sorted(winners, key=lambda w: w[1] + w[2] + w[3], reverse=True):
            lines.append(f"- **{name}** — distinct {d:.2f}, accuracy {a:.2f}, usability {u:.2f}")
    else:
        lines.append("No structure cleared all three dimensions > 3.5 in this run.")
    return "\n".join(lines) + "\n"


def main() -> None:
    rows = load_all()
    if not rows:
        print("no evals found; run run_evals.py first.")
        return
    ANALYSIS.mkdir(parents=True, exist_ok=True)
    (ANALYSIS / "structure_leaderboard.md").write_text(leaderboard(rows))
    (ANALYSIS / "author_difficulty.md").write_text(author_difficulty(rows))
    (ANALYSIS / "content_sensitivity.md").write_text(content_sensitivity(rows))
    (ANALYSIS / "best_structure_per_author.md").write_text(best_per_author(rows))
    (ANALYSIS / "taste_transfer_verdict.md").write_text(verdict(rows))
    print(f"wrote 5 reports to {ANALYSIS} from {len(rows)} evals.")


if __name__ == "__main__":
    main()
