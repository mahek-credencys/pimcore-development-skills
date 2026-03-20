---
name: perf-profiling
description: >
  This skill should be used when the user asks about "profiling", "Blackfire",
  "Xdebug profiler", "cachegrind", "peak memory", "SQL query count", or
  discusses PHP performance measurement or bottleneck analysis.
version: 1.0.0
---

## Profiling

```bash
# Blackfire — profile a CLI command
blackfire run php bin/console app:import-products

# Blackfire — profile an HTTP request
blackfire curl https://your-pimcore-site.com/products

# Xdebug — enable profiling mode
XDEBUG_MODE=profile php bin/console app:import-products
# Open var/cache/xdebug/*.cachegrind in PHPStorm / KCachegrind
```

Key metrics: peak memory, wall time, I/O wait, SQL query count.
Target: < 50 SQL queries per page, < 32 MB memory per request.
