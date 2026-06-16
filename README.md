# Payye — Word-by-Word Reading Efficiency App

Payye displays text one word at a time (RSVP) to improve reading speed, focus,
comprehension and retention. Paste or upload text, read word-by-word with
adjustable speed, track progress, and resume sessions.

**Architecture:** all user data lives **on the device**. The backend is a thin,
**stateless** AI service — it stores nothing and exists mainly to keep the
OpenAI key off the phone and turn text into AI responses.

```
React Native (Expo)            FastAPI (stateless)
 ├─ documents      ── local ──▶  /ai/summary, /keywords, /difficulty,
 ├─ reading sessions  storage    /vocabulary, /simplify, /quiz, /chat
 ├─ settings        (AsyncStorage)
 └─ reader engine               /extract (TXT/PDF → text)   ──▶  OpenAI (optional)
```

## Repository layout

| Path        | What it is                                                          |
| ----------- | ------------------------------------------------------------------- |
| `app/`      | Expo React Native client. Documents, progress and settings persist locally via AsyncStorage. |
| `backend/`  | Stateless FastAPI AI service. No database. See [backend/README.md](backend/README.md). |
| `Guide.md`  | Original product/architecture brief.                                |

## Run it locally

### 1. Backend (stateless — no database)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: http://localhost:8000 · Docs: http://localhost:8000/docs
Set `OPENAI_API_KEY` in `.env` to use real AI; otherwise local heuristics are used.

### 2. Frontend (Expo)

```bash
cd app
npm install
# (optional) cp .env.example .env and set EXPO_PUBLIC_API_URL for a device
npm start
```

Press `i` / `a` / `w`, or scan the QR code with Expo Go. On a physical device set
`EXPO_PUBLIC_API_URL` to your computer's LAN IP so the app can reach the AI server.

## Where data lives

| Data                         | Stored in                                  |
| ---------------------------- | ------------------------------------------ |
| Documents (pasted / uploaded)| Device — `AsyncStorage` (`payye.library`)  |
| Reading progress / sessions  | Device — `AsyncStorage` (`payye.sessions`) |
| Settings (theme, WPM, …)     | Device — `AsyncStorage` (`payye.settings`) |
| Nothing                      | Backend (it is stateless)                  |

Uploaded PDFs/TXTs are sent to the backend's `/extract` endpoint only to pull out
the text; the file and text are **not** stored server-side — the text is saved
locally on the device.

## Features (mapped to the guide)

- **Reader engine** — whitespace tokenizer, `interval = 60000 / WPM`, punctuation
  and long-word dwell adjustments, ORP letter highlight, focus mode, tap to
  play/pause, skip ±1 / ±10. (`app/utils/readerTiming.ts`, `app/hooks/useReaderEngine.ts`)
- **Persistence** — progress, WPM and status saved locally; "Continue reading"
  resumes the most recent unfinished session.
- **Documents** — paste text or upload TXT/PDF (extracted via the backend), searchable library.
- **Discover** — search and filter free ebooks from Project Gutenberg and Open Library
  (called directly from the app), then read them word-by-word like any other document.
- **Settings** — theme, font size, default WPM, pause-on-punctuation.
- **AI** — summary, keywords + difficulty, vocabulary, simplify, quiz and chat,
  served by the backend (OpenAI when configured, local heuristics otherwise).

## Backend endpoints

`POST /ai/summary` · `POST /ai/keywords` · `POST /ai/difficulty` ·
`POST /ai/vocabulary` · `POST /ai/simplify` · `POST /ai/quiz` · `POST /ai/chat` ·
`POST /extract` · `GET /health` · `GET /config`

Optional gateway protection: set `APP_TOKEN` on the server and
`EXPO_PUBLIC_APP_TOKEN` in the app to require an `X-App-Token` header.

## Tests

```bash
cd backend && pytest          # AI endpoints + extraction (offline fallbacks)
cd app && npm run typecheck    # TypeScript
```
