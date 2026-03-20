---
name: symfony-lazy-services
description: >
  This skill should be used when the user asks about "lazy services",
  "service proxies", "lazy: true", or discusses deferred service
  instantiation in Symfony DI.
version: 1.0.0
---

## Lazy services

```yaml
# config/services.yaml
App\Service\HeavyReportService:
  lazy: true
```

Service proxy is injected immediately but the real object is only
instantiated on the first method call. Critical for CLI commands that
boot the full container but only use a subset of services.
