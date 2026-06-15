# Payye AI Backend (FastAPI)

A **stateless** AI service for the Payye reader. It stores **no data** — no
database, no accounts, no documents. Every request carries its own text and the
backend returns an AI response. Its main job is to keep the OpenAI key
server-side (you can't safely ship that key in a mobile app) and to normalize
AI output into typed JSON.

All user data (documents, reading progress, settings) lives on the device.

## Quick start

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env            # optional, defaults work out of the box
uvicorn app.main:app --reload
```

API: http://localhost:8000  ·  Docs: http://localhost:8000/docs

Without `OPENAI_API_KEY` the AI endpoints still respond using local heuristics
(summary/keywords/difficulty/vocabulary). `simplify` returns the text unchanged
and `quiz`/`chat` explain that a key is required.

## Endpoints

| Method | Path              | Body                              | Returns                                   |
| ------ | ----------------- | --------------------------------- | ----------------------------------------- |
| POST   | `/ai/summary`     | `{ text }`                        | `{ summary }`                             |
| POST   | `/ai/keywords`    | `{ text }`                        | `{ keywords[], difficulty_level }`        |
| POST   | `/ai/difficulty`  | `{ text }`                        | `{ difficulty_level }`                    |
| POST   | `/ai/vocabulary`  | `{ word, context? }`              | `{ word, definition, example? }`          |
| POST   | `/ai/simplify`    | `{ text }`                        | `{ text }`                                |
| POST   | `/ai/quiz`        | `{ text, num_questions? }`        | `{ questions[] }`                         |
| POST   | `/ai/chat`        | `{ text?, messages[] }`           | `{ reply }`                               |
| POST   | `/extract`        | multipart `file` (TXT/PDF)        | `{ text, word_count, source_type }`       |
| GET    | `/health`         | —                                 | `{ status, app }`                         |
| GET    | `/config`         | —                                 | `{ app_name, model, ai_enabled, max_input_chars }` |

## Cross-cutting behavior (still no storage)

- **OpenAI key custody** + outbound calls and response parsing.
- **Heuristic fallback** so summaries/keywords/difficulty/vocabulary work offline.
- **Gateway token** (`APP_TOKEN`): when set, clients must send `X-App-Token`.
- **Rate limiting** (`RATE_LIMIT_PER_MINUTE`, in-memory per IP).
- **Input size guard** (`MAX_INPUT_CHARS`) and a 10 MB upload cap on `/extract`.
- **CORS**, health and config endpoints.

## Tests

```bash
pytest
```

Tests exercise the endpoints with the offline fallbacks (no key required).

## Deploy to Vercel

This stateless service fits Vercel's Python serverless runtime. The repo already
includes `api/index.py` (exposes the FastAPI `app`) and `vercel.json` (rewrites
all paths to it).

1. Create a Vercel project with **Root Directory = `backend`**.
2. Add environment variables (Project → Settings → Environment Variables):

   | Variable                | Required | Notes                                            |
   | ----------------------- | -------- | ------------------------------------------------ |
   | `OPENAI_API_KEY`        | for AI   | Without it, heuristic fallbacks are used.        |
   | `OPENAI_MODEL`          | no       | Default `gpt-4o-mini`.                            |
   | `CORS_ORIGINS`          | no       | Your web origin, or `*`.                          |
   | `APP_TOKEN`             | no       | If set, clients must send `X-App-Token`.          |
   | `MAX_INPUT_CHARS`       | no       | Default `50000`.                                  |
   | `RATE_LIMIT_PER_MINUTE` | no       | **Set to `0` on Vercel** — see caveat below.      |

3. Deploy. Vercel installs `requirements.txt` and runs Python 3.12.
4. Test: `GET https://<project>.vercel.app/health` and `/config`.

**Caveats**
- *Rate limiting:* the built-in limiter is in-memory, so it is unreliable across
  serverless instances. Set `RATE_LIMIT_PER_MINUTE=0` and rely on Vercel's
  platform limits, or move to an external store (e.g. Upstash Redis) for real limits.
- *Timeouts:* `maxDuration` is set to 60s in `vercel.json`; the actual ceiling
  depends on your Vercel plan. Long OpenAI calls may need a higher limit.
- *Stateless only:* never write to disk — there is no persistent filesystem.
