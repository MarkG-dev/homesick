"""
Richer stylometric features for the voice metric — no GPU, no external API.

Neural sentence embeddings would need Voyage/OpenAI, which this environment's egress blocks,
so we use the classical signal that authorship attribution has relied on for decades and that
is arguably *better* for a transparent "voice fingerprint":

  - function-word relative frequencies (Mosteller-Wallace): the/of/and/to/a/in/that/… — content
    is stripped away, leaving the author's structural habits. The strongest cheap author signal.
  - character n-gram (3-gram) profiles: capture morphology, punctuation runs, contraction habits.

Both become frequency vectors compared by cosine. wide_validation.py uses this to test whether
richer features make voice-match a trustworthy number where the 12-feature fingerprint did not.
"""
from __future__ import annotations

import math
import re
from collections import Counter

FUNCTION_WORDS = """a about above after again against all am an and any are aren't as at be
because been before being below between both but by can cannot could couldn't did didn't do
does doesn't doing don't down during each few for from further had hadn't has hasn't have
haven't having he he'd he'll he's her here here's hers herself him himself his how how's i i'd
i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself no
nor not of off on once only or other ought our ours ourselves out over own same shan't she
she'd she'll she's should shouldn't so some such than that that's the their theirs them
themselves then there there's these they they'd they'll they're they've this those through to
too under until up very was wasn't we we'd we'll we're we've were weren't what what's when
when's where where's which while who who's whom why why's with won't would wouldn't you you'd
you'll you're you've your yours yourself yourselves""".split()

_WORD = re.compile(r"[a-z']+")


def fw_vector(text: str) -> dict:
    words = _WORD.findall(text.lower())
    n = max(1, len(words))
    c = Counter(w for w in words if w in _FW_SET)
    return {w: c.get(w, 0) / n for w in FUNCTION_WORDS}


def char_ngram_vector(text: str, n: int = 3, top: int = 300) -> dict:
    t = re.sub(r"\s+", " ", text.lower())
    grams = Counter(t[i:i + n] for i in range(len(t) - n + 1))
    total = sum(grams.values()) or 1
    return {g: c / total for g, c in grams.most_common(top)}


def cosine(a: dict, b: dict) -> float:
    keys = set(a) | set(b)
    dot = sum(a.get(k, 0.0) * b.get(k, 0.0) for k in keys)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na and nb else 0.0


def cos_dist(a: dict, b: dict) -> float:
    return 1.0 - cosine(a, b)


_FW_SET = set(FUNCTION_WORDS)
