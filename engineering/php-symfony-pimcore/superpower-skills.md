---
id: superpower-skills
category: Superpower skills
level: Expert
skills:
  - name: Messenger / queues
    detail: Async, workers, retry
  - name: Console commands
    detail: Batch jobs, imports
  - name: Custom bundles
    detail: Extend Pimcore core
  - name: Security
    detail: Voters, firewalls
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

## Console commands

```php
#[AsCommand(name: 'app:import-products', description: 'Bulk import from CSV')]
class ImportProductsCommand extends Command {
    public function __construct(
        private readonly ProductReader $reader,
        private readonly ProductImporter $importer,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $in, OutputInterface $out): int {
        $io = new SymfonyStyle($in, $out);
        $io->progressStart();

        foreach ($this->reader->getBatches(500) as $batch) {
            $this->importer->import($batch);
            $this->em->clear();            // free memory between batches
            $io->progressAdvance(count($batch));
        }

        $io->progressFinish();
        $io->success('Import complete.');
        return Command::SUCCESS;
    }
}
```

## Custom bundles

```
src/
  CredencysProductBundle/
    CredencysProductBundle.php
    DependencyInjection/
      Configuration.php
      CredencysProductExtension.php
    EventListener/
      ProductSaveListener.php
    Resources/config/services.yaml
```

```php
class CredencysProductBundle extends AbstractBundle {
    public function configure(DefinitionConfigurator $def): void {
        $def->rootNode()->children()
            ->booleanNode('auto_publish')->defaultFalse()->end()
            ->integerNode('cache_ttl')->defaultValue(3600)->end()
        ->end();
    }
}
```

## Security — Voters

```php
class ProductVoter extends Voter {
    const EDIT   = 'PRODUCT_EDIT';
    const DELETE = 'PRODUCT_DELETE';

    protected function supports(string $attr, mixed $subject): bool {
        return in_array($attr, [self::EDIT, self::DELETE])
            && $subject instanceof Product;
    }

    protected function voteOnAttribute(
        string $attr, mixed $subject, TokenInterface $token
    ): bool {
        $user = $token->getUser();
        if (!$user instanceof User) return false;

        return match($attr) {
            self::EDIT   => $user->hasRole('ROLE_EDITOR'),
            self::DELETE => $user->hasRole('ROLE_ADMIN'),
            default      => false,
        };
    }
}
```
