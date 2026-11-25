# LearnHub

LearnHub is a learning platform for B.Tech students, with course and semester browsing, study materials, Quantum resources, and previous-year papers. It is organized as two applications:

- **Frontend:** React, Vite, and React Router in `frontend/`
- **Backend:** FastAPI and SQLAlchemy in `backend/`, with PostgreSQL support and SQLite for local development

## Features

- Course catalog, semester filters, and course-specific resources
- Student dashboard, profile, Quantum, study materials, and previous papers
- Student registration and sign-in using JWT authentication
- Admin content studio for managing courses and PDF resources
- Browser-local fallback data when the API is unavailable
- PDF upload validation and rate limits on authentication and upload endpoints

## Requirements

- Node.js 20.19+ or 22.12+ and npm
- Python 3.10+

## Run locally

Start the backend in one terminal. From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and replace the `JWT_SECRET_KEY` placeholder with a private random value of at least 32 characters. Then start the API:

```powershell
uvicorn app.main:app --reload --port 8001
```

With `DATABASE_URL` unset, the API creates and seeds `backend/learnhub.db` using SQLite. Locally uploaded PDFs are stored in `backend/uploads/`.

In a second terminal, from the repository root:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Vite serves the frontend at `http://localhost:5173`; its default API URL is `http://127.0.0.1:8001`. Edit `frontend/.env` and set `VITE_API_URL` if the API runs at a different address. The frontend environment file only configures the browser app; backend settings belong in `backend/.env`.

The API health check is `http://127.0.0.1:8001/api/health`. Interactive API documentation is available at `http://127.0.0.1:8001/docs`.

## Configuration

`backend/.env.example` documents the backend settings:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET_KEY` | Required private signing key; use at least 32 random characters |
| `DATABASE_URL` | Optional SQLAlchemy database URL; unset uses local SQLite |
| `FRONTEND_ORIGINS` | Comma-separated allowed browser origins |
| `UPLOAD_DIR` | Directory for uploaded PDFs |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access-token lifetime |
| `RATE_LIMIT_STORAGE_URI` | Optional shared storage for rate limits across API instances |

For PostgreSQL, use a SQLAlchemy URL such as:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

The API creates tables and seeds an empty database on startup. `create_all` does not update existing schemas; apply schema changes through your migration process before deploying updates to an existing production database.

## Deploy frontend to GitHub Pages and backend to Render

### Render backend

1. Create a PostgreSQL database in Render.
2. Deploy the repository using the root `render.yaml` Blueprint.
3. Set the `learnhub-api` service's `DATABASE_URL` to the database's **internal connection URL**. Keep the database and API in the same region.
4. Render generates `JWT_SECRET_KEY`. The Blueprint sets the GitHub Pages CORS origin, health check, and persistent upload disk.

The configured persistent disk requires a paid Render web-service plan. SQLite and the default ephemeral filesystem are not suitable for production data or uploaded files.

### GitHub Pages frontend

1. In GitHub repository **Settings → Pages**, select **GitHub Actions** as the deployment source.
2. In **Settings → Secrets and variables → Actions → Variables**, add `VITE_API_URL` with your full Render API URL, for example `https://learnhub-lb6y.onrender.com` (without a trailing slash).
3. Push to `main` or run **Deploy frontend to GitHub Pages** from the Actions tab.

The workflow in `.github/workflows/deploy-pages.yml` installs and builds from `frontend/`, then deploys to `https://shivvar7087.github.io/Learnhub/`. The Vite configuration applies the repository subpath, and the workflow publishes a fallback page for client-side routes.

## Application routes

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
| `/login` and `/signup` | Sign-in and student registration |
| `/forgot-password` | Password-reset screen (reset is not connected) |
| `/admin` | Admin content studio |

## Create an administrator

Student registration always creates a student account. To create or promote an administrator, configure the backend database and JWT secret, activate the backend virtual environment, then run from the repository root:

```powershell
cd backend
.venv\Scripts\Activate.ps1
python -m app.create_admin admin@example.com
```

The command prompts for a password of at least 12 characters. Admin-only write operations are also enforced by the API.

## Project structure

```text
.github/
  workflows/deploy-pages.yml  GitHub Pages build and deployment
backend/
  app/                        FastAPI routes, models, schemas, and seed data
  .env.example                Backend configuration template
  requirements.txt            Python dependencies
frontend/
  src/
    components/                Shared UI and admin components
    context/                   Authentication, theme, and content state
    data/                      Browser fallback catalog
    layouts/                   Student application shell
    pages/                     React route pages
    services/                  API, document, and browser file services
    utils/                     Date and learning activity helpers
  .env.example                 Frontend API URL template
  package.json                 Frontend scripts and dependencies
render.yaml                    Render API service configuration
```

## Common frontend commands

Run these from `frontend/`:

```bash
npm run dev
npm run build
npm run preview
```

Do not commit `.env` files or production credentials. Use a unique JWT secret for each environment and rotate it if it is exposed.
