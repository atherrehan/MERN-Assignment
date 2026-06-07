---
name: react-vite-shadcn-frontend
description: Frontend architecture for apps/web — React + Vite + TS strict + shadcn folder structure, react-router routes, the single Axios api-client, and the CRUD service-class pattern. Components never import Axios; they call service classes that return typed data from ApiResponse<T>.
---

# React + Vite + shadcn Frontend (`apps/web`)

Frontend for the Country & State app. Consumes the API defined in the hub
[country-state-app] and produced by [express-api-architecture].

## Folder structure

```
apps/web/
├─ src/
│  ├─ main.tsx                 # router provider mount
│  ├─ App.tsx                  # layout + <Outlet/>
│  ├─ routes.tsx               # react-router route tree
│  ├─ lib/
│  │  ├─ apiClient.ts          # the ONE axios instance + envelope unwrap
│  │  └─ utils.ts              # shadcn cn()
│  ├─ services/                # ONLY place axios is used (via apiClient)
│  │  ├─ country.service.ts
│  │  └─ state.service.ts
│  ├─ components/
│  │  └─ ui/                   # shadcn-generated components
│  ├─ pages/
│  │  ├─ countries/            # list / form pages
│  │  └─ states/
│  └─ types/                   # re-export from @app/shared if needed
├─ index.html
├─ vite.config.ts
├─ tailwind.config.ts
└─ tsconfig.json               # strict
```

## API client (the only Axios instance)

```ts
// lib/apiClient.ts
import axios from 'axios';
import type { ApiResponse } from '@app/shared';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
});

// Unwrap ApiResponse<T>: return data on success, throw message on failure.
export async function request<T>(
  fn: (h: typeof http) => Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  try {
    const { data } = await fn(http);
    if (!data.success) throw new Error(data.message);
    return data.data as T;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const msg = (err.response?.data as ApiResponse<unknown>)?.message;
      throw new Error(msg ?? err.message);
    }
    throw err;
  }
}
```

## Service-class pattern (only Axios consumers)

Components call these; they return **unwrapped, typed** data.

```ts
// services/country.service.ts
import { request } from '../lib/apiClient';
import type { Country } from '@app/shared';

export class CountryService {
  list()              { return request<Country[]>((h) => h.get('/countries')); }
  get(id: number)     { return request<Country>((h) => h.get(`/countries/${id}`)); }
  create(input: Omit<Country, 'id'>) {
    return request<Country>((h) => h.post('/countries', input));
  }
  update(id: number, input: Partial<Omit<Country, 'id'>>) {
    return request<Country>((h) => h.put(`/countries/${id}`, input));
  }
  remove(id: number)  { return request<null>((h) => h.delete(`/countries/${id}`)); }
}
export const countryService = new CountryService();
```

`StateService` mirrors this, adding query params for filtered list:

```ts
list(params?: { countryId?: number; search?: string }) {
  return request<State[]>((h) => h.get('/states', { params }));
}
```

## Routing (react-router)

```tsx
// routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import CountriesPage from './pages/countries/CountriesPage';
import StatesPage from './pages/states/StatesPage';

export const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <CountriesPage /> },
    { path: 'countries', element: <CountriesPage /> },
    { path: 'states', element: <StatesPage /> },
  ]},
]);
```

## Rules

1. **Components never import `axios`.** They import a service class and `await` its
   methods. Axios lives only in `lib/apiClient.ts`, used only by `services/`.
2. Services return **unwrapped** `T` (or throw). Components never see `ApiResponse`.
3. Types come from `@app/shared` — never redefine `Country`/`State`/`ApiResponse`.
4. UI is shadcn components in `components/ui` + Tailwind; no other UI kit.
5. TS strict. No `any` in service signatures.
6. Surface thrown error `message` in the UI (toast/inline) — it is already the
   server's `ApiResponse.message`.

## Related skills

- [country-state-app] — contract, shared types, API surface.
- [express-api-architecture] — the API these services call.
- [drizzle-postgres-schema] — where the data ultimately lives.
