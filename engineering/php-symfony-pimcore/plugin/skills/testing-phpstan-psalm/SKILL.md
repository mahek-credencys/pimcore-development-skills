---
name: testing-phpstan-psalm
description: >
  This skill should be used when the user asks about "PHPStan", "static
  analysis", "phpstan analyse", "phpstan.neon", "type checking", or discusses
  PHP static analysis, level configuration, or ignoring errors.
version: 1.0.0
---

## PHPStan

```bash
vendor/bin/phpstan analyse src --level=8
```

```neon
# phpstan.neon
parameters:
  level: 8
  paths:
    - src
  ignoreErrors:
    - '#Call to an undefined method Pimcore\\Model\\DataObject#'
```
