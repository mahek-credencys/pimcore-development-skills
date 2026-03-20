---
name: symfony-service-container
description: >
  This skill should be used when the user asks to "configure services",
  "set up dependency injection", "autowire a service", "tag services",
  "use tagged iterators", or discusses Symfony DI container, services.yaml,
  or AutoconfigureTag.
version: 1.0.0
---

## Service container

```yaml
# config/services.yaml
services:
  _defaults:
    autowire: true
    autoconfigure: true
    public: false

  App\Service\:
    resource: '../src/Service/'
```

```php
// Tagged iterator — inject all tagged services
#[AutoconfigureTag('app.product_processor')]
interface ProductProcessorInterface {}

class ProductPipeline {
    public function __construct(
        #[TaggedIterator('app.product_processor')]
        private iterable $processors,
    ) {}
}
```
