---
name: nodejs-testing
description: >
  This skill should be used when the user asks about "testing a Node API",
  "Vitest", "Jest", "supertest", "mock a module in Node", or discusses unit
  and integration testing of Node.js services and HTTP endpoints.
version: 1.0.0
---

## Node.js Testing (Vitest + Supertest)

Vitest is the current default test runner — Jest-compatible API, native ESM/TS,
much faster. Same patterns apply to Jest.

### Unit test a service (mock dependencies, not internals)

```js
import { describe, it, expect, vi } from 'vitest';
import { ProductService } from '../src/services/product.service.js';

describe('ProductService', () => {
  it('throws when product is missing', async () => {
    const repo = { findById: vi.fn().mockResolvedValue(null) };
    const service = new ProductService(repo);

    await expect(service.get(999)).rejects.toThrow('not found');
    expect(repo.findById).toHaveBeenCalledWith(999);
  });
});
```

### Integration test HTTP endpoints with supertest

```js
import request from 'supertest';
import { app } from '../src/app.js';   // export the app WITHOUT .listen()

it('POST /products returns 201 with the created product', async () => {
  const res = await request(app)
    .post('/products')
    .send({ name: 'Widget', price: 9.99 })
    .expect(201);

  expect(res.body).toMatchObject({ name: 'Widget' });
});

it('rejects invalid payloads with 400', async () => {
  await request(app).post('/products').send({ price: -1 }).expect(400);
});
```

### Rules of thumb

- Separate `app` (exportable) from `server.listen()` so tests never bind a port.
- Inject dependencies via constructor/factory — `vi.mock()` on module paths is a
  last resort and couples tests to file layout.
- Integration tests hit a real database in Docker (Testcontainers) rather than
  mocking the driver — mocked SQL/queries hide real bugs.
- Coverage: `vitest run --coverage`; gate CI on the services layer, not global %.
