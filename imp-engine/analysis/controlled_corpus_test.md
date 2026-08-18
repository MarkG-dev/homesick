# Controlled test — does real corpus actually help? (the clean A/B)

The earlier `real_vs_pastiche.md` compared the real-corpus 5 against the *pastiche 10* and saw a
huge accuracy jump (+0.81). But that was confounded by three changes at once (corpus, author set,
engine). This test removes two of them.

**Design:** the **same 5 authors** (Poe, James, Woolf, Joyce, Fitzgerald), the **same Opus
in-session engine** for generation *and* judging, the **same 10 test cases**, the **same 8
structures**. The **only** variable is the corpus the Imps were built from:
- **REAL** — actual published text (Standard Ebooks, 25–63k words/author).
- **PASTICHE** — 5 short synthetic passages/author, "in the style of," + model knowledge.

400 rewrites + 400 evals per arm. (Judge *instances* differ between arms — random noise, not
systematic bias.)

## Result: real corpus does NOT improve accuracy. It improves usability.

| Dimension | REAL | PASTICHE | Δ (real − pastiche) |
|---|---|---|---|
| Distinctiveness | 4.27 | 4.01 | **+0.25** |
| **Accuracy** | 4.33 | 4.41 | **−0.08 (null)** |
| **Usability** | 3.54 | 3.00 | **+0.53** |
| Overall | 4.04 | 3.81 | +0.23 |

**The accuracy gain vanished.** Pastiche Imps were *as accurate* as real-corpus Imps for these
authors — slightly higher, even. My earlier "+0.81 accuracy from real corpus" and "statistical
rescued from 2.54 → 3.96 by real weightings" claims were **almost entirely the author-set + engine
confound**, not the corpus. Controlled, they evaporate:

| Structure | Accuracy real vs pastiche | Usability real vs pastiche |
|---|---|---|
| statistical | 3.96 vs **4.06** (Δ−0.10) | 3.88 vs 3.24 (**Δ+0.64**) |
| trait_vector | 4.50 vs 4.54 (Δ−0.04) | 3.44 vs 2.80 (**Δ+0.64**) |
| hybrid | 4.42 vs 4.32 (Δ+0.10) | 3.74 vs 2.98 (**Δ+0.76**) |
| persona_prompt | 4.62 vs 4.64 (Δ−0.02) | 3.54 vs 2.92 (**Δ+0.62**) |
| anti_patterns | 4.50 vs 4.52 (Δ−0.02) | 3.66 vs 2.98 (**Δ+0.68**) |
| voice_memo | 4.26 vs 4.60 (Δ−0.34) | 3.62 vs 3.12 (Δ+0.50) |

Accuracy Δ is noise around zero across every structure; usability Δ is **+0.46 to +0.76**, positive
for 7 of 8. The statistical structure's accuracy is *identical* across arms — its earlier "rescue"
was the confound, full stop.

## Why accuracy didn't move: the model already memorized these authors

Poe, James, Woolf, Joyce, Fitzgerald are among the most-studied writers in English. The model's
parametric knowledge of their voice is so deep that "write in their style, drawing on your
knowledge" (with only 5 pastiche passages) reaches the same fidelity as feeding it *Mrs Dalloway*.
Real text had nothing to add to a voice the model already owns. Per-author accuracy is a wash
(Poe/James slightly favor real; Woolf/Joyce/Fitzgerald slightly favor pastiche).

## Why usability *did* move: real corpus prevents caricature

The judges independently and repeatedly described the **pastiche** pools as "homogeneous,"
"near-identical twins across structures," with "heavy cross-case repetition of motifs" (Gatsby's
green light, Woolf's "leaden circles" / "cupped hands," Poe's tapping pulse). Five short synthetic
passages give the Imp only a handful of signature tics, so the model **jams those tics everywhere**
— including where they break the content's job (a tweet ballooned past 280 chars, a recall apology
burying the safety danger under a periodic sentence). Real corpus (thousands of varied sentences)
captures *range*, not just the three loudest mannerisms, so outputs adapt to the format. That extra
range shows up as **+0.53 usability and +0.25 distinctiveness** — i.e. **less caricature**.

This matches the corpus-independent caricature finding from the main run: pastiche makes it worse
because it's a narrower source.

## The caveat that flips the product implication

This null-accuracy result holds **only because the authors are famous**. For a real product user —
an ordinary writer with no web presence the model has never read — parametric knowledge is ~zero,
so the corpus is the **only** signal of their voice. For them, real corpus should drive accuracy
too, not just usability. **The famous-author benchmark systematically *understates* the value of
real corpus**, because every benchmark author is one the model already memorized. The honest
takeaway:

- For **known/iconic voices**: real corpus buys *range and usability* (anti-caricature), not
  accuracy — the model already has the voice.
- For **unknown voices** (the actual product): expect real corpus to matter for accuracy as well,
  because there is no parametric prior to lean on. **This is the experiment still worth running** —
  build an Imp for a writer the model demonstrably doesn't know, from real samples vs. a
  description, and measure accuracy. That isolates the case the product actually serves.

## Bottom line

Real corpus is worth it — but for a different reason than assumed. It does not make a *famous*
voice more accurate (the model already nails it); it makes any voice **less of a caricature and
more usable** (+0.5 usability), by supplying range that thin pastiche cannot. The accuracy payoff
is expected to appear only for voices the model hasn't already memorized — which is precisely the
product's real user, and the next test to run.
