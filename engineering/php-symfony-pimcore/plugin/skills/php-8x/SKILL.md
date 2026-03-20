---
name: php-8x
description: >
  This skill should be used when the user asks to "use match expressions",
  "use backed enums", "use fibers", "use named arguments", "use constructor
  promotion", or discusses PHP 8.x features, enums, fibers, or modern PHP syntax.
version: 1.0.0
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
