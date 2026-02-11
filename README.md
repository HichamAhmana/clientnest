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

Detailed setup instructions live in the `backend/` and `frontend/` READMEs.

