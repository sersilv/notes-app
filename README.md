# Notes App

A minimalist, aesthetic note-taking application built with **Django REST Framework** (backend) and **Next.js** (frontend).

## Features

- Email/password authentication (sign up & login) with JWT
- Auto-created categories: Random Thoughts, School, Personal, Drama
- Create notes instantly (no save button needed)
- Auto-save title, content, and category changes
- Category filtering in sidebar with note counts
- Note preview cards with relative dates (today, yesterday, or month + day)
- Category-colored note editor

## Project Structure

```
test/
├── backend/          # Django REST API
│   ├── config/       # Django settings
│   └── notes/        # Notes app (models, views, serializers)
└── frontend/         # Next.js React app
    ├── public/images/  # Illustrations and UI icons
    └── src/
        ├── app/        # Pages (signup, login, notes)
        ├── components/ # UI components
        └── lib/        # API client, types, date helpers
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API runs at `http://localhost:8000/api/`

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create .env.local manually
npm run dev
```

App runs at `http://localhost:3000`

## Running Tests

### Backend

```bash
cd backend
venv\Scripts\activate
python manage.py test notes
```

### Frontend

```bash
cd frontend
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Sign up (creates default categories) |
| POST | `/api/auth/login/` | Log in |
| GET | `/api/categories/` | List categories with note counts |
| GET | `/api/notes/` | List notes (optional `?category=<id>`) |
| POST | `/api/notes/` | Create a new note |
| GET/PATCH | `/api/notes/<id>/` | Get or update a note |

## Process

1. **Built the Django backend**: models (`Category`, `Note`), JWT auth with SimpleJWT, serializers, views, and REST endpoints, plus tests for registration, auth, and note CRUD.
2. **Built the Next.js frontend**: signup/login pages, the notes dashboard with category sidebar, and the auto-saving note editor.
3. **Iterated on the UI** against the mockups: fonts, category colors, note card truncation rules, placeholder colors, and empty states.
4. **Debugged along the way**: signup edge cases (stale tokens), and note card layout issues.
5. **Added testing**: verified the backend and frontend tests, lint checks, and production build.

## Key Design & Technical Decisions

- **JWT auth with tokens in localStorage** — simple to implement for a small SPA; access tokens last 7 days so users stay logged in.
- **Default categories created on signup** (Random Thoughts, School, Personal, Drama) — the app is instantly usable, and `ensure_default_categories()` self-heals accounts that are missing them.
- **Categories store only a dot color** — border and background shades are derived on the frontend, keeping the API minimal.
- **Auto-save instead of a save button** — title/content changes save with a 500ms debounce; category changes save immediately.
- **Notes are never empty** — a new note is created on click and opened in the editor right away, matching the "no save button" flow.
- **Note card truncation** — titles show up to 5 lines (then ellipsis), content shows 2 lines under long titles or up to 6 lines under short ones, so cards stay a uniform height.
- **SQLite** — zero-setup database, appropriate for a take-home/demo project.

## AI Tools Used

This project was built with **Cursor**. How it was used:

- **Scaffolding** — generated the Django models, serializers, views, URL routing, and the initial Next.js pages and components.
- **Debugging** — diagnosed and fixed real issues: stale JWTs breaking signup, users missing default categories, and CSS line-clamp problems on note cards.
- **Testing & docs** — wrote the backend test suite (18 tests), frontend date-formatting tests, and this README.

All AI output was reviewed and tested; the backend suite, frontend tests, lint, and production build all pass.

## Tech Stack

- **Backend:** Django 5.2, Django REST Framework, SimpleJWT, django-cors-headers, SQLite
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
