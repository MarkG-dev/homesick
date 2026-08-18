# Voice Filter — MVP web app

Paste/upload your writing → it builds *your* voice (all 8 Imp formats + a measured
fingerprint) → filter any draft through it, with a tone/intensity slider and an inline diff.

This is the productized slice of the research in `../analysis/`: the defensible thing is
capturing an **unknown writer's own voice** from their corpus (the base model can't) and the
**usability layer** (tone slider + format choice) that keeps it from sounding like AI.

## Run

```bash
pip install flask anthropic
export ANTHROPIC_API_KEY=sk-...
python app/server.py            # http://localhost:5001
```

(From the repo this was built in, the sandbox's *background* launcher is flaky — run it in a
normal foreground shell on your machine and it serves fine. The app logic is verified via
Flask's test client.)

## What it does

1. **Build a voice** — multi-file upload (`.txt`/`.md`) and/or pasted text. The server cleans
   + chunks the corpus, measures a statistical fingerprint **locally** (avg sentence length,
   semicolons/em-dashes per 1k, FK grade, …), and generates all six LLM formats concurrently
   (voice memo, rules, anti-patterns, persona, trait vector, example pairs) + assembles hybrid.
2. **Filter a draft** — pick a format, set the **tone slider** (subtle → full voice), paste a
   draft, get the rewrite side-by-side with changed words highlighted. Tone maps to an
   intensity instruction so low tone protects the content's function (the usability lever the
   research found was the ceiling).

## API

| Endpoint | Purpose |
|---|---|
| `POST /api/voices` (multipart: `name`, `text`, `files[]`) | build a voice, returns `{id}` |
| `GET /api/voices` / `GET /api/voices/<id>` | list / fetch a voice + fingerprint + formats |
| `POST /api/rewrite` (`{voice_id, structure, draft, tone, content_type}`) | rewrite + diff |

Voices persist as JSON under `app/data/` (gitignored). Reuses the research pipeline directly
(`scripts/`): ingest, `stats_fingerprint`, prompt templates, `imp_render.render_payload`, and
the cached/rate-limited Anthropic client.

## What's MVP-only (the path to a real sub)

- **No learning loop yet.** The sub thesis is that the voice *improves from your edits*; this
  MVP builds a static voice. Next: capture accept/edit signal on each rewrite and fold it back
  into the Imp (the compounding switching cost).
- No auth/teams/billing, no browser extension or Gmail/Docs surface, no `.docx`/PDF parsing.
- One model tier; no per-voice frequency governors (the anti-caricature cap) wired to the UI yet.
