# Corpus

This directory holds the raw and cleaned text used to build each author's Imp.

## How sourcing works

`ingest_corpus.py` does **not** download anything. Two reasons:

1. **Network policy.** In the Claude Code remote environment this was built in,
   outbound HTTPS is restricted to an allowlist (Anthropic, PyPI, npm). Project
   Gutenberg, Wikisource, and other archives return 403. Corpus must be supplied
   by the operator.
2. **Copyright.** Only 2 of the 10 voices are comfortably public domain in the US
   (early **Hemingway**, pre-1930; **Orwell**'s situation varies by title/territory).
   The other eight — Didion, Chandler, Baldwin, Parker, Wallace, Morrison,
   Thompson, Ephron — are in copyright. Their full text is **not** redistributed here.

## To build a real corpus

For each author, drop licensed/public-domain raw text into:

```
corpus/{slug}/raw/*.txt          # one or more files
corpus/{slug}/raw.txt            # or a single file
```

Then run `python scripts/ingest_corpus.py {slug}` to clean and chunk it into
`corpus/{slug}/passages.jsonl` (each line `{"text": ..., "source": ...}`).
Aim for the 15,000–25,000 words/author the experiment calls for.

## What's checked in now

The three kickoff authors (`hemingway`, `didion`, `thompson`) ship with a small
`passages.jsonl` of **original style pastiche** — text written for this repo to
imitate each voice, labeled `"source": "synthetic-pastiche"`. It exists so the
statistical fingerprint (Structure G) and the full pipeline run end-to-end without
redistributing copyrighted work. **Replace it with real licensed text before
treating any statistical numbers as authoritative.** The hand-authored Imps in
`imps/` are derived from style analysis, which is not a reproduction of the
authors' protected text.
