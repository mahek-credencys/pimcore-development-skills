---
name: api-design-standards
description: >
  This skill should be used when the user asks about "REST API design",
  "HTTP status codes", "API versioning", "pagination design", "error response
  format", or discusses designing consistent HTTP APIs across services.
version: 1.0.0
---

## API Design Standards

Consistency across endpoints matters more than any single convention — pick
these defaults once and enforce them in review.

### Resources & methods

```
GET    /api/v1/products            list (filter via query params)
POST   /api/v1/products            create → 201 + Location header
GET    /api/v1/products/{id}       fetch → 200 or 404
PATCH  /api/v1/products/{id}       partial update → 200
DELETE /api/v1/products/{id}       delete → 204
POST   /api/v1/orders/{id}/cancel  action that isn't CRUD → verb sub-resource
```

- Nouns, plural, kebab-case paths; camelCase JSON fields.
- Version in the path (`/v1`) from day one; additive changes don't bump it —
  removed/renamed fields do.

### Status codes that matter

| Code | Use |
|---|---|
| 200/201/204 | OK / created / deleted-no-body |
| 400 | Malformed or invalid input (include field errors) |
| 401 vs 403 | Not authenticated vs authenticated-but-forbidden |
| 404 | Missing resource (also for forbidden-by-ownership to avoid leaking existence) |
| 409 | Conflict (duplicate, stale version) |
| 422 | Semantically invalid (business rule) — if you distinguish from 400 |
| 429 | Rate limited (+ `Retry-After`) |

Never return 200 with `{"success": false}` — clients and monitoring both break.

### One error shape everywhere

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Request validation failed.",
    "details": [{ "field": "price", "issue": "must be positive" }],
    "requestId": "req_8f3a1c"
  }
}
```

Machine-readable `code` (stable), human `message` (changeable), `requestId`
correlating to logs. (RFC 9457 `application/problem+json` is the standard form.)

### Pagination, filtering, sorting

```
GET /api/v1/products?filter[status]=active&sort=-createdAt&cursor=eyJpZCI6NDJ9&limit=50
```

Cursor-based for anything that grows; response carries `nextCursor` (null when
done) and never a total count unless truly needed (counts are expensive).

### Rules of thumb

- Idempotency: PUT/PATCH/DELETE naturally; POST via `Idempotency-Key` header
  for payment-like operations.
- Timestamps: ISO 8601 UTC (`2026-07-08T12:00:00Z`) — never epoch integers in JSON.
- Document with OpenAPI generated from code (FastAPI, zod-openapi, API Platform)
  so docs can't drift.
