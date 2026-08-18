# Voice metric v2 — does richer stylometry make voice-match trustworthy?

Blind author attribution: given a rewrite, pick the target author by nearest reference profile. Higher top-1 = the metric actually captures voice. No GPU/API (function words + char n-grams, the classical stylometry signal).

## Aggregated cells (≈ a paragraph, 10 cases joined)

| cohort | chance | structural | funcwords | charngram | combined |
|---|---|---|---|---|---|
| pastiche-10 | 10% | **18%** | **38%** | **29%** | **35%** |  _(n=80)_
| real-5 | 20% | **45%** | **12%** | **20%** | **18%** |  _(n=40)_
| pastiche-5 | 20% | **32%** | **78%** | **95%** | **90%** |  _(n=40)_

## Individual rewrites (≈ a tweet–paragraph, single piece)

| cohort | chance | structural | funcwords | charngram | combined |
|---|---|---|---|---|---|
| pastiche-10 | 10% | **21%** | **21%** | **24%** | **23%** |  _(n=800)_
| real-5 | 20% | **30%** | **21%** | **29%** | **23%** |  _(n=400)_
| pastiche-5 | 20% | **24%** | **46%** | **72%** | **57%** |  _(n=400)_

## Voice-match (combined) ↔ judged accuracy

- pastiche-10: Pearson **0.158**, Spearman **0.371** (n=80)
- real-5: Pearson **0.251**, Spearman **0.077** (n=40)
- pastiche-5: Pearson **0.494**, Spearman **0.5** (n=40)

**Pooled: Pearson 0.312, Spearman 0.351.**

---

## Interpretation — read the REAL-5 row, not the pastiche rows

The pastiche cohorts look spectacular (char-ngram hits **95%** on pastiche-5) but that's a
**trap**: the pastiche corpus is 5 short, narrow, homogeneous synthetic passages, so the
rewrites trivially echo their exact n-grams. It's overfitting to a thin reference, not voice
capture. **The honest case is real-5** (real published corpus, the actual product scenario):

- On real text, the **structural fingerprint wins attribution (45%)** — function words (12%)
  and char-ngrams (20%) are *worse*, and funcwords drop **below chance**. Two reasons:
  1. Char-ngrams/funcwords absorb **topic vocabulary**. The reference is *Mrs Dalloway*
     (flowers, London, war); the rewrite is a headphone ad. Cross-domain, the lexical signal
     misleads. The punctuation/length habits (Woolf's semicolons, Poe's em-dashes) **transfer**;
     the vocabulary doesn't.
  2. Five literary authors share similar function-word distributions — they're all careful
     English prose. Punctuation rhythm separates them; the/of/and don't.

- **Richer features DID fix the correlation's consistency**, though. Combined voice-match ↔
  judged accuracy is now positive in every cohort (0.16 / 0.25 / 0.49; pooled **+0.31**),
  versus v1's structural-only which inverted/nulled on real-5 (−0.04). So the metric is real
  signal — just **modest**.

## Verdict for the product (updated)

1. **Voice-match is a directional gauge, not a precise %.** Best honest correlation ≈ 0.3 with
   perceived accuracy. Ship it as a **drift alarm / trend** ("drifting off-voice"), not
   "Voice Match: 73%." Putting a confident number on it would be overclaiming — the data says so.
2. **For real corpora, weight the structural fingerprint** (em-dashes, semicolons, paragraph
   length, modifier density) — it's the most transferable author signal across content types.
   Add function words **with content words stripped** as the next refinement; raw lexical/n-gram
   features leak topic and hurt on cross-domain rewrites.
3. **Slop detection remains the strong, shippable half** (11.5× separation, −0.34 vs accuracy).
   It needs none of this — it's a fixed lexicon, instant, and validated.

**Bottom line:** richer stylometry made voice-match *consistent and positive* but still only
*modest* — confirming the v1 caution. The defensible product today is **slop/AI-tell detection
(precise) + a voice-drift directional alarm (honest trend, not a vanity %)**. A precise
voice-match number needs true semantic embeddings (blocked here) — that's the one thing worth
an external dependency later.
