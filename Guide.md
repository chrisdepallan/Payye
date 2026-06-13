# Word-by-Word Reading Efficiency App

## Tech Stack

### Frontend

* React Native (Expo)
* TypeScript
* Zustand
* React Query
* React Navigation

### Backend

* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

### Database

* PostgreSQL

### Storage

* S3 / MinIO

### AI Services

* OpenAI API
* Local LLM (Optional)

---

# 1. Project Vision

Build a reading application that displays text one word at a time to improve:

* Reading speed
* Focus
* Comprehension
* Retention

The application should support text input, document uploads, progress tracking, and AI-assisted reading tools.

---

# 2. MVP Features

## Reading

* Paste text
* Start reading session
* Word-by-word display
* Adjustable WPM
* Pause / Resume
* Skip forward / backward
* Progress tracking

## User Management

* Register
* Login
* User settings

## Documents

* Upload TXT files
* Upload PDFs
* Save documents

## History

* Resume previous sessions
* View reading history

---

# 3. Architecture

```text
React Native App
        ↓
      FastAPI
        ↓
   PostgreSQL
        ↓
     S3/MinIO

Optional AI Layer
        ↓
OpenAI / Local LLM
```

---

# 4. User Flows

## Paste Text Flow

1. User opens app
2. Clicks New Session
3. Pastes text
4. Reader starts
5. Progress is saved

## Upload Document Flow

1. User uploads file
2. Backend extracts text
3. Document is stored
4. Reader opens

## Resume Flow

1. User opens app
2. Previous session appears
3. User resumes reading

---

# 5. Development Phases

## Phase 1: Reader Engine

### Features

* Word tokenizer
* Reader UI
* WPM controls
* Pause/Resume
* Progress bar

### Deliverable

Functional reader from pasted text.

---

## Phase 2: Authentication

### Features

* Register
* Login
* JWT Authentication
* Protected APIs

### Deliverable

User accounts and sessions.

---

## Phase 3: Persistence

### Features

* Save reading sessions
* Save settings
* Resume reading

### Deliverable

Reading history and recovery.

---

## Phase 4: Document Management

### Features

* Upload PDF
* Upload TXT
* Store files in S3/MinIO
* Extract text

### Deliverable

Library system.

---

## Phase 5: AI Features

### Features

* Summaries
* Vocabulary assistance
* Difficulty estimation
* Reading recommendations

### Deliverable

AI-enhanced reading experience.

---

# 6. Database Design

## users

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| name          | VARCHAR   |
| email         | VARCHAR   |
| password_hash | VARCHAR   |
| created_at    | TIMESTAMP |

---

## documents

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| user_id      | UUID      |
| title        | VARCHAR   |
| source_type  | VARCHAR   |
| file_url     | TEXT      |
| text_content | TEXT      |
| word_count   | INTEGER   |
| created_at   | TIMESTAMP |

---

## reading_sessions

| Column             | Type      |
| ------------------ | --------- |
| id                 | UUID      |
| user_id            | UUID      |
| document_id        | UUID      |
| current_word_index | INTEGER   |
| wpm                | INTEGER   |
| started_at         | TIMESTAMP |
| updated_at         | TIMESTAMP |
| completed_at       | TIMESTAMP |
| status             | VARCHAR   |

---

## user_settings

| Column               | Type    |
| -------------------- | ------- |
| id                   | UUID    |
| user_id              | UUID    |
| default_wpm          | INTEGER |
| theme                | VARCHAR |
| font_size            | INTEGER |
| pause_on_punctuation | BOOLEAN |

---

## ai_outputs

| Column           | Type      |
| ---------------- | --------- |
| id               | UUID      |
| document_id      | UUID      |
| summary          | TEXT      |
| keywords         | JSON      |
| difficulty_level | VARCHAR   |
| generated_at     | TIMESTAMP |

---

# 7. Backend API Design

## Authentication

### Register

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

### Current User

```http
GET /auth/me
```

---

## Documents

### Create

```http
POST /documents
```

### List

```http
GET /documents
```

### Detail

```http
GET /documents/{id}
```

### Delete

```http
DELETE /documents/{id}
```

---

## Reading Sessions

### Start

```http
POST /sessions/start
```

