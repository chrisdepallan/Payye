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
