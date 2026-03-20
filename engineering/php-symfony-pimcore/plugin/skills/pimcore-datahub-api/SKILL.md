---
name: pimcore-datahub-api
description: >
  This skill should be used when the user asks about "Pimcore Datahub",
  "Pimcore GraphQL", "Pimcore REST API", "PimcoreDataHubBundle", or
  discusses Pimcore web services, API keys, or datahub configuration.
version: 1.0.0
---

## Datahub / API

```bash
composer require pimcore/data-hub
php bin/console pimcore:bundle:enable PimcoreDataHubBundle
php bin/console doctrine:migrations:migrate --no-interaction
```

- GraphQL: `/pimcore-datahub-webservices/graphql/{config-name}`
- REST:    `/webservice/rest/object/id/{id}?apikey={key}`
- Secure with API keys + Symfony firewall rules
