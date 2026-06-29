#!/usr/bin/env python3
"""
Does richer stylometry make voice-match trustworthy? Compares feature sets on the core test:
given a rewrite, can we identify which author it targeted (nearest reference profile)?

Feature sets:
  structural   — the 12-feature punctuation/length fingerprint (z-normalised Euclidean)
  funcwords    — function-word relative frequencies (cosine)
  charngram    — character 3-gram profile (cosine)
  combined     — funcwords + charngram (averaged cosine distance)

Reference per author = that author's corpus profile. Tested per cohort, both on per-(author,
structure) aggregated cells (~paragraph length) and per individual rewrite (tweet length).
Also reports correlation of the best metric's voice-match with the LLM judges' accuracy.

Writes analysis/voice_metric_v2.md.
"""
from __future__ import annotations

import json
from statistics import mean

from imp_common import ANALYSIS, IMPS, RESULTS, EVALS, CORPUS
from stats_fingerprint import compute_fingerprint
from voice_score import FEATURES, vec, norm_stats, zdist, pearson, spearman
from voice_features import fw_vector, char_ngram_vector, cos_dist

COHORTS = {
    "pastiche-10": ["hemingway", "didion", "chandler", "baldwin", "parker",
                    "wallace", "morrison", "orwell", "thompson", "ephron"],
    "real-5": ["poe", "james", "woolf", "joyce", "fitzgerald"],
    "pastiche-5": ["poe_p", "james_p", "woolf_p", "joyce_p", "fitzgerald_p"],
}
STRUCTURES = ["rules_list", "trait_vector", "voice_memo", "example_pairs",
              "hybrid", "anti_patterns", "statistical", "persona_prompt"]


def corpus_text(slug):
    p = CORPUS / slug / "passages.jsonl"
    return "\n\n".join(json.loads(l)["text"] for l in p.read_text().splitlines() if l.strip())


def corpus_fp(slug):
    return json.loads((IMPS / slug / "statistical.json").read_text())["imp"]


def cell_texts(slug, structure):
    d = RESULTS / slug / structure
    return [f.read_text() for f in sorted(d.glob("*.txt"))] if d.exists() else []


def cell_acc(slug, structure):
    d = EVALS / slug / structure
    v = [json.loads(f.read_text()).get("accuracy", 0) for f in d.glob("*.json")] if d.exists() else []
    return mean(v) if v else None


class Refs:
    """Reference profiles for one cohort across all feature sets."""
    def __init__(self, slugs):
        self.slugs = slugs
        self.fp = {s: corpus_fp(s) for s in slugs}
        self.means, self.stds = norm_stats(list(self.fp.values()))
        txt = {s: corpus_text(s) for s in slugs}
        self.fw = {s: fw_vector(txt[s]) for s in slugs}
        self.cg = {s: char_ngram_vector(txt[s]) for s in slugs}

    def predict(self, text, kind):
        if kind == "structural":
            fp = compute_fingerprint(text)
            return min(self.slugs, key=lambda s: zdist(fp, self.fp[s], self.means, self.stds))
        if kind == "funcwords":
            v = fw_vector(text)
            return min(self.slugs, key=lambda s: cos_dist(v, self.fw[s]))
        if kind == "charngram":
            v = char_ngram_vector(text)
            return min(self.slugs, key=lambda s: cos_dist(v, self.cg[s]))
        if kind == "combined":
            v1, v2 = fw_vector(text), char_ngram_vector(text)
            return min(self.slugs, key=lambda s: (cos_dist(v1, self.fw[s]) + cos_dist(v2, self.cg[s])) / 2)


KINDS = ["structural", "funcwords", "charngram", "combined"]


def main():
    out = ["# Voice metric v2 — does richer stylometry make voice-match trustworthy?\n",
           "Blind author attribution: given a rewrite, pick the target author by nearest "
           "reference profile. Higher top-1 = the metric actually captures voice. No GPU/API "
           "(function words + char n-grams, the classical stylometry signal).\n"]

    for level, label in [("cell", "Aggregated cells (≈ a paragraph, 10 cases joined)"),
                         ("rewrite", "Individual rewrites (≈ a tweet–paragraph, single piece)")]:
        out.append(f"## {label}\n")
        out.append("| cohort | chance | structural | funcwords | charngram | combined |")
        out.append("|---|---|---|---|---|---|")
        for cname, slugs in COHORTS.items():
            refs = Refs(slugs)
            items = []  # (true_author, text)
            for s in slugs:
                for st in STRUCTURES:
                    txts = cell_texts(s, st)
                    if not txts:
                        continue
                    if level == "cell":
                        items.append((s, "\n\n".join(txts)))
                    else:
                        items += [(s, t) for t in txts]
            row = [cname, f"{100/len(slugs):.0f}%"]
            for kind in KINDS:
                correct = sum(refs.predict(t, kind) == true for true, t in items)
                row.append(f"**{correct/len(items)*100:.0f}%**")
            out.append("| " + " | ".join(row) + f" |  _(n={len(items)})_")
        out.append("")

    # correlation: combined voice-match (1 - own-author cos distance) vs judged accuracy, per cell
    out.append("## Voice-match (combined) ↔ judged accuracy\n")
    xs_all, ys_all = [], []
    for cname, slugs in COHORTS.items():
        refs = Refs(slugs)
        xs, ys = [], []
        for s in slugs:
            for st in STRUCTURES:
                txts = cell_texts(s, st)
                acc = cell_acc(s, st)
                if not txts or acc is None:
                    continue
                t = "\n\n".join(txts)
                v1, v2 = fw_vector(t), char_ngram_vector(t)
                match = 1 - (cos_dist(v1, refs.fw[s]) + cos_dist(v2, refs.cg[s])) / 2
                xs.append(match); ys.append(acc)
        out.append(f"- {cname}: Pearson **{pearson(xs, ys)}**, Spearman **{spearman(xs, ys)}** (n={len(xs)})")
        xs_all += xs; ys_all += ys
    out.append(f"\n**Pooled: Pearson {pearson(xs_all, ys_all)}, Spearman {spearman(xs_all, ys_all)}.**")

    ANALYSIS.mkdir(parents=True, exist_ok=True)
    (ANALYSIS / "voice_metric_v2.md").write_text("\n".join(out) + "\n")
    print("wrote analysis/voice_metric_v2.md")


if __name__ == "__main__":
    main()
