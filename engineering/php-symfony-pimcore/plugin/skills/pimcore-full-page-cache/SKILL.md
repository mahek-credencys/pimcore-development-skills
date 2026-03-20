---
name: pimcore-full-page-cache
description: >
  This skill should be used when the user asks about "Pimcore full-page cache",
  "output caching", "pimcore_nocache", "full_page_cache lifetime", or discusses
  Pimcore HTTP-level caching or cache exclusion patterns.
version: 1.0.0
---

## Full-page cache

```yaml
# config/packages/pimcore.yaml
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
// Disable cache programmatically for dynamic pages
\Pimcore\Cache\Runtime::set('pimcore_nocache', true);
```
