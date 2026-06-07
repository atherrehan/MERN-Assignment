---
name: country-state-app
description: Hub skill for the Country & State management MERN app. Defines the stack, monorepo layout, shared types (ApiResponse, Country, State), the API surface, deployment plan, and the full requirements checklist. Start here, then branch to the layer-specific skills.
---

# Country & State Management — Project Hub

This is the **source of truth** for the whole app. Every other skill links back here.
When a step touches the backend, read [express-api-architecture]; the database,
[drizzle-postgres-schema]; the frontend, [react-vite-shadcn-frontend].

## Stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Frontend       | React + Vite, TypeScript (strict)       |
| UI             | shadcn/ui (Tailwind)                    |
| HTTP client    | Axios (only inside service classes)     |
| Backend        | Node.js + Express, TypeScript (strict)  |
| Database       | PostgreSQL                              |
| ORM            | Drizzle                                 |
| Shared code    | `packages/shared` (types only)          |

## Monorepo layout

```
/
├─ apps/
│  ├─ web/          # React + Vite + shadcn frontend
│  └─ api/          # Express + Drizzle backend
├─ packages/
│  └─ shared/       # ApiResponse<T>, Country, State — imported by both apps
├─ package.json     # workspaces root
└─ tsconfig.base.json
```

- npm/pnpm workspaces. `apps/*` and `packages/*` are workspace members.
- Both apps depend on `@app/shared` for types. The contract lives in one place.

## Shared types (`packages/shared`)

These are **non-negotiable** and identical on both sides of the wire.

```ts
// The ONLY response envelope. Every endpoint returns this.
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export interface Country {
  id: number;        // unique
  code: string;
  name: string;
  isActive: boolean;
}

export interface State {
  id: number;        // unique
  code: string;
  name: string;
  isActive: boolean;
  countryId: number; // FK -> Country.id
}
```

- `success=false` always carries a human-readable `message` and `data: null`.
- On success, `data` holds the payload (`T`), `message` is a short confirmation.

## API surface

All routes prefixed `/api`. Every response is `ApiResponse<T>`.

| Method | Path                  | Body                       | Data (`T`)   |
| ------ | --------------------- | -------------------------- | ------------ |
| GET    | `/countries`          | —                          | `Country[]`  |
| GET    | `/countries/:id`      | —                          | `Country`    |
| POST   | `/countries`          | `{code,name,isActive?}`    | `Country`    |
| PUT    | `/countries/:id`      | partial Country            | `Country`    |
| DELETE | `/countries/:id`      | —                          | `null`       |
| GET    | `/states`             | `?countryId=&search=`      | `State[]`    |
| GET    | `/states/:id`         | —                          | `State`      |
| POST   | `/states`             | `{code,name,countryId,..}` | `State`      |
| PUT    | `/states/:id`         | partial State              | `State`      |
| DELETE | `/states/:id`         | —                          | `null`       |

(Build only the endpoints the current step asks for — this is the target, not a mandate to scaffold everything at once.)

## Architecture rules (apply on every step)

1. **Controllers/routes** do request/response wiring only — no business logic, no DB.
2. **Service classes** own business logic + CRUD and are the **only** layer touching Drizzle.
3. **Frontend components** never import Axios. They call service-class methods in
   `apps/web/src/services` — the only place Axios is used.
4. Every response uses `ApiResponse<T>` exactly.
5. Services **throw typed errors**; a single global Express error-handler converts them
   to `ApiResponse` with `success=false` and the error's message.
6. Entity fields are exactly as defined above — no extra fields.

## Working discipline

- Do **only** what the current step asks. Do not scaffold future steps or add
  speculative features.
- Begin each step with a 2–4 line plan listing files to add/change. Ask, then implement.

## Deployment plan

- **Database**: managed PostgreSQL (e.g. Neon/Supabase/RDS). Connection via `DATABASE_URL`.
- **API**: Node host (Render/Railway/Fly). Runs migrations on deploy, serves `/api`.
- **Web**: static build (Vite `dist/`) on a CDN/static host (Vercel/Netlify).
  `VITE_API_BASE_URL` points at the API origin.
- Env files: `apps/api/.env` (`DATABASE_URL`, `PORT`), `apps/web/.env` (`VITE_API_BASE_URL`).

## Requirements checklist

- [ ] Monorepo with workspaces: `apps/web`, `apps/api`, `packages/shared`.
- [ ] `packages/shared` exports `ApiResponse<T>`, `Country`, `State`.
- [ ] TS strict on both apps.
- [ ] Drizzle schema for Country & State (FK State.countryId → Country.id).
- [ ] DB client + migrations + seed.
- [ ] Service classes are the only Drizzle consumers; throw typed errors.
- [ ] Controllers wire request/response only; async handler wrapper.
- [ ] Global error-handler emits `ApiResponse{success:false}`.
- [ ] All endpoints return `ApiResponse<T>`.
- [ ] Frontend service classes are the only Axios consumers.
- [ ] shadcn UI; react-router routes for Countries & States CRUD.
- [ ] Search/filter for states by country + text.

## Related skills

- [express-api-architecture] — backend layers, error middleware, controllers, services.
- [drizzle-postgres-schema] — schema, db client, migrations, seed, search queries.
- [react-vite-shadcn-frontend] — routes, axios api-client, CRUD service classes.
