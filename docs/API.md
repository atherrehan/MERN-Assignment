# API Reference — Country & State Management

Current as of the backend "hardening + API surface freeze" step. This documents
**every** endpoint the API exposes.

## Conventions

- **Base URL:** `http://localhost:4000` in development (`PORT` env var).
- **All feature endpoints are under `/api`.**
- **CORS:** the allowed browser origin is read from the `CORS_ORIGIN` env var
  (see `backend/.env.example`). Default `http://localhost:5173` (Vite dev server);
  set it to the deployed web origin in production.
- **Content type:** request bodies are JSON; all responses are JSON.

### Response envelope — `ApiResponse<T>`

Every response (success *or* error) has exactly this shape:

```ts
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};
```

- Success → `success: true`, `data` holds the payload, `message` is a short note.
- Error → `success: false`, `data: null`, `message` describes the problem.

### Entities

```ts
type Country = { id: number; code: string; name: string; isActive: boolean };
type State   = { id: number; code: string; name: string; isActive: boolean; countryId: number };
```

### Paged result — `PagedResult<T>`

Returned by the search endpoints:

```ts
type PagedResult<T> = {
  items: T[];
  total: number;      // total rows matching the filter (ignores paging)
  page: number;
  pageSize: number;
  totalPages: number; // ceil(total / pageSize)
};
```

---

## Health

### `GET /health`

Liveness check. No params.

**200**
```json
{ "success": true, "message": "Service healthy", "data": { "status": "ok" } }
```

---

## Countries

### `GET /api/countries/search`

Paged list/search of countries.

| Query param | Type | Default | Notes |
| ----------- | ---- | ------- | ----- |
| `q`         | string | – | Case-insensitive partial match on **code OR name** |
| `isActive`  | `all` \| `active` \| `inactive` | `all` | Active-state filter |
| `page`      | integer ≥ 1 | `1` | |
| `pageSize`  | integer 1–100 | `20` | Clamped to max 100 |
| `sortBy`    | `code` \| `name` \| `isActive` | `name` | Whitelisted |
| `sortOrder` | `asc` \| `desc` | `asc` | |

**200** — `data` is `PagedResult<Country>`
```json
{
  "success": true,
  "message": "Countries fetched",
  "data": {
    "items": [
      { "id": 1, "code": "PK", "name": "Pakistan", "isActive": true }
    ],
    "total": 5, "page": 1, "pageSize": 20, "totalPages": 1
  }
}
```

**400** — invalid query (e.g. `sortBy=secret`)
```json
{ "success": false, "message": "sortBy: Invalid option: expected one of \"code\"|\"name\"|\"isActive\"", "data": null }
```

### `GET /api/countries/:id`

| Param | Type | Notes |
| ----- | ---- | ----- |
| `id`  | integer > 0 | Path param |

**200**
```json
{ "success": true, "message": "Country fetched", "data": { "id": 1, "code": "PK", "name": "Pakistan", "isActive": true } }
```
**404**
```json
{ "success": false, "message": "Country 999999 not found", "data": null }
```

### `POST /api/countries`

Body:

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `code` | string (1–8) | yes | Unique across countries |
| `name` | string (1–128) | yes | |
| `isActive` | boolean | no | Defaults to `true` |

**201**
```json
{ "success": true, "message": "Country created", "data": { "id": 6, "code": "FR", "name": "France", "isActive": true } }
```
**400**
```json
{ "success": false, "message": "code: Too small: expected string to have >=1 characters", "data": null }
```

### `PUT /api/countries/:id`

Path param `id` (integer > 0). Body — any subset of `code` / `name` / `isActive`,
**at least one** field required.

**200**
```json
{ "success": true, "message": "Country updated", "data": { "id": 6, "code": "FR", "name": "France (Updated)", "isActive": false } }
```
**400** (empty body)
```json
{ "success": false, "message": ": At least one field must be provided", "data": null }
```
**404** — country does not exist.

### `DELETE /api/countries/:id`

Path param `id` (integer > 0). **Soft delete** — sets `isActive=false`; the row is kept.

**200**
```json
{ "success": true, "message": "Country deleted", "data": null }
```
**404** — country does not exist.

---

## States

State search rows include the joined **`countryName`** so the list page needs no
second call:

```ts
type StateSearchRow = State & { countryName: string };
```

### `GET /api/states/search`

Same paging/search/sort/filter semantics as country search. `q` matches **state
code OR name**.

| Query param | Type | Default | Notes |
| ----------- | ---- | ------- | ----- |
| `q`         | string | – | Case-insensitive partial match on state code/name |
| `isActive`  | `all` \| `active` \| `inactive` | `all` | |
| `page`      | integer ≥ 1 | `1` | |
| `pageSize`  | integer 1–100 | `20` | |
| `sortBy`    | `code` \| `name` \| `isActive` | `name` | |
| `sortOrder` | `asc` \| `desc` | `asc` | |

**200** — `data` is `PagedResult<StateSearchRow>`
```json
{
  "success": true,
  "message": "States fetched",
  "data": {
    "items": [
      { "id": 1, "code": "PB", "name": "Punjab", "isActive": true, "countryId": 1, "countryName": "Pakistan" }
    ],
    "total": 10, "page": 1, "pageSize": 20, "totalPages": 1
  }
}
```

### `GET /api/states/:id`

Path param `id` (integer > 0).

**200**
```json
{ "success": true, "message": "State fetched", "data": { "id": 1, "code": "PB", "name": "Punjab", "isActive": true, "countryId": 1 } }
```
**404**
```json
{ "success": false, "message": "State 999999 not found", "data": null }
```

### `POST /api/states`

Body:

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `code` | string (1–8) | yes | Unique within a country |
| `name` | string (1–128) | yes | |
| `countryId` | integer > 0 | yes | Must reference an existing country |
| `isActive` | boolean | no | Defaults to `true` |

**201**
```json
{ "success": true, "message": "State created", "data": { "id": 11, "code": "KP", "name": "Khyber Pakhtunkhwa", "isActive": true, "countryId": 1 } }
```
**404** — referenced country missing
```json
{ "success": false, "message": "Country 999999 not found", "data": null }
```
**400** — invalid body (e.g. missing/empty `code`, non-numeric `countryId`).

### `PUT /api/states/:id`

Path param `id` (integer > 0). Body — any subset of `code` / `name` / `countryId`
/ `isActive`, at least one field. If `countryId` is provided it must reference an
existing country (else **404**).

**200**
```json
{ "success": true, "message": "State updated", "data": { "id": 11, "code": "KP", "name": "KPK", "isActive": true, "countryId": 1 } }
```
**404** — state (or referenced country) does not exist.

### `DELETE /api/states/:id`

Path param `id` (integer > 0). **Soft delete** — sets `isActive=false`.

**200**
```json
{ "success": true, "message": "State deleted", "data": null }
```
**404** — state does not exist.

---

## Errors (shared)

All errors use the `ApiResponse` envelope with `success:false`, `data:null`.

| Status | When | Example `message` |
| ------ | ---- | ----------------- |
| 400 | Request validation failed | `code: Too small: expected string to have >=1 characters` |
| 404 | Resource (or referenced country) not found | `Country 999999 not found` |
| 404 | Unknown route | `Route GET /api/nope not found` |
| 500 | Unexpected server error | `Internal server error` (details logged server-side only) |
