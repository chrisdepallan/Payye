# Payye — Word-by-Word Reading Efficiency App

Payye displays text one word at a time (RSVP) to improve reading speed, focus,
comprehension and retention. Paste or upload text, read word-by-word with
adjustable speed, track progress, resume sessions, and get AI summaries.

Built to the spec in [Guide.md](Guide.md).

```
React Native (Expo)  ─▶  FastAPI  ─▶  PostgreSQL / SQLite
                                  └▶  S3 / MinIO (uploads)
                                  └▶  OpenAI (optional)
```

## Repository layout

| Path        | What it is                                                        |
| ----------- | ----------------------------------------------------------------- |
| `backend/`  | FastAPI API (auth, documents, sessions, settings, AI). See [backend/README.md](backend/README.md). |
| `app/`      | Expo React Native client (reader engine, screens, navigation).    |
| `Guide.md`  | Original product/architecture brief.                              |

## Run it locally

### 1. Backend (no database setup needed — defaults to SQLite)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: http://localhost:8000  ·  Docs: http://localhost:8000/docs

### 2. Frontend (Expo)

```bash
cd app
npm install
# (optional) cp .env.example .env and set EXPO_PUBLIC_API_URL for a device
npm start
```

Press `i` (iOS simulator), `a` (Android emulator), or `w` (web), or scan the QR
code with Expo Go. On a physical device set `EXPO_PUBLIC_API_URL` to your
computer's LAN IP (e.g. `http://192.168.1.20:8000`) so the app can reach the API.

## Features (mapped to the guide)

- **Reader engine** — whitespace tokenizer, `interval = 60000 / WPM`, punctuation
  and long-word dwell adjustments, ORP letter highlight, focus mode, tap to
  play/pause, skip ±1 / ±10 words. (`app/utils/readerTiming.ts`, `app/hooks/useReaderEngine.ts`)
- **Auth** — register / login / me with JWT; token stored in Expo SecureStore.
- **Persistence** — reading sessions save `current_word_index`, `wpm` and status;
  `/sessions/current` powers "Continue reading"; resume picks up where you left off.
- **Documents** — paste text or upload TXT/PDF (text extracted server-side);
  searchable library.
- **Settings** — theme, font size, default WPM, pause-on-punctuation.
- **AI** — summary, keywords and difficulty (OpenAI when `OPENAI_API_KEY` is set,
  otherwise local heuristics so it works offline). Cached per document.

## Tech stack

- **Frontend:** Expo, React Native, TypeScript, React Navigation, Zustand, React Query, Axios.
- **Backend:** FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, PyJWT, passlib.
- **Storage:** SQLite/Postgres + local files/MinIO/S3.

## Tests

```bash
cd backend && pytest          # API + reader/AI logic
cd app && npm run typecheck    # TypeScript
```

## Notes

- The backend creates tables on startup for convenience; use Alembic migrations
  in production (`backend/migrations`).
- AI and S3 are optional — the app is fully functional without an OpenAI key or
  object storage.
