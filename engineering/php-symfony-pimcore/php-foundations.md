---
id: php-foundations
category: PHP foundations
level: Expert
skills:
  - name: PHP 8.x
    detail: Fibers, match, enums
  - name: OOP & SOLID
    detail: Interfaces, DI, patterns
  - name: Composer
    detail: Autoloading, versioning
  - name: OPcache config
    detail: Preloading, cache tuning
---

## PHP 8.x

Use `match` over `switch` — strict comparison, no fall-through, returns a value.
Backed enums replace string/int constants with full type safety.
Fibers enable cooperative multitasking inside Symfony Messenger workers.
Named arguments + constructor promotion reduce boilerplate significantly.

```php
// Backed enum
enum Status: string {
    case Active   = 'active';
    case Inactive = 'inactive';
}

// Constructor promotion
class ProductService {
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger,
    ) {}
}

// Fiber example
$fiber = new Fiber(function(): void {
    $value = Fiber::suspend('first');
    echo "Resumed with: " . $value;
});
$fiber->start();
$fiber->resume('hello');

// Match expression
$label = match($status) {
    Status::Active   => 'Live',
    Status::Inactive => 'Draft',
};
```

## OOP & SOLID

- **S** Single Responsibility: one service, one job
- **O** Open/Closed: extend via events/decorators, never modify core classes
- **L** Liskov: subtypes must honour parent contracts
- **I** Interface Segregation: small focused interfaces over fat ones
- **D** Dependency Inversion: inject interfaces, never concrete classes

```php
interface ProductImporterInterface {
    public function import(array $data): void;
}

class CsvProductImporter implements ProductImporterInterface {
    public function import(array $data): void { /* ... */ }
}

// Use #[Autoconfigure] to auto-tag implementations
#[Autoconfigure(tags: ['app.product_importer'])]
class XmlProductImporter implements ProductImporterInterface {
    public function import(array $data): void { /* ... */ }
}
```

## Composer

```bash
# Install dependencies
composer require symfony/messenger pimcore/pimcore
composer require --dev phpstan/phpstan friendsofphp/php-cs-fixer

# Production optimisations
composer install --no-dev --optimize-autoloader
composer dump-autoload --optimize --classmap-authoritative
```

## OPcache config

```ini
; php.ini — production settings
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.preload=/var/www/config/preload.php
opcache.preload_user=www-data
opcache.validate_timestamps=0
opcache.revalidate_freq=0
opcache.interned_strings_buffer=16
```
