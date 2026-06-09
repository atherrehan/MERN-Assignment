# Data Flow

How a request travels through the backend layers. The architecture rule: **routes**
map paths, **middleware** validates, **controllers** do request/response wiring only,
**services** own business logic + the only Drizzle access, and a **single error
handler** converts thrown errors into the `ApiResponse` envelope.

## Traced example: bulk country delete

Request:

```
POST /api/countries/bulk-delete
Content-Type: application/json

{ "ids": [19, 20, 1, 2] }
```

(19, 20 are state-less countries; 1 = Pakistan and 2 = United States both have states.)

### 1. App → router

`app.ts` mounts `app.use('/api/countries', countryRouter)`. The router matches
`POST /bulk-delete` (declared before `POST /` and `/:id`, so there's no capture
ambiguity) and runs its middleware chain:

```
router.post('/bulk-delete', validate(bulkDeleteSchema, 'body'), controller.bulkDelete)
```

### 2. Validation middleware (`common/validate.ts`)

`validate(bulkDeleteSchema, 'body')` runs `bulkDeleteSchema.safeParse(req.body)`:

- **Invalid** (e.g. `ids: []` or a non-integer) → throws `ValidationError` → skips
  the controller and goes straight to the error handler (→ **400** `ApiResponse`).
- **Valid** → stores the parsed value at `res.locals.validated.body = { ids: [...] }`
  and calls `next()`. The controller reads this typed value; it never re-validates.

### 3. Controller (`country.controller.ts`) — wiring only

```ts
bulkDelete = asyncHandler<ValidatedLocals<{ body: BulkDeleteInput }>>(async (_req, res) => {
  const result = await this.service.bulkDelete(res.locals.validated.body.ids)
  res.json(ok(result, `Deleted ${result.deletedIds.length}, skipped ${result.skipped.length}`))
})
```

It reads the validated `ids`, calls the service, and formats the response. No business
logic, no DB. `asyncHandler` forwards any thrown/rejected error to the error handler.

### 4. Service (`country.service.ts`) — business logic + the only DB access

`CountryService.bulkDelete(ids)`:

1. **Count states per requested country** (one query):
   ```sql
   SELECT country_id, count(*) FROM state WHERE country_id IN (19,20,1,2) GROUP BY country_id;
   -- → { 1: 2, 2: 3 }   (19 and 20 have no rows, so they're absent)
   ```
2. **Partition** the requested ids in memory using that map (`0 states` → deletable;
   `1+` → skipped with reason `"Country cannot be deleted with 1 or more states"`):
   - deletable: `[19, 20]`
   - skipped: `[{ id: 1, reason }, { id: 2, reason }]`
3. **Delete the deletable set** (one query), returning the rows actually removed:
   ```sql
   DELETE FROM country WHERE id IN (19,20) RETURNING id;   -- → [19, 20]
   ```
   `deletedIds` comes from `RETURNING`, so non-existent ids never appear.
4. Returns `{ deletedIds: [19, 20], skipped: [{id:1,...}, {id:2,...}] }`.

This mirrors the single-delete rule (a country with states is never deleted), but
reports partial success instead of throwing — no `ValidationError` is raised here.

### 5. Response

`ok(result, message)` builds the envelope; the controller sends it. Because nothing
threw, `success` is `true` even though some ids were skipped:

```json
{
  "success": true,
  "message": "Deleted 2, skipped 2",
  "data": {
    "deletedIds": [19, 20],
    "skipped": [
      { "id": 1, "reason": "Country cannot be deleted with 1 or more states" },
      { "id": 2, "reason": "Country cannot be deleted with 1 or more states" }
    ]
  }
}
```

### Contrast: state bulk delete

`StateService.bulkDelete(ids)` has no child-rows rule (states are leaf rows), so it
deletes every matching row in one `DELETE ... WHERE id IN (...)` and returns just
`{ deletedCount }`. Same route/middleware/controller shape; simpler service logic.
