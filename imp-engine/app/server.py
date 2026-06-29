#!/usr/bin/env python3
"""
Voice Filter — a small web app on top of the Imp engine.

Flow:
  1. Upload one or more writing samples (files) and/or paste text  -> build a "voice".
     We clean+chunk the corpus, measure a statistical fingerprint locally, and generate
     all eight Imp structures (the "prompt formats") from it.
  2. Paste a draft, pick a format, set the tone/intensity slider   -> rewrite in that voice,
     shown side-by-side with an inline word diff.

Reuses the research pipeline directly (scripts/): ingest, stats_fingerprint, imp_render,
prompt templates, and the cached/rate-limited Anthropic client. Needs ANTHROPIC_API_KEY.

Run:  pip install flask  &&  python app/server.py     (then open http://localhost:5001)
"""
from __future__ import annotations

import json
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from difflib import SequenceMatcher
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from imp_common import call_claude, load_prompt, extract_json, GEN_MODEL, PROD_MODEL  # noqa: E402
from ingest_corpus import normalize, strip_boilerplate, split_passages  # noqa: E402
from stats_fingerprint import compute_fingerprint  # noqa: E402
from imp_render import render_payload  # noqa: E402
from voice_score import slop_index, _BUZZ, _NEG  # noqa: E402
import re as _re  # noqa: E402

DATA = Path(__file__).resolve().parent / "data" / "voices"
DATA.mkdir(parents=True, exist_ok=True)
STATIC = Path(__file__).resolve().parent / "static"

app = Flask(__name__)

# Which structures to build, and the template that generates each. statistical = local,
# hybrid = assembled. These are the "different prompt formats" surfaced in the UI.
LLM_FORMATS = {
    "voice_memo": "gen_voice_memo.txt",
    "rules_list": "gen_rules_list.txt",
    "anti_patterns": "gen_anti_patterns.txt",
    "persona_prompt": "gen_persona_prompt.txt",
    "trait_vector": "gen_trait_vector.txt",
    "example_pairs": "gen_example_pairs.txt",
}
FORMAT_LABELS = {
    "voice_memo": "Voice memo", "hybrid": "Hybrid", "anti_patterns": "Anti-patterns",
    "persona_prompt": "Persona prompt", "rules_list": "Rules list",
    "trait_vector": "Trait vector", "example_pairs": "Example pairs",
    "statistical": "Statistical fingerprint",
}

TONE_GUIDE = {  # slider 0-100 -> instruction injected into the rewrite
    "low": "Apply the voice LIGHTLY (~30%). Prioritise the draft's function and clarity; "
           "let only a few signature moves through. It must read as clean, normal copy first.",
    "med": "Apply the voice at MEDIUM strength (~60%). Clearly in-voice but still smooth "
           "and fully usable as the content type.",
    "high": "Apply the voice FULLY (~90%). Commit hard to the style even at some cost to "
            "convention, while keeping the core facts and purpose intact.",
}


def _tone_bucket(t: int) -> str:
    return "low" if t < 40 else ("med" if t < 75 else "high")


# ---------------------------------------------------------------------------
# Build a voice from corpus
# ---------------------------------------------------------------------------

def _gen_format(structure: str, author_name: str, corpus: str) -> tuple[str, object]:
    tmpl = load_prompt(LLM_FORMATS[structure])
    raw = call_claude(tmpl.format(author_name=author_name, corpus=corpus),
                      max_tokens=4000, temperature=0.6, tag=f"app-gen:{structure}")
    return structure, extract_json(raw)


def build_voice(name: str, raw_text: str) -> dict:
    cleaned = normalize(strip_boilerplate(raw_text))
    passages = split_passages(cleaned) or [cleaned]
    corpus_blob = "\n\n".join(passages)[:12000]
    fingerprint = compute_fingerprint("\n\n".join(passages))

    imps: dict[str, object] = {"statistical": fingerprint}
    # generate the six LLM formats concurrently (cached + rate-limited under the hood)
    with ThreadPoolExecutor(max_workers=6) as ex:
        for structure, payload in ex.map(
            lambda s: _gen_format(s, name, corpus_blob), LLM_FORMATS
        ):
            imps[structure] = payload
    # hybrid is assembled from the others
    memo = imps["voice_memo"]
    imps["hybrid"] = {
        "voice_memo": memo["voice_memo"] if isinstance(memo, dict) else memo,
        "rules": imps["rules_list"][:10],
        "pairs": imps["example_pairs"][:5],
    }

    vid = uuid.uuid4().hex[:12]
    word_count = sum(len(p.split()) for p in passages)
    meta = {
        "id": vid, "name": name, "word_count": word_count,
        "passages": len(passages), "fingerprint": fingerprint, "imps": imps,
    }
    (DATA / f"{vid}.json").write_text(json.dumps(meta))
    return meta


# ---------------------------------------------------------------------------
# Rewrite + diff
# ---------------------------------------------------------------------------

def inline_diff(a: str, b: str) -> str:
    aw, bw = a.split(), b.split()
    sm = SequenceMatcher(None, aw, bw)
    out = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        seg = " ".join(bw[j1:j2])
        if op == "equal":
            out.append(_esc(seg))
        elif op in ("replace", "insert"):
            if seg:
                out.append(f'<ins>{_esc(seg)}</ins>')
    return " ".join(out)


