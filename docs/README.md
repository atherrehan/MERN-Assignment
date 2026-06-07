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
