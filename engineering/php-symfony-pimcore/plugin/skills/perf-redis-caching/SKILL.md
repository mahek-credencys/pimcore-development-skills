---
name: perf-redis-caching
description: >
  This skill should be used when the user asks about "Redis caching",
  "cache pools", "Symfony cache adapter", "Redis sessions", "REDIS_URL",
  or discusses configuring Redis as a cache or session backend.
version: 1.0.0
---

## Redis caching

```yaml
# config/packages/framework.yaml
framework:
  cache:
    default_redis_provider: '%env(REDIS_URL)%'
    pools:
      cache.products:
        adapter: cache.adapter.redis
        default_lifetime: 3600
      cache.pimcore:
        adapter: cache.adapter.redis
        default_lifetime: 600
  session:
    handler_id: '%env(REDIS_URL)%'
```

```bash
# .env
REDIS_URL=redis://localhost:6379
```
