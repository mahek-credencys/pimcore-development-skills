---
name: docker-dev-environments
description: >
  This skill should be used when the user asks about "docker compose for
  development", "local dev environment", "compose file for MySQL/Mongo/Redis",
  "hot reload in Docker", or discusses standardizing team development environments.
version: 1.0.0
---

## Docker Dev Environments (Compose)

One `compose.yaml` in the repo means every developer runs the same stack:
`docker compose up` and you're productive on day one.

```yaml
# compose.yaml
services:
  app:
    build: { context: ., target: dev }        # dev stage of a multi-stage Dockerfile
    volumes:
      - .:/app                                # bind mount → hot reload
      - /app/node_modules                     # keep container's deps, not host's
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: mysql://app:app@db:3306/app
      MONGO_URL: mongodb://mongo:27017/app
    depends_on:
      db: { condition: service_healthy }      # wait for REAL readiness, not start

  db:
    image: mysql:8.4                          # pin versions — match production
    environment:
      MYSQL_DATABASE: app
      MYSQL_USER: app
      MYSQL_PASSWORD: app
      MYSQL_ROOT_PASSWORD: root
    volumes: [dbdata:/var/lib/mysql]
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      retries: 10

  mongo:
    image: mongo:8.0
    volumes: [mongodata:/data/db]

  redis:
    image: redis:7-alpine

volumes:
  dbdata:
  mongodata:
```

### Multi-stage Dockerfile — dev and prod from one file

```dockerfile
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm ci
CMD ["npm", "run", "dev"]

FROM base AS prod
RUN npm ci --omit=dev
COPY . .
CMD ["node", "src/server.js"]
```

### Rules of thumb

- Pin image versions to what production runs (`mysql:8.4`, not `latest`).
- Named volumes for data (survive `down`); `docker compose down -v` = clean slate.
- Service names are hostnames on the compose network — `db:3306`, never `localhost`.
- Secrets/dev credentials in `.env` (gitignored) + committed `.env.example`.
- `compose.override.yaml` for personal tweaks (extra ports, tools) without
  touching the shared file.
- Seed script (`make seed` / fixture container) so a fresh environment has data.
