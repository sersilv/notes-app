# Notes App

A minimalist, aesthetic note-taking application built with **Django REST Framework** (backend) and **Next.js** (frontend).

## Features

- Email/password authentication (sign up & login) with JWT
- Auto-created categories: Random Thoughts, School, Personal
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

## AI Tools Used

This project was built with assistance from **Cursor AI**:

## Tech Stack

- **Backend:** Django 5.2, Django REST Framework, SimpleJWT, django-cors-headers, SQLite
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
