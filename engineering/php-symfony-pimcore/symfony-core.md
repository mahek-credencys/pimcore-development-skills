---
id: symfony-core
category: Symfony core
level: Expert
skills:
  - name: Service container
    detail: DI, autowiring, tagging
  - name: Routing & controllers
    detail: Attributes, param converters
  - name: Event system
    detail: Subscribers, listeners
  - name: Lazy services
    detail: Load only on use
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

## Routing & controllers

```php
#[Route('/products/{slug}', name: 'product_show', methods: ['GET'])]
public function show(
    #[MapEntity(mapping: ['slug' => 'slug'])]
    Product $product,
    Request $request,
): Response {
    return $this->render('product/show.html.twig', [
        'product' => $product,
    ]);
}
```

## Event system

```php
// Pimcore object pre-save listener via attribute
#[AsEventListener(event: DataObjectEvents::PRE_UPDATE)]
public function onObjectPreUpdate(ElementEventInterface $event): void {
    $object = $event->getElement();
    if ($object instanceof Product) {
        $object->setUpdatedAt(new \DateTime());
    }
}

// Symfony kernel event subscriber
class LocaleSubscriber implements EventSubscriberInterface {
    public static function getSubscribedEvents(): array {
        return [KernelEvents::REQUEST => [['onKernelRequest', 20]]];
    }

    public function onKernelRequest(RequestEvent $event): void {
        $request = $event->getRequest();
        if ($locale = $request->attributes->get('_locale')) {
            $request->getSession()->set('_locale', $locale);
        }
    }
}
```

## Lazy services

```yaml
# config/services.yaml
App\Service\HeavyReportService:
  lazy: true
```

Service proxy is injected immediately but the real object is only
instantiated on the first method call. Critical for CLI commands that
boot the full container but only use a subset of services.
