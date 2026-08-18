> **⚠️ Superseded on the causal claim by [`controlled_corpus_test.md`](controlled_corpus_test.md).**
> This doc compares real-5 vs the *pastiche-10* — confounded by author set + engine. The clean
> A/B (same 5 authors, same engine) finds the accuracy gain is **null**; real corpus's real
> benefit is **usability/anti-caricature (+0.53)**, not accuracy. Read the controlled test for the
> corrected conclusion.

# Real corpus vs. pastiche — does grounding in actual text improve the Imps?

Two tournaments:
- **Pastiche cohort** — 10 modern authors, Imps built from synthetic style-pastiche + model
  knowledge, generation+judging by **Sonnet 4.6 via the API**. (800 rewrites.)
- **Real-corpus cohort** — 5 public-domain authors (Poe, Henry James, Woolf, Joyce,
  Fitzgerald), corpus pulled from **Standard Ebooks** (real published text), statistical
  weightings **measured** from that text, generation+judging by **Opus via in-session
  subagents**. (400 rewrites.)

## Structure leaderboards side by side

| Structure | Pastiche A | Real A | ΔAccuracy | Pastiche overall | Real overall |
|---|---|---|---|---|---|
| Statistical fingerprint | 2.54 | **3.96** | **+1.42** | 3.03 (last) | 3.91 |
| Trait vector | 2.64 | **4.50** | **+1.86** | 3.35 | 4.09 |
| Persona prompt | 3.78 | 4.62 | +0.84 | 3.84 | **4.22 (1st)** |
| Hybrid | 4.01 | 4.42 | +0.41 | 3.88 | 4.17 |
| Anti-patterns | 3.82 | 4.50 | +0.68 | 3.78 | 4.15 |
| Voice memo | 3.95 | 4.26 | +0.31 | 3.93 (1st) | 4.00 |
| Rules list | 3.79 | 4.26 | +0.47 | 3.78 | 3.98 |
| Example pairs | 3.64 | 4.12 | +0.48 | 3.77 | 3.85 |

Aggregate (mean across structures): **accuracy 3.52 → 4.33 (+0.81)**, **usability 3.21 → 3.54
(+0.33)**. Structures clearing all three dimensions > 3.5: **0 of 8 → 5 of 8.**

## The robust finding: real *weightings* rescue the computational structures

The two structures that depend on **measured numbers** — statistical fingerprint and trait
vector — were **dead last and 7th** on pastiche (accuracy 2.54 / 2.64, essentially "numbers
that capture no voice"). On real corpus they jump to **3.96 and 4.50** accuracy. Trait vector
gains +1.86 — the largest move in the table.

This is internally clean: within the real cohort (same authors, same engine, same judges
across all 8 structures), the computational structures went from worst to mid-pack, and:
- **Statistical fingerprint has the best usability of any structure (3.88)** and clears all
  three thresholds.
- **Henry James's single best structure is the statistical fingerprint (4.70)** — e.g. its
  tweet, *"Remote work—will it go? It will not."* On pastiche, statistical was unusable.

Why it makes sense: a pastiche-derived fingerprint is largely fabricated noise; a fingerprint
**measured from real text** is signal (Woolf 22.8 semicolons/1k, Poe 21.2 em-dashes/1k, Joyce
1.4). Feed the model real weightings and the "just hit these numbers" structure suddenly works.

## Author difficulty (real cohort)

| Author | Accuracy | Distinct. |
|---|---|---|
| Henry James | 4.80 | 4.85 |
| Virginia Woolf | 4.34 | 4.21 |
| James Joyce | 4.31 | 4.20 |
| Edgar Allan Poe | 4.17 | 4.09 |
| F. Scott Fitzgerald | 4.03 | 4.00 |

Every real-corpus author scores accuracy ≥ 4.0; the pastiche cohort ranged 2.92–3.84. James is
uncanny (4.80) — a highly mannered voice + real text is the sweet spot.

## Honest caveats — this is NOT a clean A/B

Three things changed between the cohorts, not one. Attribute cautiously:
1. **Corpus** (pastiche → real) — the variable we care about.
2. **Author set** (10 modern → 5 canonical literary stylists). The 5 are inherently more
   mannered/distinctive, which inflates accuracy independent of corpus.
3. **Engine** (Sonnet-via-API generated *and* judged → Opus-via-subagent generated *and*
   judged). A stronger model writing and a stronger model grading both push scores up, and
   self-judging at the same tier may be generous.

So the headline **+0.81 accuracy is confounded** and should not be read as "real corpus = +0.81."
What *is* robust:
- The **within-real-cohort structure re-ranking** (statistical/trait vector go from last to
  competitive) — same engine/authors/judges across structures, and these are exactly the
  structures that consume measured data. Hardest to explain by anything but real weightings.
- The **caricature pattern persists** with real corpus: example_pairs is the worst usability
  (3.06) and the judges repeatedly flagged it lifting verbatim canon motifs (Gatsby's green
  light, Woolf's "leaden circles", Araby's cadence) — pastiche-by-quotation, not earned style.

## To make it a clean test (next experiment)

Re-run the **same 5 authors** twice with the **same Opus engine**, varying only the corpus:
once on real Standard Ebooks text, once on synthetic pastiche of those same 5. That isolates
corpus as the single variable and would give a defensible causal number. (Cheap: 5 authors ×
the pastiche imps + reuse the real ones.)

## Takeaways for the product

1. **Measured weightings are worth it specifically for the numeric structures.** If the
   production Imp includes a fingerprint/trait block, compute it from real text or don't bother —
   a guessed fingerprint scored *last*; a measured one ties for most usable.
2. **Persona prompt + hybrid + anti-patterns** lead the real cohort; voice memo (pastiche
   winner) is still strong but no longer alone. The earlier "voice memo is the one to ship"
   call softens — on real corpus several structures clear the bar.
3. **Usability is still the lowest dimension** (3.54) and still format-driven: blog/about/
   decline-email tolerate voice; landing hero / tweet / crisis apology fight it. The tone-
   slider recommendation stands.
4. **Caricature is corpus-independent** — even with real text, demonstration-by-example
   over-quotes signature motifs. The frequency-governor fix still applies.
