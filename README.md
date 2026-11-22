# LearnHub

LearnHub is a responsive learning platform for B.Tech students, with AKTU-oriented courses, study materials, Quantum resources, and previous-year paper pages. The frontend uses React and Vite. A FastAPI backend stores shared course and resource records in SQLAlchemy, with PostgreSQL support and a SQLite local-development fallback.

## Run locally

Requirements: Node.js 20+ and Python 3.10+.

Start the API in one terminal:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

With no `DATABASE_URL` set, the API creates `backend/learnhub.db` (SQLite) and seeds the initial course and resource catalog on first start. Uploaded PDFs are saved under `backend/uploads/` in local development.

Start the frontend in a second terminal from the project root:

```powershell
npm install
npm run dev
```

Vite normally serves the site at `http://localhost:5173`; the frontend talks to the API at `http://127.0.0.1:8000`. Set `VITE_API_URL` in the frontend environment when the API uses another address. The admin dashboard shows whether it connected to the API. If the API is offline, the existing browser-local demo data remains available.

## PostgreSQL

For PostgreSQL, create a database and set `DATABASE_URL` in `backend/.env` using the SQLAlchemy psycopg format:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
FRONTEND_ORIGINS=http://localhost:5173,https://your-frontend.example
UPLOAD_DIR=./uploads
```

Copy `backend/.env.example` to `backend/.env`, replace the example database credentials, then install `backend/requirements.txt` and restart the API. The API creates its tables and seeds an empty database at startup. Keep `.env` private. Local uploaded PDFs live on the backend filesystem; production deployments should use persistent disk or object storage for PDFs because a normal ephemeral app filesystem can be cleared during redeploys.

The API health endpoint is `GET /api/health`; interactive API documentation is at `/docs` while the backend is running.

## Features

- Responsive student dashboard and course catalog with CSE, AI&DS, and AI branch selection.
- Semester filters, course enrollment, course-specific notes, important questions, and Quantum pages.
- Shared study resources and previous-paper filtering, including 2026 sample paper data.
- PDF upload, replacement, preview, download, edit, and delete through the admin content studio when the API is connected.
- SQLite/PostgreSQL persistence for courses and learning resources; browser storage remains the offline demo fallback for account and enrollment state.

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage |
| `/dashboard` | Student dashboard |
| `/courses` | Course catalog |
| `/courses/:id` | Course resources |
| `/quantum` | Quantum learning page |
| `/materials` | Study materials |
| `/papers` | Previous papers |
| `/profile` | Student profile |
| `/login`, `/signup`, `/forgot-password` | Demo account screens |
| `/admin` | Admin content studio |

## Demo admin account

Sign in at `/login` with `admin@learnhub.demo` and `LearnHubAdmin!`. This repository's admin check is a frontend demo gate, not server-side authorization. Do not expose the API to untrusted users or treat this sign-in as production security; add backend JWT authentication and role checks before production use.

## Project structure

```text
backend/
  app/           FastAPI routes, SQLAlchemy models, schemas, and seed data
  uploads/       Local development PDF uploads (created at runtime)
src/
  components/    Shared UI and admin components
  context/       Authentication, theme, and shared content state
  data/          Browser fallback catalog
  layouts/       Student application shell
  pages/         Homepage, dashboard, courses, resources, admin, and profile
  services/      API client, PDF handling, and browser file storage
  utils/         Date and learning activity helpers
```

## Useful commands

```bash
npm run dev
npm run build
npm run preview
```
