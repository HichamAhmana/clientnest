## ClientNest

ClientNest is a full-stack client, project, task, and invoice management platform for freelancers and small agencies.

This monorepo contains:

- `backend/` – Django 5 + GraphQL API (PostgreSQL, JWT auth)
- `frontend/` – Next.js 14 + TypeScript + Tailwind + shadcn/ui (Apollo Client)

### Getting started

1. Create a `.env` file for the backend based on `backend/.env.example`.
2. Create a `.env` file for the frontend based on `frontend/.env.example`.
3. Start the backend (Django + PostgreSQL).
4. Start the frontend (Next.js dev server).

#### Local development

- Backend:
  - `cd backend`
  - `python -m pip install -r requirements.txt`
  - `python manage.py migrate`
  - `python manage.py runserver`
- Frontend:
  - `cd frontend`
  - `npm install`
  - `npm run dev`

#### Docker (backend + Postgres)

From the repo root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `5432`
- Django backend on `http://localhost:8000`

You can then run the Next.js frontend either locally or in its own container using the `frontend/Dockerfile`.

Detailed setup instructions live in the `backend/` and `frontend/` READMEs.

