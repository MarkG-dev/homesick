"""
Structure G: a purely computational style fingerprint. No LLM interpretation — just
counting. Operates on the cleaned passages of an author and emits a JSON-able dict.

Deliberately dependency-light (stdlib only) so it runs anywhere. Flesch-Kincaid uses a
heuristic syllable counter; it is an approximation, which is fine for relative comparison
across authors measured the same way.
"""
from __future__ import annotations

import re
from collections import Counter

STOPWORDS = set(
    """a an the and or but if then else when while of to in on at by for with about
    as into like through after over between out against during without before under
    around among is are was were be been being am do does did doing have has had having
    i you he she it we they me him her us them my your his its our their this that these
    those there here not no nor so too very can will just dont don't im i'm it's its'""".split()
)

_ADJ_ADV_SUFFIX = re.compile(r"(ly|ous|ful|ive|able|ible|al|ic|ish)$", re.I)
_WORD = re.compile(r"[A-Za-z']+")
_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")


def _syllables(word: str) -> int:
    word = word.lower()
    groups = re.findall(r"[aeiouy]+", word)
    n = len(groups)
    if word.endswith("e") and n > 1:
        n -= 1
    return max(1, n)


def compute_fingerprint(text: str) -> dict:
    paragraphs = [p for p in re.split(r"\n\s*\n", text) if p.strip()]
    sentences = [s for s in _SENT_SPLIT.split(text) if s.strip()]
    words = _WORD.findall(text)
    n_words = max(1, len(words))
    n_sent = max(1, len(sentences))

    sent_lens = [len(_WORD.findall(s)) for s in sentences] or [0]
    mean_len = sum(sent_lens) / len(sent_lens)
    variance = sum((x - mean_len) ** 2 for x in sent_lens) / len(sent_lens)

    para_lens = [len(_WORD.findall(p)) for p in paragraphs] or [0]

    content = [w.lower() for w in words if w.lower() not in STOPWORDS and len(w) > 2]
    top50 = [w for w, _ in Counter(content).most_common(50)]

    per_1k = lambda c: round(c / n_words * 1000, 2)  # noqa: E731
    adj_adv = sum(1 for w in words if _ADJ_ADV_SUFFIX.search(w))
    syll = sum(_syllables(w) for w in words)
    # Flesch-Kincaid grade level
    fk = 0.39 * (n_words / n_sent) + 11.8 * (syll / n_words) - 15.59

    dialogue_chars = len(re.findall(r"[“”\"']", text))
    return {
        "avg_sentence_length": round(mean_len, 2),
        "sentence_length_variance": round(variance, 2),
        "top_words": top50,
        "semicolons_per_1k": per_1k(text.count(";")),
        "em_dashes_per_1k": per_1k(text.count("—") + text.count("--")),
        "ellipses_per_1k": per_1k(text.count("…") + len(re.findall(r"\.\.\.", text))),
        "exclamations_per_1k": per_1k(text.count("!")),
        "questions_per_1k": per_1k(text.count("?")),
        "avg_paragraph_length": round(sum(para_lens) / max(1, len(para_lens)), 2),
        "dialogue_quote_marks_per_1k": per_1k(dialogue_chars),
        "flesch_kincaid_grade": round(fk, 2),
        "adj_adv_density_per_1k": per_1k(adj_adv),
        "type_token_ratio": round(len(set(w.lower() for w in words)) / n_words, 3),
    }


if __name__ == "__main__":
    import json
    import sys
    from pathlib import Path

    print(json.dumps(compute_fingerprint(Path(sys.argv[1]).read_text()), indent=2))
