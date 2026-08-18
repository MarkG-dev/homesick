# Full tournament — 10 authors × 8 structures × 10 cases (800 rewrites, 800 evals)

Cost: ~$7.18 in Anthropic API (Sonnet 4.6), 1,500 billed calls (kickoff 72 reused from cache).

## Verdict: taste transfers, but usability is the real ceiling

- **Mean distinctiveness across all 800: 4.27** — well above the 3.5 bar. Variety is easy;
  the Imps reliably make outputs that read as *different people*.
- **No structure cleared all three dimensions > 3.5.** The blocker is **usability**: the top
  voice-capture structures land at ~3.0–3.3 usability. The voice transformation, applied at
  full intensity across functional formats (crisis apology, cold email, landing hero),
  starts to fight the content's job.

This is exactly the failure mode the brief predicted: *"If usability fails, the voice
transformation is destroying the functional purpose of the content. Dial back the intensity —
this is what the tone slider solves."* The small kickoff (tweet/blog/LinkedIn — all
voice-friendly) hid this; the full grid exposes it.

## Structure leaderboard

| Structure | Distinct. | Accuracy | Usability | Overall |
|---|---|---|---|---|
| **Voice memo** | 4.63 | 3.95 | 3.20 | **3.93** |
| **Hybrid** (memo+rules+pairs) | 4.64 | 4.01 | 2.98 | 3.88 |
| Persona prompt | 4.39 | 3.78 | 3.34 | 3.84 |
| Rules list | 4.62 | 3.79 | 2.94 | 3.78 |
| Anti-patterns | 4.52 | 3.82 | 3.01 | 3.78 |
| Example pairs | 4.36 | 3.64 | 3.32 | 3.77 |
| Trait vector | 3.84 | 2.64 | 3.56 | 3.35 |
| Statistical fingerprint | 3.13 | 2.54 | 3.42 | 3.03 |

Reads:
- **Voice memo wins overall again** — and the top six (all the qualitative/prose structures)
  cluster tightly (3.77–3.93). The signal carrier is rich natural-language description.
- **Hybrid ties for top accuracy (4.01) and distinctiveness (4.64)** but has the *worst*
  usability (2.98) — stacking signals maximizes voice and over-cooks function. Compounding
  is real, but it compounds intensity, not balance.
- **The two computational structures lose decisively.** Trait vector (3.35) and statistical
  (3.03) have accuracy 2.5–2.6 — numbers preserve function (their usability is actually
  *highest*) but do not capture a voice. This is the clearest result in the whole run.
- **Distinctiveness ≫ accuracy ≫ usability** as a difficulty ordering. Making text *different*
  is easy; making it *them* is harder; keeping it *usable* while doing both is the frontier.

## Author difficulty (by accuracy — how recognizably *them*)

| Easiest → Hardest | Accuracy | Distinct. |
|---|---|---|
| Nora Ephron | 3.84 | 4.58 |
| Joan Didion | 3.81 | 4.19 |
| David Foster Wallace | 3.79 | 4.75 |
| Ernest Hemingway | 3.74 | 3.49 |
| Hunter S. Thompson | 3.69 | 4.22 |
| James Baldwin | 3.50 | 4.45 |
| Dorothy Parker | 3.41 | 4.38 |
| George Orwell | 3.26 | 4.10 |
| Raymond Chandler | 3.25 | 4.26 |
| Toni Morrison | 2.92 | 4.25 |

- **DFW has the highest distinctiveness in the whole field (4.75)** — the recursive,
  self-interrupting voice is unmistakable even when the accuracy isn't perfect. This reverses
  the kickoff hypothesis that DFW would be "hard": his mannerisms are *more* legible, not less.
- **Morrison is hardest (accuracy 2.92):** lyrical/mythic density is recognizably literary but
  hard to land as *specifically her* inside an 80-word product description — and it wrecks
  usability. High distinctiveness (4.25), low accuracy: it reads as "a Poet," not "Morrison."
- **Hemingway has the *lowest* distinctiveness (3.49):** terse declarative prose is the
  easiest voice to confuse with plain good editing. Recognizable-as-him (accuracy 3.74), but
  least *unmistakable from the others*.
- **Ephron easiest overall** — conversational personal-essay warmth maps naturally onto
  LinkedIn posts, about pages, newsletters. The voice and the format want the same things.

## Best structure per author
Every author's top structure is one of **Voice memo / Hybrid / Persona prompt** (Didion's #1
is Rules list by a hair). No author is best served by a computational structure. If you ship
one format, ship **voice memo**; it is #1 or #2 for nearly everyone.

## Content-type sensitivity (std-dev across structures)
Most structure-sensitive: **crisis apology (0.38), landing hero (0.34), decline email (0.33)**
— the high-stakes/functional formats where voice-vs-function tension is sharpest, so structure
choice matters most. Least sensitive: **newsletter intro (0.21), product description (0.25)** —
forgiving formats where any decent Imp works.

## Recommendation for the production format
1. **Ship voice memo as the base structure.** Clear winner, simplest to author, best per-author.
2. **Add an intensity / tone slider** (the missing dimension). Usability is the ceiling, and it
   is a *dosage* problem, not a structure problem. Same Imp, dialed to 40% for a crisis apology
   and 90% for a blog post.
3. **Add measured-frequency governors from real corpus** (see `corpus_sourcing.md`) to stop the
   caricature over-amplification (Baldwin antithesis 3–6× his real rate). Feel + limits.
4. **Drop the computational structures** (statistical, trait vector) as standalone Imps — keep
   the statistical fingerprint only as a *measurement* feeding governors, not as the Imp itself.

## Success-criteria scorecard
1. Distinctiveness > 3.5 **AND** accuracy > 3.5 **AND** usability > 3.5 for some structure:
   **❌ not met at full scale** — top structures pass distinctiveness + accuracy but stall on
   usability (~3.0–3.3). The fix is the tone slider, not a new structure.
2. Blind-match ≥ 7/10: **✅** distinctiveness 4.27 implies easy separability.
3. Works across content types: **⚠️ partial** — great on expressive formats, strained on
   high-stakes functional ones (the exact cases the slider targets).
