#!/usr/bin/env python3
"""
Fetch REAL public-domain corpus from Standard Ebooks' GitHub repos.

Standard Ebooks (https://standardebooks.org) publishes professionally proofread,
public-domain texts, source-hosted on GitHub. We list each book's text directory
once via the GitHub API, then pull the chapter files from the raw CDN
(raw.githubusercontent.com, which is not rate-limited), strip the XHTML to plain
text, concatenate, cap the word count, and write corpus/{slug}/raw.txt.

Why this source: Project Gutenberg itself is blocked by this environment's egress
policy, but GitHub's API + raw CDN are reachable. Standard Ebooks text is cleaner
than Gutenberg (no boilerplate, consistent markup), so cleanup is trivial.

After fetching, run ingest_corpus.py to chunk raw.txt into passages.jsonl.

Usage:
  python fetch_corpus.py                 # all authors in SOURCES
  python fetch_corpus.py poe fitzgerald  # subset
"""
from __future__ import annotations

import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request

from imp_common import CORPUS

# slug -> Standard Ebooks repo(s). Multiple repos are concatenated.
SOURCES = {
    "poe":        ["edgar-allan-poe_short-fiction"],
    "james":      ["henry-james_the-turn-of-the-screw"],
    "woolf":      ["virginia-woolf_mrs-dalloway"],
    "joyce":      ["james-joyce_dubliners"],
    "fitzgerald": ["f-scott-fitzgerald_the-great-gatsby"],
}

CAP_WORDS = 25_000
# Front/back matter we never want in a style corpus.
SKIP = {"titlepage", "halftitlepage", "imprint", "colophon", "uncopyright",
        "dedication", "epigraph", "endnotes", "copyright", "loi", "toc"}
RAW = "https://raw.githubusercontent.com/standardebooks/{repo}/master/src/epub/text/{name}"
API = "https://api.github.com/repos/standardebooks/{repo}/contents/src/epub/text"


def _get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "imp-engine-corpus"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def _strip_xhtml(x: str) -> str:
    x = re.sub(r"(?s)<(head|style|title).*?</\1>", " ", x)
    x = re.sub(r"(?s)<[^>]+>", " ", x)          # drop tags
    x = html.unescape(x)
    x = re.sub(r"[ \t]+", " ", x)
    x = re.sub(r"\n\s*\n\s*\n+", "\n\n", x)
    return x.strip()


def list_text_files(repo: str) -> list[str]:
    data = json.loads(_get(API.format(repo=repo)))
    names = [f["name"] for f in data if f["name"].endswith(".xhtml")]
    # keep content files; SKIP set + the author-bio file (named like the author) drop out
    # later by the word-count filter.
    return [n for n in names if n[:-6] not in SKIP]


def fetch_author(slug: str, repos: list[str]) -> int:
    chunks, total = [], 0
    for repo in repos:
        for name in list_text_files(repo):
            if total >= CAP_WORDS:
                break
            try:
                text = _strip_xhtml(_get(RAW.format(repo=repo, name=name)).decode("utf-8", "ignore"))
            except Exception as e:  # skip a missing/odd file, keep going
                print(f"    {name}: skip ({e})")
                continue
            if len(text.split()) < 150:          # drops residual front/back matter
                continue
            chunks.append(text)
            total += len(text.split())
    if not chunks:
        print(f"  {slug}: nothing fetched")
        return 0
    out_dir = CORPUS / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "raw.txt").write_text("\n\n".join(chunks))
    print(f"  {slug}: ~{total:,} words from {len(chunks)} sections -> {out_dir/'raw.txt'}")
    return total


def main() -> None:
    slugs = sys.argv[1:] or list(SOURCES)
    for slug in slugs:
        if slug not in SOURCES:
            print(f"  {slug}: no source configured, skipping")
            continue
        fetch_author(slug, SOURCES[slug])
        time.sleep(1)  # be polite to the API
    print("done. now run: python ingest_corpus.py " + " ".join(slugs))


if __name__ == "__main__":
    main()
