---
name: pimcore-full-page-cache
description: >
  This skill should be used when the user asks about "Pimcore full-page cache",
  "output caching", "pimcore_nocache", "full_page_cache lifetime", or discusses
  Pimcore HTTP-level caching or cache exclusion patterns.
version: 1.1.0
---

## Full-page cache

```yaml
# config/packages/pimcore.yaml — unchanged in Pimcore 12
pimcore:
  full_page_cache:
    enabled: true
    lifetime: 120
    exclude_patterns:
      - ^/admin
      - ^/api
      - ^/user
      - ^/cart
```

```php
// Disable cache programmatically for dynamic pages (Pimcore 12+)
\Pimcore\Cache\RuntimeCache::set('pimcore_nocache', true);

// NOTE: \Pimcore\Cache\Runtime is a deprecated alias — still works in Pimcore 12
// but will be removed in a future version. Use RuntimeCache.
```

## Pimcore 12 changes

- **YAML config unchanged** — `pimcore.full_page_cache` keys are identical to Pimcore 11
- **`\Pimcore\Cache\Runtime` renamed** to `\Pimcore\Cache\RuntimeCache` (old name is a
  backward-compat alias; new code must use `RuntimeCache`)
- **`Cache-Control: no-store`** — responses carrying this header are now automatically excluded
  from full-page cache; no need to set `pimcore_nocache` manually for these responses
