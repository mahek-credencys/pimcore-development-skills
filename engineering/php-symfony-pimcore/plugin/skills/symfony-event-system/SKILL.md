---
name: symfony-event-system
description: >
  This skill should be used when the user asks about "event subscribers",
  "event listeners", "kernel events", "AsEventListener", or discusses
  Symfony EventDispatcher, KernelEvents, or Pimcore DataObjectEvents.
version: 1.0.0
---

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
