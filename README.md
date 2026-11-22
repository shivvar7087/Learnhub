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

With no DATABASE_URL set, the API creates backend/learnhub.db (SQLite) and seeds the initial catalog on first start. Uploaded PDFs are saved under backend/uploads/ in local development. Set a private JWT_SECRET_KEY of at least 32 characters before starting the API; copy backend/.env.example to backend/.env or add the settings to the root .env.

Start the frontend in a second terminal from the project root:

```powershell
npm install
npm run dev
```

Vite normally serves the site at `http://localhost:5173`; the frontend talks to the API at `http://127.0.0.1:8000`. Set `VITE_API_URL` in the frontend environment when the API uses another address. The admin dashboard shows whether it connected to the API. If the API is offline, the existing browser-local demo data remains available.

## PostgreSQL

For PostgreSQL, configure backend/.env using SQLAlchemy's psycopg driver:

    DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
    JWT_SECRET_KEY=generate-a-unique-random-secret-of-at-least-32-characters
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
    FRONTEND_ORIGINS=http://localhost:5173,https://your-frontend.example
    UPLOAD_DIR=./uploads
    # Optional shared rate-limit storage across multiple API instances:
    # RATE_LIMIT_STORAGE_URI=redis://USER:PASSWORD@HOST:6379/0

Copy backend/.env.example to backend/.env and replace the example values. Keep .env private. The API creates its tables and seeds an empty database at startup. Local uploaded PDFs live on the backend filesystem; production deployments should use persistent disk or object storage because a normal ephemeral app filesystem can be cleared during redeploys.

The API health endpoint is `GET /api/health`; interactive API documentation is at `/docs` while the backend is running.

## Features

- Responsive student dashboard and course catalog with CSE, AI&DS, and AI branch selection.
- Semester filters, course enrollment, course-specific notes, important questions, and Quantum pages.
- Shared study resources and previous-paper filtering, including 2026 sample paper data.
- PDF upload, replacement, preview, download, edit, and delete through the admin content studio when the API is connected.
- SQLite/PostgreSQL persistence for courses, learning resources, and user accounts.
- JWT access tokens, Argon2 password hashes, student registration, sign-in, profile updates, and server-side admin roles.
- Admin write endpoints require a valid JWT and an admin database role. New registrations always receive the student role.
- Uploads are limited to 20 MiB and 500 pages, structurally parsed as PDFs, scanned for active content and embedded files, and rate-limited to 10 uploads/replacements per hour per IP.
- Login and registration are rate-limited. Multi-instance deployments should configure a shared RATE_LIMIT_STORAGE_URI so limits apply across API workers.
- Browser storage is used for per-device learning activity and the offline demo catalog, not as an authentication or authorization source.

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
| `/login`, `/signup`, `/forgot-password` | JWT sign-in and student registration; password reset is not connected |
| `/admin` | Admin content studio |

## Administrator access

Admin accounts cannot be created through student signup. Configure DATABASE_URL and JWT_SECRET_KEY, then run this from the project root:

    cd backend
    .venv\Scripts\Activate.ps1
    python -m app.create_admin admin@example.com

The command prompts for and confirms a password of at least 12 characters, then creates or promotes that account. Sign in through /login; the API returns an admin role and the UI exposes the admin content studio. All course and file write endpoints also enforce the admin role on the server.

Do not commit .env files. Use a separate random JWT secret per environment and rotate credentials if they have been shared. The API creates new tables on startup for local development. For an existing production database, apply the schema change through your normal migration process before release; create_all does not alter existing tables.

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
