---
name: perf-elasticsearch
description: >
  This skill should be used when the user asks about "Elasticsearch",
  "FOSElasticaBundle", "fos:elastica:populate", "product search indexing",
  or discusses full-text search, index configuration, or search persistence.
version: 1.0.0
---

## Elasticsearch

```bash
composer require friendsofsymfony/elastica-bundle
php bin/console fos:elastica:create     # create indices
php bin/console fos:elastica:populate   # index all objects
```

```yaml
# config/packages/fos_elastica.yaml
fos_elastica:
  clients:
    default: { host: '%env(ELASTICSEARCH_HOST)%', port: 9200 }
  indexes:
    products:
      persistence:
        driver: orm
        model: App\Entity\Product
        finder: ~
      properties:
        name:  { type: text }
        price: { type: float }
        slug:  { type: keyword }
```
