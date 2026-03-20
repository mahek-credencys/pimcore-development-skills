---
name: php-oop-solid
description: >
  This skill should be used when the user asks about "SOLID principles",
  "dependency inversion", "interface segregation", "open/closed principle",
  or discusses OOP design patterns, interfaces, or decorators in PHP.
version: 1.0.0
---

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
