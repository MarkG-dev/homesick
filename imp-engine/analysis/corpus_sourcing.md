# Real-corpus sourcing & a corpus-grounded Imp architecture

Motivation: the tournament showed a **caricature failure** — the model over-applies an
author's single most quotable tic (e.g. Baldwin's "not X, it is Y" antithesis at ~0.3–0.6
per 100 words vs. ~0.05–0.10 in his real essays). The root cause is that Imps are built
from the model's *impression* of a voice, with no measured ground truth to rein it in. The
fix is to ingest **real** text and encode **measured frequencies** as governors in the Imp.

## What is actually pullable (US public domain, 2026 = published before 1931)

| Author | Legal status (2026) | Source | Notes |
|---|---|---|---|
| **Hemingway** | ✅ US PD | Project Gutenberg | *In Our Time* (1925, 61085), *Three Stories & Ten Poems* (1923), *The Sun Also Rises* (1926, 67138), *Men Without Women* (1927, 69683). Rich prose. |
| **Parker** | ✅ US PD | Project Gutenberg | *Enough Rope* (1926, 68353) + *Sunset Gun* (1928). Mostly **verse**, less ideal for prose-voice. Early stories also PD. |
| **Orwell** | ⚠️ PD in AU only | Project Gutenberg **Australia** (gutenberg.net.au) | *Animal Farm*, *1984*, *Down and Out*, essays. PD in life+70 countries (d.1950 → 2021), **not** US PD. Pull legality depends on server jurisdiction. |
| **Chandler** | ❌ in copyright | — | First pulp 1933 → US PD in 2029. Nothing available now. |
| Didion, Baldwin, Wallace, Morrison, Thompson, Ephron | ❌ in copyright | — | All post-1950 work. No legal bulk source. |

So **automated "pull from Gutenberg" only solves 2–3 of 10**. Any architecture that depends
on pulling all ten authors' real text is legally impossible today.

### Other PD/legal sources worth wiring in
- **Standard Ebooks** (standardebooks.org) — same PD texts, already cleaned/normalized (less boilerplate-stripping work than Gutenberg).
- **Wikisource** — PD essays/short pieces, good for authors with thin book-length PD.
- **Project Gutenberg Australia / Canada** — life+70 jurisdictions (Orwell, some others earlier than US).
- **GITenberg** (github.com/GITenberg) — Gutenberg books mirrored as git repos (convenient programmatic pull where GitHub is reachable).
- **Internet Archive** — scans + controlled digital lending; **not** a bulk-download source for in-copyright works.

## The real product reframe

The famous-author tournament is an **R&D benchmark**, not the product. The product's actual
corpus is *the user's own past writing* — which they supply. So the ingestion design only
needs two tiers:

1. **Public-domain fixtures** (Hemingway, Parker, Orwell): auto-fetch for benchmarking.
2. **Everything else** (in-copyright authors *and* real users): operator/user supplies text
   into `corpus/{slug}/raw/`. This already works via `ingest_corpus.py`.

## Proposed simple architecture: measured-governor Imp

Keep the winning structure (voice_memo) and add a small **measured-frequency block** derived
from the real corpus — this is "Hybrid done right": qualitative feel + quantitative limits.

```
fetch_corpus.py        # NEW: pull PD authors from a sources table (runs where net is open)
  sources.yaml         #   author -> [urls], license, jurisdiction
ingest_corpus.py       # existing clean+chunk (unchanged)
stats_fingerprint.py   # EXTEND: also measure rhetorical-device rates, not just punctuation:
                        #   antithesis/100w, anaphora/100w, simile/100w,
                        #   rhetorical_question/100w, avg/short-sentence ratio
generate_imps.py       # voice_memo + a "governors" block built from the measured rates:
                        #   "antithesis: 0.08/100w — rare, reserve for the climactic line"
                        #   "anaphora: 0.40/100w — frequent; repeat the subject, not the negation"
```

Why this fixes caricature: the model is no longer guessing how often to deploy a tic — it's
told the real rate measured from the source, and told which device actually carries the
voice (Baldwin = anaphora, not antithesis). One measured block, no new structure to design.

## Environment caveat

This Claude Code sandbox blocks outbound web (curl + WebFetch both 403 via egress policy);
only WebSearch and the Anthropic API are reachable. The `fetch_corpus.py` step must run
where the network is open (a local machine or an unrestricted runner), then the cleaned
`passages.jsonl` is committed and the rest of the pipeline runs anywhere.
