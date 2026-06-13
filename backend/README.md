# Payye Backend (FastAPI)

Word-by-word reading efficiency API: auth, documents, reading sessions,
settings and AI helpers.

## Quick start

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env            # optional, defaults work out of the box
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000. Interactive docs: http://localhost:8000/docs

By default it uses a local SQLite file (`payye.db`) and creates tables on
startup — no database server required.

## Configuration

All settings live in `.env` (see `.env.example`). Highlights:

| Variable          | Default                 | Notes                                        |
| ----------------- | ----------------------- | -------------------------------------------- |
| `DATABASE_URL`    | `sqlite:///./payye.db`  | Set to a Postgres URL for production.        |
| `SECRET_KEY`      | `dev-secret-change-me`  | **Change in production.**                    |
| `STORAGE_BACKEND` | `local`                 | `local` or `s3` (MinIO/AWS).                 |
| `OPENAI_API_KEY`  | _unset_                 | Optional. Without it, AI uses local heuristics. |

## API overview

| Method | Path                    | Purpose                          |
| ------ | ----------------------- | -------------------------------- |
| POST   | `/auth/register`        | Create account, returns JWT      |
| POST   | `/auth/login`           | Login, returns JWT               |
| GET    | `/auth/me`              | Current user                     |
| POST   | `/documents`            | Create document from pasted text |
| POST   | `/documents/upload`     | Upload TXT/PDF (multipart)       |
| GET    | `/documents`            | List documents                   |
| GET    | `/documents/{id}`       | Document detail (with text)      |
| DELETE | `/documents/{id}`       | Delete document                  |
| POST   | `/sessions/start`       | Start or resume a reading session|
| PATCH  | `/sessions/{id}`        | Save progress / wpm / status     |
| GET    | `/sessions/current`     | Most recent unfinished session   |
| GET    | `/sessions/history`     | All sessions                     |
| GET    | `/settings`             | Read user settings               |
| PATCH  | `/settings`             | Update user settings             |
| POST   | `/ai/summary`           | Summarize a document             |
| POST   | `/ai/keywords`          | Keywords + difficulty            |
| POST   | `/ai/vocabulary-help`   | Define a word                    |

Authenticated routes expect `Authorization: Bearer <token>`.

## Tests

```bash
pytest
```

Tests run against an in-memory SQLite database and exercise auth, documents,
sessions, settings and the AI fallbacks.

## Migrations (production)

Startup `create_all` is convenient for development. For production use Alembic:

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

## Optional services (Postgres + MinIO)

```bash
docker compose up -d        # see docker-compose.yml
```

Then set in `.env`:

```
DATABASE_URL=postgresql+psycopg://payye:payye@localhost:5432/payye
STORAGE_BACKEND=s3
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

(Postgres also needs the driver: `pip install "psycopg[binary]"`.)
