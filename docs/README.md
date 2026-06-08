# Country & State Management

A MERN-stack app to manage Countries and their States with full CRUD.
Each State belongs to a Country (FK), and entities can be toggled active/inactive.
Every API response follows a single typed `ApiResponse<T>` envelope.

## Stack

| Concern     | Choice                                 |
| ----------- | -------------------------------------- |
| Frontend    | React + Vite, TypeScript (strict)      |
| UI          | shadcn/ui (Tailwind)                   |
| HTTP client | Axios (only inside service classes)    |
| Backend     | Node.js + Express, TypeScript (strict) |
| Database    | PostgreSQL                             |
| ORM         | Drizzle                                |

## Project structure

```
/
├─ backend/    # Node.js + Express + Drizzle API
├─ frontend/   # React + Vite + shadcn web app
├─ shared/
│  └─ types/   # ApiResponse<T>, Country, State — imported by both apps via @shared
└─ docs/       # Project documentation
```

## Environment variables

| App | Var | Example | Purpose |
| --- | --- | --- | --- |
| backend | `PORT` | `4000` | API listen port |
| backend | `CORS_ORIGIN` | `http://localhost:5173` | Allowed browser origin (the frontend) |
| backend | `DATABASE_URL` | `postgres://postgres@127.0.0.1:5432/country_state` | Postgres connection |
| frontend | `VITE_API_URL` | `http://localhost:4000/api` | Base URL of the backend API (must include `/api`; only `VITE_`-prefixed vars are exposed to the client) |

Each app has a committed `.env.example`; copy it to `.env` (backend) / `.env.local` (frontend) and adjust.

## Prerequisites

- **Node.js 20.x** (the backend pins this via `backend/.nvmrc` and `engines`; run `nvm use` in `backend/`).
- **PostgreSQL** running locally (or a hosted instance, e.g. Neon).

## Local setup

1. **Install dependencies** (each app is its own npm project):

   ```bash
   cd backend  && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment variables** — copy each example file and edit as needed:

   ```bash
   cp backend/.env.example  backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

   See the [Environment variables](#environment-variables) table above for what each value means.

3. **Create the database** referenced by `DATABASE_URL` (default name `country_state`):

   ```bash
   createdb country_state
   # or, from psql:  CREATE DATABASE country_state;
   ```

## Database: migrations & seed

Run these from the `backend/` directory (they use `DATABASE_URL` from `backend/.env`):

```bash
npm run db:generate   # generate SQL migrations from the Drizzle schema (only after schema changes)
npm run db:migrate    # apply pending migrations to the database
npm run db:seed       # load sample data: 5 countries, 10 states (mixed active/inactive)
```

Migrations are committed under `backend/src/db/migrations`. For a fresh setup, run `db:migrate` then `db:seed`.

## Running the apps

Start each in its own terminal:

```bash
# Terminal 1 — API on http://localhost:4000
cd backend && npm run dev

# Terminal 2 — web app on http://localhost:5173
cd frontend && npm run dev
```

Then open **http://localhost:5173**. The frontend's `VITE_API_URL` must point at the API (default `http://localhost:4000/api`), and the backend's `CORS_ORIGIN` must match the frontend origin (default `http://localhost:5173`).

### Production build

```bash
cd backend  && npm run build && npm start   # compiles to dist/, runs node dist/server.js
cd frontend && npm run build                # static build in frontend/dist/
```
