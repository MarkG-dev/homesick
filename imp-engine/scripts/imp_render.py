"""
Turn a stored Imp (any structure) into the text block that gets injected into the
rewrite prompt. Each structure is serialized in the form that best plays to its shape:
a rules list as a checklist, a trait vector as annotated scales, etc.

Kept separate from the tournament runner so the "how do we present this structure to
the model" decision lives in one place and can be tuned without touching control flow.
"""
from __future__ import annotations

import json
from pathlib import Path

from imp_common import IMPS, STRUCTURES


def _vec_line(axis: str, val: float) -> str:
    # A little verbal anchoring so the model reads the number as a position, not a probability.
    bar = "#" * round(val * 10) + "." * (10 - round(val * 10))
    return f"  {axis:<22} {val:>4.2f}  [{bar}]"


def render_imp(slug: str, structure: str) -> str:
    data = json.loads((IMPS / slug / f"{structure}.json").read_text())
    return render_payload(structure, data.get("imp", data))


def render_payload(structure: str, body) -> str:
    """Render an in-memory imp payload (no file read) — used by the web app."""
    if structure == "rules_list":
        return "Follow every rule:\n" + "\n".join(f"  - {r}" for r in body)

    if structure == "trait_vector":
        head = "Style coordinates (0.0 = first pole, 1.0 = second pole). Hit these positions:\n"
        return head + "\n".join(_vec_line(k, float(v)) for k, v in body.items())

    if structure == "voice_memo":
        return body["voice_memo"] if isinstance(body, dict) else str(body)

    if structure == "example_pairs":
        out = ["Rewrite in the spirit of these before/after pairs:"]
        for p in body:
            out.append(f"  GENERIC: {p['generic']}\n  VOICE:   {p['author']}")
        return "\n".join(out)

    if structure == "hybrid":
        parts = ["VOICE BRIEF:", body["voice_memo"], "", "RULES:"]
        parts += [f"  - {r}" for r in body["rules"]]
        parts += ["", "BEFORE / AFTER:"]
        for p in body["pairs"]:
            parts.append(f"  GENERIC: {p['generic']}\n  VOICE:   {p['author']}")
        return "\n".join(parts)

    if structure == "anti_patterns":
        out = ["NEVER do these:"]
        out += [f"  - {x}" for x in body["never"]]
        out += ["ALWAYS do these:"]
        out += [f"  - {x}" for x in body["always"]]
        return "\n".join(out)

    if structure == "statistical":
        # A computed fingerprint reads best as a labeled spec the model can target.
        lines = ["Quantitative fingerprint of the target voice. Reproduce these tendencies:"]
        for k, v in body.items():
            if isinstance(v, list):
                lines.append(f"  {k}: {', '.join(map(str, v[:25]))}")
            else:
                lines.append(f"  {k}: {v}")
        return "\n".join(lines)

    if structure == "persona_prompt":
        return body["persona_prompt"] if isinstance(body, dict) else str(body)

    raise ValueError(f"unknown structure {structure!r}; known: {list(STRUCTURES)}")


if __name__ == "__main__":  # quick manual check: python imp_render.py hemingway rules_list
    import sys

    print(render_imp(sys.argv[1], sys.argv[2]))
