#!/usr/bin/env python3
"""
Phase 1 — corpus ingestion.

Reads raw text the user has placed in corpus/{slug}/raw/*.txt (or a single
corpus/{slug}/raw.txt), strips Project Gutenberg boilerplate, normalizes whitespace,
splits into ~200–500 word passages, and writes corpus/{slug}/passages.jsonl.

It does NOT download anything. In this environment outbound access to Gutenberg and
other archives is blocked by the egress policy, and 8 of the 10 authors are still in
copyright — so raw text must be supplied by the operator under whatever license they
hold. This script is the deterministic clean+chunk step that turns that into passages.

Usage:
  python ingest_corpus.py                # all authors that have raw text
  python ingest_corpus.py hemingway      # one author
"""
from __future__ import annotations

import json
import re
import sys

from imp_common import AUTHORS, CORPUS

GUTENBERG_START = re.compile(r"\*\*\* ?START OF .*?\*\*\*", re.I | re.S)
GUTENBERG_END = re.compile(r"\*\*\* ?END OF .*?\*\*\*", re.I | re.S)


def strip_boilerplate(text: str) -> str:
    if (m := GUTENBERG_START.search(text)):
        text = text[m.end():]
    if (m := GUTENBERG_END.search(text)):
        text = text[: m.start()]
    return text


def normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_passages(text: str, lo: int = 200, hi: int = 500) -> list[str]:
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    passages, buf, count = [], [], 0
    for p in paras:
        w = len(p.split())
        if count and count + w > hi:
            passages.append(" ".join(buf))
            buf, count = [], 0
        buf.append(p)
        count += w
        if count >= lo:
            passages.append(" ".join(buf))
            buf, count = [], 0
    if buf:
        passages.append(" ".join(buf))
    return [p for p in passages if len(p.split()) >= 40]


def raw_sources(slug: str) -> list[tuple[str, str]]:
    d = CORPUS / slug
    out = []
    raw_dir = d / "raw"
    if raw_dir.is_dir():
        for f in sorted(raw_dir.glob("*.txt")):
            out.append((f.name, f.read_text()))
    if (d / "raw.txt").exists():
        out.append(("raw.txt", (d / "raw.txt").read_text()))
    return out


def ingest(slug: str) -> int:
    sources = raw_sources(slug)
    if not sources:
        print(f"  {slug}: no raw text in corpus/{slug}/raw/ — skipping")
        return 0
    rows = []
    for name, raw in sources:
        cleaned = normalize(strip_boilerplate(raw))
        for passage in split_passages(cleaned):
            rows.append({"text": passage, "source": name})
    out = CORPUS / slug / "passages.jsonl"
    out.write_text("\n".join(json.dumps(r) for r in rows) + "\n")
    words = sum(len(r["text"].split()) for r in rows)
    print(f"  {slug}: {len(rows)} passages, ~{words:,} words -> {out}")
    return len(rows)


def main() -> None:
    slugs = sys.argv[1:] or [s for s, _ in AUTHORS]
    total = 0
    for slug in slugs:
        total += ingest(slug)
    print(f"done. {total} passages total.")


if __name__ == "__main__":
    main()
