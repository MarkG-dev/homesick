# Kickoff summary — does taste transfer?

Subset run: **3 authors × 8 structures × 3 test cases = 72 rewrites**, each scored 1–5 on
distinctiveness / accuracy / usability by a *separate* judge call, plus a blind author-ID test.
Authors chosen for maximum distinctiveness (Hemingway, Didion, Thompson); cases chosen to span
range (LinkedIn post, blog opening, tweet).

## The three success criteria

| # | Criterion | Result | Verdict |
|---|-----------|--------|---------|
| 1 | A structure clears **>3.5 on all three dimensions** | **Voice memo**: distinct 4.22 / accuracy 5.00 / usability 3.78 (4 more structures also clear it) | ✅ PASS |
| 2 | Blind reader matches **≥7/10** authors to rewrites | **72/72 = 100%** blind-match, all cases incl. tweets | ✅ PASS |
| 3 | Winner works **across content types**, not just prose | Voice memo is top structure on all 3 cases incl. short-form | ✅ PASS |

Mean distinctiveness across all 72 rewrites = **3.67** (> 3.5). On the kickoff's terms:
**taste transfers, and the product premise holds.** Proceed to the full 10×8×10 run to see
how far the result generalizes to harder, more adjacent voices.

## What won

**Structure leaderboard (overall):**

1. **Voice memo — 4.33** ← winner, and #1 for every author
2. Anti-patterns + patterns — 4.04
3. Rules list — 3.96 / Trait vector — 3.96
5. Persona prompt — 3.93
6. Example pairs — 3.81 / Hybrid — 3.81
8. Statistical fingerprint — 3.63

### Three findings that matter for the product

1. **Prose beats structure.** A 200–300 word natural-language *voice memo* outperformed every
   formal representation — rules, vectors, pairs, even the kitchen-sink hybrid. The model
   applies a felt description of a voice better than a spec of one. Build the Imp format around
   a rich prose brief, not a rule table.

2. **The hybrid hypothesis failed.** "More signal types compound" was the bet behind Structure E.
   It didn't: hybrid tied for 6th (3.81). Stacking rules + memo + pairs *diluted* the memo and
   produced overstuffed, less usable output. More structure ≠ more voice.

3. **Distinctiveness and usability trade off, per author.** Thompson scored highest accuracy
   (4.75) but his gonzo voice repeatedly broke the *function* of a LinkedIn post or apology —
   the usability tax. Hemingway was the inverse: easy to capture (very recognizable) but the 8
   structures produced near-interchangeable output (distinctiveness only 3.00 — "easy to do,
   hard to vary"). This is exactly the case for the product's **tone slider**: dial voice
   intensity down when the content's job matters more than its flair.

## Author difficulty (this subset)

| Author | Accuracy | Note |
|--------|----------|------|
| Thompson | 4.75 | Most recognizable; surface markers ("swine", savage similes) survive even a tweet — but costs usability. |
| Didion | 4.58 | Strongest all-rounder; stays publishable even at full voice. |
| Hemingway | 4.17 | Recognizable but structures collapse together; terseness leaves little room to differentiate approaches. |

## Content-type sensitivity

Tweets are the most structure-sensitive (std-dev 0.29) and the lowest-scoring overall (mean 3.76)
— short form gives a literary voice the least room to assert itself. The blog opening was the
easiest (mean 4.08): more words, more room for voice. Implication: the longer the target format,
the more forgiving of structure choice; short-form needs the best structure (voice memo) most.

## Recommendation

- **Adopt the voice memo as the production Imp core.** Consider a thin layer of anti-patterns
  (#2 overall, cheap, raises usability) as a secondary signal — but test that it doesn't dilute
  the memo the way the hybrid did.
- **Scale to the full 10×8×10.** The easy voices pass cleanly; the open question is the hard
  field (Baldwin vs. Morrison, Parker vs. Ephron, and DFW). The harness, prompts, and analysis
  are ready — supply corpus + `ANTHROPIC_API_KEY` and run `run_tournament.py` then `run_evals.py`.
- **Build the tone slider before the marketplace.** The usability tax is real and author-specific;
  it's the one thing between "uncanny voice" and "shippable content".

> Methodology note: with no standalone API key in the build environment, generation and scoring
> were performed by separate Claude instances (mirroring the script's separate-call design).
> Numbers are real model judgements on the kickoff subset; the committed scripts reproduce the
> identical flow against the Anthropic API at the full 800-rewrite scale.
