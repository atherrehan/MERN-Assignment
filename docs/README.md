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
