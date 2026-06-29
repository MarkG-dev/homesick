#!/usr/bin/env python3
"""
Wide validation of the Voice/Slop score against the full tournament dataset (no GPU, no LLM).

Question: do the cheap computational numbers (slop_index, voice_match) track the expensive
LLM-judge ratings the product would otherwise need? Runs a battery over every cohort and
writes analysis/voice_score_validation.md.

Battery:
  T1  Slop separation   — does slop_index flag the generic AI drafts vs the styled rewrites?
  T2  Voice-match ↔ judged accuracy — does fingerprint closeness predict the judges' accuracy?
  T3  Blind attribution — can nearest-fingerprint guess which author a rewrite targeted?
  T4  Feature power     — which fingerprint features carry the most author signal?
  T5  Slop ↔ distinctiveness/usability — does sloppier read as less distinctive / more usable?
"""
from __future__ import annotations

import json
from collections import defaultdict
from statistics import mean

from imp_common import ANALYSIS, AUTHOR_NAME, IMPS, RESULTS, EVALS, TEST_CASES
from stats_fingerprint import compute_fingerprint
from voice_score import (FEATURES, slop_index, vec, norm_stats, zdist, pearson, spearman)

COHORTS = {
    "pastiche-10 (modern)": ["hemingway", "didion", "chandler", "baldwin", "parker",
                             "wallace", "morrison", "orwell", "thompson", "ephron"],
    "real-5 (PD literary)": ["poe", "james", "woolf", "joyce", "fitzgerald"],
    "pastiche-5 (same authors)": ["poe_p", "james_p", "woolf_p", "joyce_p", "fitzgerald_p"],
}


def corpus_fp(slug):
    return json.loads((IMPS / slug / "statistical.json").read_text())["imp"]


def cell_text(slug, structure):
    d = RESULTS / slug / structure
    return "\n\n".join(f.read_text() for f in sorted(d.glob("*.txt"))) if d.exists() else ""


def cell_eval(slug, structure, dim):
    d = EVALS / slug / structure
    vals = [json.loads(f.read_text()).get(dim, 0) for f in d.glob("*.json")] if d.exists() else []
    return mean(vals) if vals else None


STRUCTURES = ["rules_list", "trait_vector", "voice_memo", "example_pairs",
              "hybrid", "anti_patterns", "statistical", "persona_prompt"]


def t1_slop(out):
    out.append("## T1 · Slop separation — does the index flag generic AI vs styled text?\n")
    gen_scores = [slop_index(f.read_text()) for f in sorted(TEST_CASES.glob("*.txt"))]
    styled = []
    for slugs in COHORTS.values():
        for s in slugs:
            for st in STRUCTURES:
                t = cell_text(s, st)
                if t:
                    styled.append(slop_index(t))
    g, sty = mean(gen_scores), mean(styled)
    out.append(f"- generic AI drafts (the slop baseline): **{g:.2f}** slop/1k words")
    out.append(f"- styled rewrites (all cohorts, n={len(styled)}): **{sty:.2f}** slop/1k words")
    out.append(f"- **separation: {g/ max(sty,0.01):.1f}× more slop in generic drafts** "
               f"({'PASS' if g > sty else 'FAIL'} — the score drops when voice is applied)\n")


def _cohort_cells(slugs):
    """Per (author,structure) cell: aggregated-text fingerprint + judged accuracy/distinct/use."""
    cells = []
    refs = {s: corpus_fp(s) for s in slugs}
    means, stds = norm_stats(list(refs.values()))
    for s in slugs:
        for st in STRUCTURES:
            t = cell_text(s, st)
            acc = cell_eval(s, st, "accuracy")
            if not t or acc is None:
                continue
            fp = compute_fingerprint(t)
            cells.append({"author": s, "structure": st, "fp": fp,
                          "acc": acc, "dist": cell_eval(s, st, "distinctiveness"),
                          "use": cell_eval(s, st, "usability"),
                          "slop": slop_index(t),
                          "d_target": zdist(fp, refs[s], means, stds)})
    return cells, refs, means, stds


