# Imp Library Engine — taste-structure tournament

An evaluation harness that answers one question:

> **What's the best way to structure a "taste profile" (an _Imp_) so that applying it to a
> generic AI draft produces output that is noticeably, verifiably different between authors —
> and recognizably _them_?**

This is not a product. It's a tournament: build Imps for real authors using many different
structural approaches, apply each to the same bland test drafts, and score which structures
produce the most distinctive, accurate, and still-usable rewrites.

---

## The experiment in one picture

```
corpus/          raw + cleaned author text (you supply licensed/PD text)
   │  ingest_corpus.py        clean → chunk → passages.jsonl
   ▼
imps/            8 structures × N authors      generate_imps.py
   │  A rules_list   B trait_vector   C voice_memo   D example_pairs
   │  E hybrid       F anti_patterns  G statistical  H persona_prompt
   ▼
test_cases/      10 bland drafts (LinkedIn post, tweet, crisis apology, …)
   │  run_tournament.py       imp × draft → rewrite
   ▼
results/         {author}/{structure}/{case}.txt
   │  run_evals.py            SEPARATE judge call, 1–5 on 3 dimensions
   ▼
evals/           {author}/{structure}/{case}.json
   │  analyze_results.py
   ▼
analysis/        5 markdown reports + the go/no-go verdict
```

Full run = 10 authors × 8 structures × 10 cases = **800 rewrites + 800 evals**.
The kickoff subset = 3 authors × 8 structures × 3 cases = **72**, to check the signal cheaply
before paying for the full grid.

## The 8 structures under test

| id | name | what it is |
|----|------|-----------|
| A `rules_list` | Rules list | 12–14 imperative editorial rules |
| B `trait_vector` | Trait vector | 15 taste axes scored 0.0–1.0 |
| C `voice_memo` | Voice memo | 200–300 word prose brief to a ghostwriter |
| D `example_pairs` | Example pairs | 8–10 generic→author before/after sentences |
| E `hybrid` | Hybrid | rules + memo + 5 pairs combined |
| F `anti_patterns` | Anti-patterns + patterns | "never does X" / "always does Y" lists |
| G `statistical` | Statistical fingerprint | computed metrics, **no LLM** |
| H `persona_prompt` | Persona prompt | "You are a writer who…" system prompt |

Two optional structures (I diff-derived rules, J ranked priorities) are described in the
kickoff brief and slot in the same way.

## Scoring

Every rewrite is scored 1–5 on three dimensions by a **separate** judge call (the generator
never scores its own output):

- **Distinctiveness** — could you tell it apart from other authors' rewrites of the same draft?
- **Accuracy** — does it actually read like the author?
- **Usability** — does it still function as the original content type?

## Layout

```
scripts/        ingest_corpus · generate_imps · run_tournament · run_evals · analyze_results · apply_imp
                imp_common (API client: cache + retry + rate-limit + token log) · imp_render · stats_fingerprint
prompts/        one template per generation structure + eval rubric + rewrite applier
corpus/ imps/ test_cases/ results/ evals/ analysis/
```

## Running it

Requires `ANTHROPIC_API_KEY` and `pip install anthropic`.

```bash
# 1. supply corpus: drop licensed/PD text into corpus/{slug}/raw/*.txt, then:
python scripts/ingest_corpus.py

# 2. build all Imps (LLM structures + computed statistical)
python scripts/generate_imps.py

# 3+4. kickoff subset first (72), then score it
python scripts/run_tournament.py --kickoff
python scripts/run_evals.py --kickoff

# 5. reports + verdict
python scripts/analyze_results.py

# scale to the full 800 once the signal checks out
python scripts/run_tournament.py && python scripts/run_evals.py && python scripts/analyze_results.py
```

Models default to `claude-sonnet-4-6` for generation/eval and `claude-opus-4-6` for the
production `apply_imp.py` (override via `IMP_GEN_MODEL` / `IMP_PROD_MODEL`). Every call is
cached on disk under `.cache/`, so re-runs only pay for new work. Token usage is appended to
`scripts/token_usage.jsonl`.

### Production use

```bash
python scripts/apply_imp.py --imp hemingway --input draft.txt --output result.txt --type "LinkedIn post"
echo "some bland draft" | python scripts/apply_imp.py --imp didion
```

## What's checked in vs. what you supply

This repo ships the full harness, the 10 test cases, all prompt templates, and a **worked
kickoff demonstration** for Hemingway / Didion / Thompson (Imps in `imps/`, rewrites in
`results/`, scores in `evals/`, reports in `analysis/`).

It does **not** ship author corpora: 8 of the 10 voices are in copyright, and the build
environment had no network access to public-domain archives. See `corpus/README.md`. The
kickoff demonstration was produced with Claude acting as the generation/eval engine
(separate instances for generation vs. scoring, mirroring the script design) because the
environment had no standalone `ANTHROPIC_API_KEY`; the numbers are real model judgements,
and the scripts reproduce the same flow against the API at scale.

See `analysis/taste_transfer_verdict.md` for the kickoff go/no-go read.
