---
name: pimcore-datahub-api
description: >
  This skill should be used when the user asks about "Pimcore Datahub",
  "datahub GraphQL", "datahub REST", "PimcoreDataHubBundle", "datahub configuration",
  or discusses Pimcore Datahub-managed web services or API keys.
  Do not use for Pimcore Studio REST endpoints — use pimcore-studio-backend instead.
version: 1.1.0
---

## Datahub / API

```bash
composer require pimcore/data-hub
php bin/console pimcore:bundle:enable PimcoreDataHubBundle
php bin/console doctrine:migrations:migrate --no-interaction
```

- GraphQL: `/pimcore-datahub-webservices/graphql/{config-name}`
- Secure with API keys + Symfony firewall rules

## Simple REST API (Pimcore 12+)

New read-only REST API backed by OpenSearch / Elasticsearch — lighter alternative to GraphQL
for asset and data object delivery:

```bash
# Index data for Simple REST API
php bin/console datahub:simple-rest:rebuild-index
```

Endpoints follow the pattern `/datahub/rest/{config-name}/...` and return JSON.
Configure in Admin → Datahub → Simple REST.

## Pimcore 12 breaking changes

### GraphQL datetime type change

Date and datetime fields now return ISO 8601 strings instead of Unix timestamp integers:

```graphql
# OLD (Pimcore 11) — Unix timestamp integer
"releaseDate": 1709294400

# NEW (Pimcore 12) — ISO 8601 string with timezone
"releaseDate": "2024-03-01T12:00:00+00:00"
```

Update any client code that parsed datetime fields as integers.

### Command renamed

```bash
# OLD (removed in Pimcore 12)
php bin/console datahub:graphql:rebuild-definitions

# NEW
php bin/console datahub:graphql:rebuild-workspaces
```
