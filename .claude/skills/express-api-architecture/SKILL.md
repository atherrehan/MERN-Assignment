---
name: express-api-architecture
description: Backend architecture for apps/api — folder structure, the layer-responsibility table, async handler, typed errors + global error middleware, controller and service patterns, and validation. Enforces that only services touch Drizzle and every response is ApiResponse<T>.
---

# Express API Architecture (`apps/api`)

Backend for the Country & State app. See the hub [country-state-app] for the contract
and [drizzle-postgres-schema] for the data layer this calls into.

## Folder structure

```
apps/api/
├─ src/
│  ├─ index.ts                 # app bootstrap, listen
│  ├─ app.ts                   # express app: middleware, routes, error handler
│  ├─ config/
│  │  └─ env.ts                # typed env loading
│  ├─ db/                      # see drizzle-postgres-schema
│  ├─ routes/
│  │  ├─ index.ts              # mounts /countries, /states under /api
│  │  ├─ country.routes.ts
│  │  └─ state.routes.ts
│  ├─ controllers/
│  │  ├─ country.controller.ts
│  │  └─ state.controller.ts
│  ├─ services/
│  │  ├─ country.service.ts    # ONLY layer that touches Drizzle
│  │  └─ state.service.ts
│  ├─ middleware/
│  │  └─ error.ts              # global error handler -> ApiResponse
│  ├─ errors/
│  │  └─ AppError.ts           # typed error classes
│  └─ utils/
│     ├─ asyncHandler.ts
│     └─ apiResponse.ts        # ok()/fail() helpers
└─ tsconfig.json               # strict
```

## Layer responsibilities

| Layer       | May do                                          | Must NOT do                          |
| ----------- | ----------------------------------------------- | ------------------------------------ |
| Routes      | map path+method → controller, attach validation | logic, DB                            |
| Controllers | read req, call service, send `ApiResponse`      | business logic, DB, try/catch errors |
| Services    | business logic, CRUD, throw typed errors        | touch `req`/`res`                    |
| DB (Drizzle)| schema + client                                 | called by anything but services      |
| Middleware  | cross-cutting (errors, parsing, CORS)           | route-specific logic                 |

## Helpers

```ts
// utils/apiResponse.ts
import type { ApiResponse } from '@app/shared';
export const ok   = <T>(data: T, message = 'OK'): ApiResponse<T> =>
  ({ success: true, message, data });
export const fail = (message: string): ApiResponse<null> =>
  ({ success: false, message, data: null });
```

```ts
// utils/asyncHandler.ts — forwards rejected promises to the error middleware
import type { RequestHandler } from 'express';
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

## Typed errors

```ts
// errors/AppError.ts
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = new.target.name;
  }
}
export class NotFoundError   extends AppError { constructor(m = 'Not found')      { super(404, m); } }
export class ValidationError extends AppError { constructor(m = 'Invalid input')  { super(400, m); } }
export class ConflictError   extends AppError { constructor(m = 'Already exists') { super(409, m); } }
```

Services throw these. Controllers never catch them.

## Global error middleware

The **single** place errors become responses. Mount it **last**.

```ts
// middleware/error.ts
import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { fail } from '../utils/apiResponse';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.message));
  }
  // Unknown/unexpected
  console.error(err);
  return res.status(500).json(fail('Internal server error'));
};
```

## Controller pattern

Wiring only. No try/catch (the async handler + middleware own errors).

```ts
// controllers/country.controller.ts
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { CountryService } from '../services/country.service';

const service = new CountryService();

export const list = asyncHandler(async (_req, res) => {
  const countries = await service.list();
  res.json(ok(countries, 'Countries fetched'));
});

export const getById = asyncHandler(async (req, res) => {
  const country = await service.getById(Number(req.params.id));
  res.json(ok(country, 'Country fetched'));
});
```

## Service pattern

Business logic + CRUD; the **only** Drizzle consumer; throws typed errors.

```ts
// services/country.service.ts
import { db } from '../db/client';
import { countries } from '../db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '../errors/AppError';
import type { Country } from '@app/shared';

export class CountryService {
  async list(): Promise<Country[]> {
    return db.select().from(countries);
  }
  async getById(id: number): Promise<Country> {
    const [row] = await db.select().from(countries).where(eq(countries.id, id));
    if (!row) throw new NotFoundError(`Country ${id} not found`);
    return row;
  }
}
```

## Validation

- Validate at the route boundary (e.g. zod) before the controller, OR as the first
  act of a service. Invalid input → throw `ValidationError` (→ 400).
- Coerce `:id` params to `number`; reject `NaN`.
- Never trust the client to send `id`.

## Rules

1. Controllers touch only `req`/`res`; services touch only logic + DB.
2. Wrap every async controller in `asyncHandler` — no try/catch in controllers.
3. Only services import from `db/`.
4. Every response goes through `ok()` / `fail()` → `ApiResponse<T>`.
5. The error handler is mounted last and is the only error→response converter.

## Related skills

- [country-state-app] — contract, types, API surface.
- [drizzle-postgres-schema] — the `db/` layer services call.
- [react-vite-shadcn-frontend] — the client that consumes these endpoints.