### Update Progress

```http
PATCH /sessions/{id}
```

### Current Session

```http
GET /sessions/current
```

### History

```http
GET /sessions/history
```

---

## Settings

### Get

```http
GET /settings
```

### Update

```http
PATCH /settings
```

---

## AI

### Summary

```http
POST /ai/summary
```

### Keywords

```http
POST /ai/keywords
```

### Vocabulary Help

```http
POST /ai/vocabulary-help
```

---

# 8. Reader Engine Design

## Core Formula

Words are displayed based on:

```text
interval_ms = 60000 / WPM
```

Examples:

| WPM | Interval |
| --- | -------- |
| 120 | 500ms    |
| 240 | 250ms    |
| 300 | 200ms    |

---

## Reader Enhancements

### Punctuation Delay

* Comma → slight pause
* Period → longer pause
* Paragraph break → extended pause

### Long Word Adjustment

Long words remain visible slightly longer.

### Focus Mode

* Hide UI controls
* Fullscreen display
* Reduced distractions

---

# 9. Frontend Screens

## Authentication

* Login
* Register

## Home

* Continue Reading
* New Session
* Upload Document

## Reader

* Current Word
* Play/Pause
* Speed Controls
* Progress Indicator

## Library

* Documents
* Search
* Resume

## Settings

* Theme
* Font Size
* Default WPM

---

# 10. State Management

## Zustand

Stores:

* Current session
* Reader state
* Active document

## React Query

Handles:

* API requests
* Caching
* Synchronization

## AsyncStorage

Stores:

* Local preferences
* Draft text
* Offline cache

---

# 11. Storage Design

## Store in S3 / MinIO

* PDFs
* TXT files
* EPUB files (future)

## Store in PostgreSQL

* Users
* Reading sessions
* Settings
* Metadata

---

# 12. AI Roadmap

## Stage 1

* Summaries
* Key points

## Stage 2

* Vocabulary explanations
* Difficulty estimation

## Stage 3

* Reading coach
* Personalized speed recommendations

## Stage 4

* Adaptive reading mode
* AI-generated comprehension quizzes

---

# 13. Frontend Structure

```text
app/
├── assets/
├── components/
├── screens/
├── navigation/
├── hooks/
├── store/
├── services/
├── types/
├── utils/
└── constants/
```

---

# 14. Backend Structure

```text
backend/
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── core/
│   ├── tasks/
│   └── utils/
│
├── migrations/
├── tests/
└── main.py
```

---

# 15. Timeline

## Week 1

* Setup repositories
* Setup Expo
* Setup FastAPI
* Setup PostgreSQL

## Week 2

* Reader engine
* Speed controls
* Progress tracking

## Week 3

* Authentication
* Persistence
* Settings

## Week 4

* File uploads
* Library
* Document processing

## Week 5

* AI integration
* Bug fixing
* Deployment

---

# 16. Testing Strategy

## Frontend

* Reader timing
* WPM adjustment
* Navigation
* Offline behavior

## Backend

* Authentication
* Upload APIs
* Session APIs
* AI APIs

## Edge Cases

* Large files
* Empty text
* Special characters
* Interrupted sessions

---

# 17. Deployment

## Development

* Expo local
* FastAPI local
* PostgreSQL Docker
* MinIO Docker

## Production

### Frontend

* Expo EAS Build

### Backend

* Railway
* Render
* VPS

### Database

* Managed PostgreSQL

### Storage

* AWS S3

### AI

* OpenAI API
* Self-hosted LLM

---

# 18. Execution Order

1. Project setup
2. Reader engine
3. WPM controls
4. Progress tracking
5. Authentication
6. Database integration
7. Document management
8. File uploads
9. Library
10. AI features
11. Deployment

---

# 19. Risks

## Technical

* Reader timing accuracy
* PDF extraction quality
* Mobile performance

## Product

* Feature creep
* Over-reliance on AI
* Complex onboarding

---

# 20. Success Criteria

## MVP Success

* Users can upload or paste text.
* Users can read word-by-word.
* Reading progress is saved.
* Sessions can be resumed.

## Version 2 Success

* AI summaries.
* Reading analytics.
* Vocabulary assistance.
* Personalized reading recommendations.
