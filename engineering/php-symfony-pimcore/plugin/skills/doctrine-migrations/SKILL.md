---
name: doctrine-migrations
description: >
  This skill should be used when the user asks to "generate a migration",
  "run migrations", "check migration status", or discusses Doctrine
  schema evolution, doctrine:migrations:diff, or CI migration steps.
version: 1.0.0
---

## Migrations

```bash
# Generate migration from entity changes
php bin/console doctrine:migrations:diff

# Review generated file in migrations/, then:
php bin/console doctrine:migrations:migrate --no-interaction

# In CI/CD — allow no pending migration without error
php bin/console doctrine:migrations:migrate \
  --no-interaction --allow-no-migration

# Check current status
php bin/console doctrine:migrations:status
```
