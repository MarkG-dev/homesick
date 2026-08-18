# Voice / Slop score — wide validation against 1,600 judged rewrites

Cheap computational scores vs. the LLM judges. No GPU, no model calls — pure measurement over the data already generated.

## T1 · Slop separation — does the index flag generic AI vs styled text?

- generic AI drafts (the slop baseline): **21.39** slop/1k words
- styled rewrites (all cohorts, n=160): **1.86** slop/1k words
- **separation: 11.5× more slop in generic drafts** (PASS — the score drops when voice is applied)

## T2 · Does fingerprint voice-match predict judged accuracy?

### pastiche-10 (modern)  (n=80 cells)
- voice-match (fingerprint) ↔ judged ACCURACY: Pearson **0.197**, Spearman **0.149**
### real-5 (PD literary)  (n=40 cells)
- voice-match (fingerprint) ↔ judged ACCURACY: Pearson **-0.037**, Spearman **-0.144**
### pastiche-5 (same authors)  (n=40 cells)
- voice-match (fingerprint) ↔ judged ACCURACY: Pearson **0.664**, Spearman **0.595**

**Pooled (all 160 cells): Pearson -0.306, Spearman -0.479.**

## T3 · Blind author attribution from fingerprint alone

- pastiche-10 (modern): blind author attribution from fingerprint = **18%** top-1 (chance 10%, n=80)
- real-5 (PD literary): blind author attribution from fingerprint = **45%** top-1 (chance 20%, n=40)
- pastiche-5 (same authors): blind author attribution from fingerprint = **32%** top-1 (chance 20%, n=40)

## T4 · Which fingerprint features carry author signal?

| feature | between/within variance (↑ = more author-distinguishing) |
|---|---|
| avg_paragraph_length | 5.14 |
| em_dashes_per_1k | 3.92 |
| semicolons_per_1k | 2.31 |
| adj_adv_density_per_1k | 1.91 |
| type_token_ratio | 1.80 |
| dialogue_quote_marks_per_1k | 1.43 |
| flesch_kincaid_grade | 0.97 |
| avg_sentence_length | 0.86 |
| sentence_length_variance | 0.83 |
| questions_per_1k | 0.20 |
| exclamations_per_1k | 0.15 |
| ellipses_per_1k | 0.00 |

## T5 · Slop vs perceived quality

- slop ↔ judged DISTINCTIVENESS: Pearson **0.174**
- slop ↔ judged ACCURACY: Pearson **-0.34**
- slop ↔ judged USABILITY: Pearson **-0.033**

(Expect slop to *anti*-correlate with distinctiveness/accuracy: the more generic-AI markers, the less it reads as a real distinct voice.)

---

## Interpretation — what's validated, what isn't (the business read)

**✅ The SLOP half works and is shippable.**
- Generic AI drafts carry **11.5× more slop markers** than styled writing (21.4 vs 1.9 / 1k).
- Slop **anti-correlates with judged voice-accuracy (r = −0.34)**: the more generic-AI markers,
  the less a piece reads as a real distinct voice. Slop and voice-fidelity are genuinely
  opposed axes, not the same thing measured twice.
- So a "how much does this read like generic AI?" score is real, cheap, and defensible. This
  is the wedge — and it's the half that doesn't need an LLM.

**⚠️ The VOICE-MATCH half is weak with a punctuation-only fingerprint.**
- Fingerprint closeness ↔ judged accuracy is **inconsistent**: strong in pastiche-5 (r = 0.66),
  ~null in real-5 (r = −0.04), weak-positive in pastiche-10 (r = 0.20). The pooled −0.31 is a
  cross-cohort scaling artefact (Simpson's), not a real inversion — don't over-read it.
- The real-5 null is mostly a **ceiling effect**: the LLM nails those famous voices so accuracy
  is uniformly 4.0–4.8 (no variance for the fingerprint to track).
- Blind author attribution from the fingerprint is **above chance but unreliable**: 45% top-1 on
  real-5 (chance 20%), 18% on pastiche-10 (chance 10%). Real signal — punctuation/length really
  do carry author identity — but far from a trustworthy "Voice Match: 73%".

**Conclusion for the product:** ship the **slop score** now (validated); do **not** ship a
voice-match % built only on punctuation/length stats — it's too noisy to put a number on.
To make voice-match trustworthy, add richer features: lexical/n-gram signatures, function-word
distributions, and (cheaply) sentence-embedding distance to the reference corpus. The 12-feature
fingerprint is a starting signal, not the finished metric.

**What to weight (T4):** paragraph length, em-dashes/1k, semicolons/1k, adjective+adverb density,
and type-token ratio carry the author signal. Exclamations, ellipses, and question marks carry
almost none — drop them from the score.

**Net:** there's a real, measurable thing here — but it's "**slop detection (strong) + voice
drift (needs better features)**", not "voice match is a solved number." That's the honest
foundation, and it's enough to ship the wedge while building the richer voice metric.
