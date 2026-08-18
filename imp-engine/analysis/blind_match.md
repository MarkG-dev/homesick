# Blind-match test (success criterion #2)

A fresh Claude instance — with no access to the answer key and no knowledge of which
structure or author produced any text — was shown all **72 kickoff rewrites** stripped to
anonymous IDs (`LINKEDIN-01`, `BLOG-14`, `TWEET-09`, …), shuffled within each test case,
and asked to assign each to one of `hemingway`, `didion`, `thompson`.

## Result

| Slice | Correct | Accuracy |
|-------|---------|----------|
| **Overall** | **72 / 72** | **100%** (chance = 33%) |
| Hemingway | 24 / 24 | 100% |
| Didion | 24 / 24 | 100% |
| Thompson | 24 / 24 | 100% |
| LinkedIn post | 24 / 24 | 100% |
| Blog opening | 24 / 24 | 100% |
| Tweet (short-form) | 24 / 24 | 100% |

Confusion matrix is the identity matrix — zero cross-author errors.

## Reading

The criterion asked for ≥7/10 authors correctly matched; on the 3-author kickoff the blind
reader hit a clean sweep, including the short-form tweets where there is the least room for a
voice to assert itself. The classifier reported high confidence on ~66/72 and resolved the
~6 borderline cases (all Hemingway-vs-Didion first-person reflective lines) correctly on
rhythm and signature-phrase cues.

**Caveat for scaling:** these three voices were chosen for *maximum* distinctiveness. The
full 10-author run includes harder, more adjacent voices (Baldwin vs. Morrison; Parker vs.
Ephron) and a deliberately hard case (DFW, whose voice lives in recursive self-awareness more
than surface markers). Expect blind-match accuracy to fall from 100% as the field gets denser.
The kickoff confirms the ceiling is real; the full run measures where it lands.
