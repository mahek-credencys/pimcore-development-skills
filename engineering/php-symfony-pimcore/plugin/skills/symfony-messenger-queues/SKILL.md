---
name: symfony-messenger-queues
description: >
  This skill should be used when the user asks about "Symfony Messenger",
  "async messages", "message handlers", "AsMessageHandler", "message queues",
  "workers", "retry strategy", or discusses background job processing.
version: 1.0.0
---

## Messenger / queues

```php
// Message DTO
final class ImportProductMessage {
    public function __construct(
        public readonly int $productId,
        public readonly string $source = 'csv',
    ) {}
}

// Dispatch from controller or service
$this->bus->dispatch(new ImportProductMessage($id));

// Handler
#[AsMessageHandler]
class ImportProductHandler {
    public function __construct(private ProductImporter $importer) {}

    public function __invoke(ImportProductMessage $msg): void {
        $this->importer->import($msg->productId, $msg->source);
    }
}
```

```yaml
# config/packages/messenger.yaml
framework:
  messenger:
    transports:
      async:
        dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
        retry_strategy:
          max_retries: 3
          delay: 1000
          multiplier: 2
    routing:
      'App\Message\ImportProductMessage': async
```

```bash
php bin/console messenger:consume async --limit=500 --memory-limit=128M
```