def t2_match(out, name, cells):
    # voice-match score (closer fingerprint = higher) vs judged accuracy
    xs = [100 / (1 + c["d_target"]) for c in cells]
    ys = [c["acc"] for c in cells]
    out.append(f"### {name}  (n={len(cells)} cells)")
    out.append(f"- voice-match (fingerprint) ↔ judged ACCURACY: "
               f"Pearson **{pearson(xs, ys)}**, Spearman **{spearman(xs, ys)}**")


def t3_attr(out, name, cells, refs, means, stds):
    slugs = list(refs)
    # per-cell: classify aggregated fingerprint to nearest author corpus
    correct = 0
    for c in cells:
        nearest = min(slugs, key=lambda s: zdist(c["fp"], refs[s], means, stds))
        correct += (nearest == c["author"])
    chance = 1 / len(slugs)
    out.append(f"- {name}: blind author attribution from fingerprint = "
               f"**{correct/len(cells)*100:.0f}%** top-1 (chance {chance*100:.0f}%, n={len(cells)})")


def t4_features(out, all_cells):
    out.append("\n## T4 · Which fingerprint features carry author signal?\n")
    by_author = defaultdict(list)
    for c in all_cells:
        by_author[c["author"]].append(c["fp"])
    rows = []
    for i, feat in enumerate(FEATURES):
        author_means = [mean([vec(fp)[i] for fp in fps]) for fps in by_author.values()]
        grand = mean(author_means)
        between = sum((m - grand) ** 2 for m in author_means) / len(author_means)
        within = mean([
            (lambda vs: sum((v - mean(vs)) ** 2 for v in vs) / len(vs))([vec(fp)[i] for fp in fps])
            for fps in by_author.values() if len(fps) > 1
        ])
        rows.append((between / (within or 1e-9), feat))
    rows.sort(reverse=True)
    out.append("| feature | between/within variance (↑ = more author-distinguishing) |")
    out.append("|---|---|")
    for ratio, feat in rows:
        out.append(f"| {feat} | {ratio:.2f} |")


def t5_slop_quality(out, all_cells):
    out.append("\n## T5 · Slop vs perceived quality\n")
    slop = [c["slop"] for c in all_cells]
    out.append(f"- slop ↔ judged DISTINCTIVENESS: Pearson **{pearson(slop, [c['dist'] for c in all_cells])}**")
    out.append(f"- slop ↔ judged ACCURACY: Pearson **{pearson(slop, [c['acc'] for c in all_cells])}**")
    out.append(f"- slop ↔ judged USABILITY: Pearson **{pearson(slop, [c['use'] for c in all_cells])}**")
    out.append("\n(Expect slop to *anti*-correlate with distinctiveness/accuracy: "
               "the more generic-AI markers, the less it reads as a real distinct voice.)")


def main():
    out = ["# Voice / Slop score — wide validation against 1,600 judged rewrites\n",
           "Cheap computational scores vs. the LLM judges. No GPU, no model calls — pure "
           "measurement over the data already generated.\n"]
    t1_slop(out)

    out.append("## T2 · Does fingerprint voice-match predict judged accuracy?\n")
    all_cells = []
    cohort_cells = {}
    for name, slugs in COHORTS.items():
        cells, refs, means, stds = _cohort_cells(slugs)
        cohort_cells[name] = (cells, refs, means, stds)
        t2_match(out, name, cells)
        all_cells += cells
    xs = [100 / (1 + c["d_target"]) for c in all_cells]
    ys = [c["acc"] for c in all_cells]
    out.append(f"\n**Pooled (all {len(all_cells)} cells): Pearson {pearson(xs, ys)}, "
               f"Spearman {spearman(xs, ys)}.**\n")

    out.append("## T3 · Blind author attribution from fingerprint alone\n")
    for name, (cells, refs, means, stds) in cohort_cells.items():
        t3_attr(out, name, cells, refs, means, stds)

    t4_features(out, all_cells)
    t5_slop_quality(out, all_cells)

    ANALYSIS.mkdir(parents=True, exist_ok=True)
    (ANALYSIS / "voice_score_validation.md").write_text("\n".join(out) + "\n")
    print(f"wrote analysis/voice_score_validation.md  ({len(all_cells)} cells analysed)")


if __name__ == "__main__":
    main()
