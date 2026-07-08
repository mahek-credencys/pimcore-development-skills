---
name: nodejs-api-development
description: >
  This skill should be used when the user asks to "build a REST API in Node",
  "Express route", "Express middleware", "error handler Express", "Fastify",
  or discusses structuring Node.js HTTP services, routers, or request validation.
version: 1.0.0
---

## Node.js API Development (Express 5)

Express 5 forwards rejected promises from async handlers to the error middleware
automatically — no `try/catch` or `next(err)` wrappers needed.

### Layered structure

```
src/
├── routes/product.routes.js    # HTTP wiring only
├── controllers/product.controller.js
├── services/product.service.js # business logic — framework-free
└── middleware/error.middleware.js
```

### Route + validation + centralized errors

```js
// routes/product.routes.js
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

router.post('/products', async (req, res) => {
  const body = createSchema.parse(req.body);      // throws 400-mappable ZodError
  const product = await productService.create(body);
  res.status(201).json(product);
});

export default router;
```

```js
// middleware/error.middleware.js — register LAST
export function errorHandler(err, req, res, next) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'validation_failed', issues: err.issues });
  }
  req.log?.error(err);
  res.status(err.statusCode ?? 500).json({ error: err.publicMessage ?? 'internal_error' });
}
```

### Must-haves for every service

- `app.use(express.json({ limit: '1mb' }))` — always cap body size.
- Health endpoint (`GET /healthz`) returning dependencies status for orchestrators.
- Graceful shutdown: close the HTTP server and DB pools on `SIGTERM`.
- Structured logging (`pino`) with a request-id per request.
- For high-throughput services prefer **Fastify** — same patterns, built-in schema
  validation and ~2x Express throughput.