def _esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def rewrite(meta: dict, structure: str, draft: str, tone: int, content_type: str) -> dict:
    payload = meta["imps"][structure]
    tmpl = load_prompt("rewrite_apply.txt")
    prompt = tmpl.format(
        content_type=content_type or "piece of writing",
        structure_label=FORMAT_LABELS.get(structure, structure),
        imp_render=render_payload(structure, payload),
        draft=draft.strip(),
    )
    prompt += "\n\nTONE / INTENSITY: " + TONE_GUIDE[_tone_bucket(tone)]
    out = call_claude(prompt, model=GEN_MODEL, max_tokens=1500, temperature=0.8,
                      tag=f"app-rewrite:{structure}").strip()
    return {"original": draft, "rewritten": out, "diff_html": inline_diff(draft, out)}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def index():
    return send_from_directory(STATIC, "index.html")


@app.get("/slop")
def slop_page():
    return send_from_directory(STATIC, "slop.html")


def _slop_analyse(text: str) -> dict:
    words = max(1, len(text.split()))
    per1k = slop_index(text)
    score = min(100, round(per1k * 4))          # ~25 markers/1k -> 100 (generic AI baseline ~21)
    # collect flagged spans (buzzword/cliche + negation-antithesis), de-duplicated by position
    spans = []
    for m in _BUZZ.finditer(text):
        spans.append((m.start(), m.end(), "buzz"))
    for pat in _NEG:
        for m in _re.finditer(pat, text, _re.I):
            spans.append((m.start(), m.end(), "neg"))
    spans.sort()
    merged, last = [], -1
    for s, e, k in spans:
        if s >= last:
            merged.append((s, e, k)); last = e
    # build highlighted html
    out, i = [], 0
    for s, e, k in merged:
        out.append(_esc(text[i:s])); out.append(f'<mark class="{k}">{_esc(text[s:e])}</mark>'); i = e
    out.append(_esc(text[i:]))
    counts = {"cliche/buzzword": sum(1 for _ in _BUZZ.finditer(text)),
              "negation-antithesis": sum(len(_re.findall(p, text, _re.I)) for p in _NEG)}
    fp = compute_fingerprint(text)
    level = ("Heavy AI slop" if score >= 60 else "Some AI tells" if score >= 25 else "Clean")
    return {
        "words": words, "markers_per_1k": per1k, "score": score, "level": level,
        "counts": counts, "highlighted_html": "".join(out),
        "punctuation": {"em_dashes_per_1k": fp["em_dashes_per_1k"],
                        "avg_sentence_length": fp["avg_sentence_length"],
                        "exclamations_per_1k": fp["exclamations_per_1k"]},
    }


@app.post("/api/slop")
def api_slop():
    d = request.get_json(force=True)
    text = (d.get("text") or "").strip()
    if len(text.split()) < 5:
        return jsonify({"error": "paste a bit more text"}), 400
    return jsonify(_slop_analyse(text))


@app.get("/static/<path:p>")
def static_files(p):
    return send_from_directory(STATIC, p)


@app.get("/api/voices")
def list_voices():
    out = []
    for f in sorted(DATA.glob("*.json")):
        m = json.loads(f.read_text())
        out.append({"id": m["id"], "name": m["name"], "word_count": m["word_count"]})
    return jsonify(out)


@app.get("/api/voices/<vid>")
def get_voice(vid):
    f = DATA / f"{vid}.json"
    if not f.exists():
        return jsonify({"error": "not found"}), 404
    m = json.loads(f.read_text())
    return jsonify({
        "id": m["id"], "name": m["name"], "word_count": m["word_count"],
        "passages": m["passages"], "fingerprint": m["fingerprint"],
        "formats": {k: FORMAT_LABELS[k] for k in m["imps"]},
        "imps": m["imps"],
    })


@app.post("/api/voices")
def create_voice():
    name = (request.form.get("name") or "My voice").strip()
    parts = [request.form.get("text", "")]
    for f in request.files.getlist("files"):
        try:
            parts.append(f.read().decode("utf-8", "ignore"))
        except Exception:
            continue
    raw = "\n\n".join(p for p in parts if p and p.strip())
    if len(raw.split()) < 100:
        return jsonify({"error": "Need at least ~100 words of writing to build a voice."}), 400
    try:
        meta = build_voice(name, raw)
    except Exception as e:  # surface generation/API errors to the UI
        return jsonify({"error": f"build failed: {e}"}), 500
    return jsonify({"id": meta["id"], "name": meta["name"],
                    "word_count": meta["word_count"], "passages": meta["passages"]})


@app.post("/api/rewrite")
def do_rewrite():
    d = request.get_json(force=True)
    f = DATA / f"{d.get('voice_id')}.json"
    if not f.exists():
        return jsonify({"error": "voice not found"}), 404
    meta = json.loads(f.read_text())
    structure = d.get("structure", "voice_memo")
    if structure not in meta["imps"]:
        return jsonify({"error": f"format {structure} not built"}), 400
    if not (d.get("draft") or "").strip():
        return jsonify({"error": "empty draft"}), 400
    try:
        res = rewrite(meta, structure, d["draft"], int(d.get("tone", 60)),
                      d.get("content_type", ""))
    except Exception as e:
        return jsonify({"error": f"rewrite failed: {e}"}), 500
    return jsonify(res)


if __name__ == "__main__":
    print(f"Voice Filter on http://localhost:5001  (gen={GEN_MODEL}, prod={PROD_MODEL})")
    app.run(host="0.0.0.0", port=5001, debug=False)
