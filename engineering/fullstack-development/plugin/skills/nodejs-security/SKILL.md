---
name: nodejs-security
description: >
  This skill should be used when the user asks about "securing a Node API",
  "helmet", "rate limiting", "CORS setup", "dotenv secrets", "npm audit",
  or discusses Node.js security headers, injection prevention, or dependency
  vulnerabilities.
version: 1.0.0
---

## Node.js Security Essentials

### Baseline middleware — every public API

```js
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

app.use(helmet());                                   // security headers
app.use(cors({ origin: allowedOrigins }));           // never origin: '*' with credentials
app.use(rateLimit({ windowMs: 60_000, limit: 100 })); // per-IP throttle
```

### Secrets & config

- Secrets come from environment variables (or a secret manager) — never committed.
- Validate config at boot so misconfiguration fails fast:

```js
import { z } from 'zod';

const env = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'test', 'production']),
}).parse(process.env);
```

### Injection & input rules

- Validate **every** external input (body, query, params, headers) with a schema.
- SQL: parameterized queries only — never string-concatenate values.
- MongoDB: reject operator injection (`{"$gt": ""}` in login payloads) — schema
  validation with strict types prevents it.
- Never pass user input to `eval`, `Function`, `child_process.exec`, or template strings
  used as shell commands (use `execFile` with an args array).

### Auth quick rules

- Hash passwords with `argon2` (or `bcrypt`, cost ≥ 12) — never SHA/MD5.
- JWTs: short expiry, verify algorithm explicitly (`{ algorithms: ['HS256'] }`),
  store in httpOnly cookies rather than localStorage.

### Supply chain

```bash
npm audit --omit=dev          # CI gate on high/critical
npm ci                        # lockfile-exact installs in CI/CD
```

Pin Node to the active LTS line (Node 24 as of 2026) and rebuild images regularly.
