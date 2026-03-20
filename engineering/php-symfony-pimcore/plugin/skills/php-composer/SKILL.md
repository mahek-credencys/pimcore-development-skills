---
name: php-composer
description: >
  This skill should be used when the user asks to "install packages",
  "require a dependency", "optimise autoloading", "run composer install",
  or discusses Composer, autoloading, or PHP dependency management.
version: 1.0.0
---

## Composer

```bash
# Install dependencies
composer require symfony/messenger pimcore/pimcore
composer require --dev phpstan/phpstan friendsofphp/php-cs-fixer

# Production optimisations
composer install --no-dev --optimize-autoloader
composer dump-autoload --optimize --classmap-authoritative
```
