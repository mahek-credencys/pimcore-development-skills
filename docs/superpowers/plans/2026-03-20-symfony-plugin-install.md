# PHP · Symfony · Pimcore Global Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package 28 PHP/Symfony/Pimcore reference skills as a Claude Code plugin installed globally via a repo-backed symlink.

**Architecture:** Create `engineering/php-symfony-pimcore/plugin/` containing `plugin.json` and 28 `skills/<name>/SKILL.md` files, then symlink that directory into `~/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0` and register it in Claude Code's config files.

**Tech Stack:** Claude Code plugin format (SKILL.md frontmatter), JSON config files, bash symlink

---

## File Map

### Files to create (in-repo)

| Path | Purpose |
|---|---|
| `engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json` | Plugin metadata |
| `engineering/php-symfony-pimcore/plugin/skills/php-8x/SKILL.md` | PHP 8.x features skill |
| `engineering/php-symfony-pimcore/plugin/skills/php-oop-solid/SKILL.md` | OOP & SOLID skill |
| `engineering/php-symfony-pimcore/plugin/skills/php-composer/SKILL.md` | Composer skill |
| `engineering/php-symfony-pimcore/plugin/skills/php-opcache/SKILL.md` | OPcache config skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-service-container/SKILL.md` | Service container skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-routing-controllers/SKILL.md` | Routing & controllers skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-event-system/SKILL.md` | Event system skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-lazy-services/SKILL.md` | Lazy services skill |
| `engineering/php-symfony-pimcore/plugin/skills/doctrine-entities-mapping/SKILL.md` | Entities & mapping skill |
| `engineering/php-symfony-pimcore/plugin/skills/doctrine-querybuilder-dql/SKILL.md` | QueryBuilder / DQL skill |
| `engineering/php-symfony-pimcore/plugin/skills/doctrine-lazy-loading/SKILL.md` | N+1 / lazy loading skill |
| `engineering/php-symfony-pimcore/plugin/skills/doctrine-migrations/SKILL.md` | Migrations skill |
| `engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md` | Data objects skill |
| `engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md` | Documents & pages skill |
| `engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md` | Datahub / API skill |
| `engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md` | Full-page cache skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-messenger-queues/SKILL.md` | Messenger / queues skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-console-commands/SKILL.md` | Console commands skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-custom-bundles/SKILL.md` | Custom bundles skill |
| `engineering/php-symfony-pimcore/plugin/skills/symfony-security-voters/SKILL.md` | Security voters skill |
| `engineering/php-symfony-pimcore/plugin/skills/perf-profiling/SKILL.md` | Profiling skill |
| `engineering/php-symfony-pimcore/plugin/skills/perf-redis-caching/SKILL.md` | Redis caching skill |
| `engineering/php-symfony-pimcore/plugin/skills/perf-elasticsearch/SKILL.md` | Elasticsearch skill |
| `engineering/php-symfony-pimcore/plugin/skills/perf-ci-cd-docker/SKILL.md` | CI/CD & Docker skill |
| `engineering/php-symfony-pimcore/plugin/skills/testing-phpunit/SKILL.md` | PHPUnit skill |
| `engineering/php-symfony-pimcore/plugin/skills/testing-functional/SKILL.md` | Functional testing skill |
| `engineering/php-symfony-pimcore/plugin/skills/testing-phpstan-psalm/SKILL.md` | PHPStan skill |
| `engineering/php-symfony-pimcore/plugin/skills/testing-cs-fixer/SKILL.md` | CS Fixer skill |

### Files to modify (global Claude config)

| Path | Change |
|---|---|
| `~/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0` | Create as symlink to repo `plugin/` dir |
| `~/.claude/plugins/installed_plugins.json` | Add `php-symfony-pimcore@local` entry |
| `~/.claude/settings.json` | Add `php-symfony-pimcore@local: true` to `enabledPlugins` |

---

## Task 1: Create plugin.json

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json`

- [ ] **Step 1: Create the file**

```json
{
  "name": "php-symfony-pimcore",
  "description": "Expert-level PHP 8.x, Symfony 6/7, Pimcore 11, Doctrine ORM, testing, and ops skills",
  "author": {
    "name": "mahek-credencys"
  }
}
```

Write this to `engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json`.

- [ ] **Step 2: Verify**

```bash
cat engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json
```

Expected: valid JSON with the three fields above.

---

## Task 2: Create PHP Foundations skills

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/php-8x/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/php-oop-solid/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/php-composer/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/php-opcache/SKILL.md`
- Source: `engineering/php-symfony-pimcore/php-foundations.md`

- [ ] **Step 1: Create `php-8x/SKILL.md`**

```markdown
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
```

- [ ] **Step 2: Create `php-oop-solid/SKILL.md`**

```markdown
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
```

- [ ] **Step 3: Create `php-composer/SKILL.md`**

```markdown
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
```

- [ ] **Step 4: Create `php-opcache/SKILL.md`**

```markdown
---
name: php-opcache
description: >
  This skill should be used when the user asks about "OPcache configuration",
  "preloading", "opcache settings", "php.ini performance", or discusses PHP
  bytecode cache, memory consumption, or validate_timestamps.
version: 1.0.0
---

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
```

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/
git commit -m "feat: add plugin.json and PHP foundations skills"
```

---

## Task 3: Create Symfony Core skills

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-service-container/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-routing-controllers/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-event-system/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-lazy-services/SKILL.md`
- Source: `engineering/php-symfony-pimcore/symfony-core.md`

- [ ] **Step 1: Create `symfony-service-container/SKILL.md`**

```markdown
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
```

- [ ] **Step 2: Create `symfony-routing-controllers/SKILL.md`**

```markdown
---
name: symfony-routing-controllers
description: >
  This skill should be used when the user asks about "routing", "controller
  attributes", "param converters", "MapEntity", "route requirements", or
  discusses Symfony routes, #[Route], or controller request mapping.
version: 1.0.0
---

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
```

- [ ] **Step 3: Create `symfony-event-system/SKILL.md`**

```markdown
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
```

- [ ] **Step 4: Create `symfony-lazy-services/SKILL.md`**

```markdown
---
name: symfony-lazy-services
description: >
  This skill should be used when the user asks about "lazy services",
  "service proxies", "lazy: true", or discusses deferred service
  instantiation in Symfony DI.
version: 1.0.0
---

## Lazy services

```yaml
# config/services.yaml
App\Service\HeavyReportService:
  lazy: true
```

Service proxy is injected immediately but the real object is only
instantiated on the first method call. Critical for CLI commands that
boot the full container but only use a subset of services.
```

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/symfony-service-container \
        engineering/php-symfony-pimcore/plugin/skills/symfony-routing-controllers \
        engineering/php-symfony-pimcore/plugin/skills/symfony-event-system \
        engineering/php-symfony-pimcore/plugin/skills/symfony-lazy-services
git commit -m "feat: add Symfony core skills"
```

---

## Task 4: Create Doctrine ORM skills

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/doctrine-entities-mapping/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/doctrine-querybuilder-dql/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/doctrine-lazy-loading/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/doctrine-migrations/SKILL.md`
- Source: `engineering/php-symfony-pimcore/doctrine-orm.md`

- [ ] **Step 1: Create `doctrine-entities-mapping/SKILL.md`**

```markdown
---
name: doctrine-entities-mapping
description: >
  This skill should be used when the user asks about "Doctrine entities",
  "ORM mapping", "table attributes", "ManyToOne", "OneToMany", or discusses
  Doctrine PHP attributes, entity relations, or repository classes.
version: 1.0.0
---

## Entities & mapping

```php
#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\Table(name: 'products')]
#[ORM\Index(columns: ['slug'], name: 'idx_product_slug')]
class Product {
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private int $id;

    #[ORM\Column(length: 255, unique: true)]
    private string $slug;

    #[ORM\ManyToOne(targetEntity: Category::class, fetch: 'LAZY')]
    #[ORM\JoinColumn(nullable: false)]
    private Category $category;

    #[ORM\OneToMany(
        targetEntity: Variant::class,
        mappedBy: 'product',
        fetch: 'EXTRA_LAZY',
        cascade: ['persist', 'remove'],
        orphanRemoval: true,
    )]
    private Collection $variants;
}
```
```

- [ ] **Step 2: Create `doctrine-querybuilder-dql/SKILL.md`**

```markdown
---
name: doctrine-querybuilder-dql
description: >
  This skill should be used when the user asks to "write a custom query",
  "use QueryBuilder", "write DQL", "use array hydration", or discusses
  Doctrine query building, joins, parameters, or result hydration.
version: 1.0.0
---

## QueryBuilder / DQL

```php
// Fetch only needed columns — never hydrate full objects for list views
$results = $this->em->createQueryBuilder()
    ->select('p.id, p.name, p.price, c.name AS category')
    ->from(Product::class, 'p')
    ->leftJoin('p.category', 'c')
    ->where('p.active = :active')
    ->andWhere('p.price BETWEEN :min AND :max')
    ->setParameters(['active' => true, 'min' => 10, 'max' => 500])
    ->orderBy('p.name', 'ASC')
    ->setMaxResults(50)
    ->getQuery()
    ->getArrayResult();   // array hydration = far less memory than object hydration
```
```

- [ ] **Step 3: Create `doctrine-lazy-loading/SKILL.md`**

```markdown
---
name: doctrine-lazy-loading
description: >
  This skill should be used when the user asks about "N+1 queries",
  "EXTRA_LAZY", "JOIN fetch", "batch processing", "em clear", or discusses
  avoiding excessive Doctrine queries or memory leaks in loops.
version: 1.0.0
---

## Avoid N+1 — EXTRA_LAZY + JOIN fetch

```php
// BAD — triggers N additional queries for each product's category
foreach ($products as $p) {
    echo $p->getCategory()->getName();
}

// GOOD — single LEFT JOIN in one query
$qb->leftJoin('p.category', 'c')->addSelect('c');

// For large collections: EXTRA_LAZY + slice avoids full collection load
$variants = $product->getVariants()->slice(0, 20);

// Batch processing — clear EntityManager between batches
foreach ($reader->getBatches(500) as $batch) {
    $this->process($batch);
    $this->em->clear();   // frees memory
}
```
```

- [ ] **Step 4: Create `doctrine-migrations/SKILL.md`**

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/doctrine-entities-mapping \
        engineering/php-symfony-pimcore/plugin/skills/doctrine-querybuilder-dql \
        engineering/php-symfony-pimcore/plugin/skills/doctrine-lazy-loading \
        engineering/php-symfony-pimcore/plugin/skills/doctrine-migrations
git commit -m "feat: add Doctrine ORM skills"
```

---

## Task 5: Create Pimcore skills

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md`
- Source: `engineering/php-symfony-pimcore/pimcore.md`

- [ ] **Step 1: Create `pimcore-data-objects/SKILL.md`**

```markdown
---
name: pimcore-data-objects
description: >
  This skill should be used when the user asks about "Pimcore data objects",
  "object classes", "object bricks", "field collections", "DataObject listing",
  or discusses Pimcore CMS data modelling or DataObject PHP API.
version: 1.0.0
---

## Data objects

Classes are defined in Admin UI → auto-generates PHP classes under
`App\Model\DataObject\`. Object bricks = optional field groups.
Field collections = repeatable sub-structures (e.g. line items).

```php
// Load and update a product data object
$product = DataObject\Product::getById(42);
$product->setName('Updated Name');
$product->setPublished(true);
$product->save();

// Listing with conditions + pagination
$list = new DataObject\Product\Listing();
$list->setCondition('active = 1 AND price > ?', [100]);
$list->setOrderKey('name');
$list->setOrder('ASC');
$list->setLimit(50);
$list->setOffset(0);
$products = $list->load();
```
```

- [ ] **Step 2: Create `pimcore-documents-pages/SKILL.md`**

```markdown
---
name: pimcore-documents-pages
description: >
  This skill should be used when the user asks about "Pimcore documents",
  "Pimcore pages", "editables", "areas", "pimcore_input", "pimcore_wysiwyg",
  or discusses Pimcore CMS page rendering or Twig editables.
version: 1.0.0
---

## Documents & pages

```php
#[Route('/products/{path}', name: 'product_page',
    requirements: ['path' => '.*'], methods: ['GET'])]
public function page(Document\Page $document): Response {
    return $this->render('product/page.html.twig', [
        'document' => $document,
    ]);
}
```

```twig
{# templates/product/page.html.twig #}
{{ pimcore_input('headline', { width: 950 }) }}
{{ pimcore_wysiwyg('body') }}
{{ pimcore_image('hero', { width: 1200, height: 400 }) }}
{{ pimcore_renderlet('relatedProducts', { type: 'document' }) }}
```
```

- [ ] **Step 3: Create `pimcore-datahub-api/SKILL.md`**

```markdown
---
name: pimcore-datahub-api
description: >
  This skill should be used when the user asks about "Pimcore Datahub",
  "Pimcore GraphQL", "Pimcore REST API", "PimcoreDataHubBundle", or
  discusses Pimcore web services, API keys, or datahub configuration.
version: 1.0.0
---

## Datahub / API

```bash
composer require pimcore/data-hub
php bin/console pimcore:bundle:enable PimcoreDataHubBundle
php bin/console doctrine:migrations:migrate --no-interaction
```

- GraphQL: `/pimcore-datahub-webservices/graphql/{config-name}`
- REST:    `/webservice/rest/object/id/{id}?apikey={key}`
- Secure with API keys + Symfony firewall rules
```

- [ ] **Step 4: Create `pimcore-full-page-cache/SKILL.md`**

```markdown
---
name: pimcore-full-page-cache
description: >
  This skill should be used when the user asks about "Pimcore full-page cache",
  "output caching", "pimcore_nocache", "full_page_cache lifetime", or discusses
  Pimcore HTTP-level caching or cache exclusion patterns.
version: 1.0.0
---

## Full-page cache

```yaml
# config/packages/pimcore.yaml
pimcore:
  full_page_cache:
    enabled: true
    lifetime: 120
    exclude_patterns:
      - ^/admin
      - ^/api
      - ^/user
      - ^/cart
```

```php
// Disable cache programmatically for dynamic pages
\Pimcore\Cache\Runtime::set('pimcore_nocache', true);
```
```

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects \
        engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages \
        engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api \
        engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache
git commit -m "feat: add Pimcore skills"
```

---

## Task 6: Create Symfony Superpower skills

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-messenger-queues/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-console-commands/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-custom-bundles/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/symfony-security-voters/SKILL.md`
- Source: `engineering/php-symfony-pimcore/superpower-skills.md`

- [ ] **Step 1: Create `symfony-messenger-queues/SKILL.md`**

```markdown
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
```

- [ ] **Step 2: Create `symfony-console-commands/SKILL.md`**

```markdown
---
name: symfony-console-commands
description: >
  This skill should be used when the user asks to "create a console command",
  "write a CLI command", "run a batch import", "use AsCommand", "use SymfonyStyle",
  or discusses Symfony Command, ProgressBar, or batch processing patterns.
version: 1.0.0
---

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
```

- [ ] **Step 3: Create `symfony-custom-bundles/SKILL.md`**

```markdown
---
name: symfony-custom-bundles
description: >
  This skill should be used when the user asks to "create a bundle",
  "extend Pimcore with a bundle", "use AbstractBundle", "write bundle
  configuration", or discusses DependencyInjection extension classes.
version: 1.0.0
---

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
```

- [ ] **Step 4: Create `symfony-security-voters/SKILL.md`**

```markdown
---
name: symfony-security-voters
description: >
  This skill should be used when the user asks about "Symfony voters",
  "access control", "isGranted", "Voter class", "firewalls", or discusses
  Symfony security, authorization, or role-based access control.
version: 1.0.0
---

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
```

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/symfony-messenger-queues \
        engineering/php-symfony-pimcore/plugin/skills/symfony-console-commands \
        engineering/php-symfony-pimcore/plugin/skills/symfony-custom-bundles \
        engineering/php-symfony-pimcore/plugin/skills/symfony-security-voters
git commit -m "feat: add Symfony superpower skills (Messenger, Console, Bundles, Security)"
```

---

## Task 7: Create Performance & Ops skills

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/perf-profiling/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/perf-redis-caching/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/perf-elasticsearch/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/perf-ci-cd-docker/SKILL.md`
- Source: `engineering/php-symfony-pimcore/performance-ops.md`

- [ ] **Step 1: Create `perf-profiling/SKILL.md`**

```markdown
---
name: perf-profiling
description: >
  This skill should be used when the user asks about "profiling", "Blackfire",
  "Xdebug profiler", "cachegrind", "peak memory", "SQL query count", or
  discusses PHP performance measurement or bottleneck analysis.
version: 1.0.0
---

## Profiling

```bash
# Blackfire — profile a CLI command
blackfire run php bin/console app:import-products

# Blackfire — profile an HTTP request
blackfire curl https://your-pimcore-site.com/products

# Xdebug — enable profiling mode
XDEBUG_MODE=profile php bin/console app:import-products
# Open var/cache/xdebug/*.cachegrind in PHPStorm / KCachegrind
```

Key metrics: peak memory, wall time, I/O wait, SQL query count.
Target: < 50 SQL queries per page, < 32 MB memory per request.
```

- [ ] **Step 2: Create `perf-redis-caching/SKILL.md`**

```markdown
---
name: perf-redis-caching
description: >
  This skill should be used when the user asks about "Redis caching",
  "cache pools", "Symfony cache adapter", "Redis sessions", "REDIS_URL",
  or discusses configuring Redis as a cache or session backend.
version: 1.0.0
---

## Redis caching

```yaml
# config/packages/framework.yaml
framework:
  cache:
    default_redis_provider: '%env(REDIS_URL)%'
    pools:
      cache.products:
        adapter: cache.adapter.redis
        default_lifetime: 3600
      cache.pimcore:
        adapter: cache.adapter.redis
        default_lifetime: 600
  session:
    handler_id: '%env(REDIS_URL)%'
```

```bash
# .env
REDIS_URL=redis://localhost:6379
```
```

- [ ] **Step 3: Create `perf-elasticsearch/SKILL.md`**

```markdown
---
name: perf-elasticsearch
description: >
  This skill should be used when the user asks about "Elasticsearch",
  "FOSElasticaBundle", "fos:elastica:populate", "product search indexing",
  or discusses full-text search, index configuration, or search persistence.
version: 1.0.0
---

## Elasticsearch

```bash
composer require friendsofsymfony/elastica-bundle
php bin/console fos:elastica:create     # create indices
php bin/console fos:elastica:populate   # index all objects
```

```yaml
# config/packages/fos_elastica.yaml
fos_elastica:
  clients:
    default: { host: '%env(ELASTICSEARCH_HOST)%', port: 9200 }
  indexes:
    products:
      persistence:
        driver: orm
        model: App\Entity\Product
        finder: ~
      properties:
        name:  { type: text }
        price: { type: float }
        slug:  { type: keyword }
```
```

- [ ] **Step 4: Create `perf-ci-cd-docker/SKILL.md`**

```markdown
---
name: perf-ci-cd-docker
description: >
  This skill should be used when the user asks about "Docker", "Dockerfile",
  "CI/CD pipeline", "GitHub Actions deploy", "composer install production",
  or discusses containerising a Pimcore/Symfony application.
version: 1.0.0
---

## CI/CD & Docker

```dockerfile
# Dockerfile
FROM php:8.3-fpm-alpine
RUN docker-php-ext-install opcache pdo_mysql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY . .
RUN composer install --no-dev --optimize-autoloader
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Note: "Install skill pack" step from source file intentionally excluded —
      # it references a superseded installation method (direct skills clone).
      - name: Build & push Docker image
        run: |
          docker build -t credencys/pimcore:${{ github.sha }} .
          docker push credencys/pimcore:${{ github.sha }}
      - name: Run migrations
        run: php bin/console doctrine:migrations:migrate --no-interaction
```
```

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/perf-profiling \
        engineering/php-symfony-pimcore/plugin/skills/perf-redis-caching \
        engineering/php-symfony-pimcore/plugin/skills/perf-elasticsearch \
        engineering/php-symfony-pimcore/plugin/skills/perf-ci-cd-docker
git commit -m "feat: add performance and ops skills"
```

---

## Task 8: Create Testing & DX skills

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/testing-phpunit/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/testing-functional/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/testing-phpstan-psalm/SKILL.md`
- Create: `engineering/php-symfony-pimcore/plugin/skills/testing-cs-fixer/SKILL.md`
- Source: `engineering/php-symfony-pimcore/testing-dx.md`

- [ ] **Step 1: Create `testing-phpunit/SKILL.md`**

```markdown
---
name: testing-phpunit
description: >
  This skill should be used when the user asks about "PHPUnit tests",
  "unit tests", "integration tests", "test coverage", "createMock", or
  discusses PHP testing, TestCase, assertions, or fixtures.
version: 1.0.0
---

## PHPUnit

```php
class ProductServiceTest extends TestCase {
    private ProductService $service;
    private EntityManagerInterface $em;

    protected function setUp(): void {
        $this->em      = $this->createMock(EntityManagerInterface::class);
        $this->service = new ProductService($this->em);
    }

    public function testImportReturnsCorrectCount(): void {
        $result = $this->service->import($this->fixtures());
        $this->assertCount(3, $result);
        $this->assertInstanceOf(Product::class, $result[0]);
    }

    private function fixtures(): array {
        return [
            ['name' => 'A', 'price' => 10.0],
            ['name' => 'B', 'price' => 20.0],
            ['name' => 'C', 'price' => 30.0],
        ];
    }
}
```

```bash
php bin/phpunit --coverage-text --coverage-html var/coverage
```
```

- [ ] **Step 2: Create `testing-functional/SKILL.md`**

```markdown
---
name: testing-functional
description: >
  This skill should be used when the user asks about "functional tests",
  "WebTestCase", "BrowserKit", "createClient", "assertResponseIsSuccessful",
  or discusses Symfony HTTP-level testing or controller tests.
version: 1.0.0
---

## Functional testing

```php
class ProductControllerTest extends WebTestCase {
    public function testProductPageReturns200(): void {
        $client = static::createClient();
        $client->request('GET', '/products/test-product');
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Test Product');
    }

    public function testApiReturns201(): void {
        $client = static::createClient();
        $client->jsonRequest('POST', '/api/products', [
            'name'  => 'New Product',
            'price' => 99.99,
        ]);
        $this->assertResponseStatusCodeSame(201);
    }
}
```
```

- [ ] **Step 3: Create `testing-phpstan-psalm/SKILL.md`**

```markdown
---
name: testing-phpstan-psalm
description: >
  This skill should be used when the user asks about "PHPStan", "static
  analysis", "phpstan analyse", "phpstan.neon", "type checking", or discusses
  PHP static analysis, level configuration, or ignoring errors.
version: 1.0.0
---

## PHPStan

```bash
vendor/bin/phpstan analyse src --level=8
```

```neon
# phpstan.neon
parameters:
  level: 8
  paths:
    - src
  ignoreErrors:
    - '#Call to an undefined method Pimcore\\Model\\DataObject#'
```
```

- [ ] **Step 4: Create `testing-cs-fixer/SKILL.md`**

```markdown
---
name: testing-cs-fixer
description: >
  This skill should be used when the user asks about "PHP CS Fixer",
  "code style", "PSR-12", "php-cs-fixer fix", ".php-cs-fixer.dist.php",
  or discusses PHP linting, code formatting, or Symfony coding standards.
version: 1.0.0
---

## CS Fixer

```bash
vendor/bin/php-cs-fixer fix src --rules=@Symfony,@PSR12 --diff
```

```php
// .php-cs-fixer.dist.php
return (new Config())
    ->setRules([
        '@Symfony'     => true,
        '@PSR12'       => true,
        'strict_param' => true,
        'array_syntax' => ['syntax' => 'short'],
    ])
    ->setFinder(
        Finder::create()->in(['src', 'tests'])
    );
```
```

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/testing-phpunit \
        engineering/php-symfony-pimcore/plugin/skills/testing-functional \
        engineering/php-symfony-pimcore/plugin/skills/testing-phpstan-psalm \
        engineering/php-symfony-pimcore/plugin/skills/testing-cs-fixer
git commit -m "feat: add testing and DX skills"
```

---

## Task 9: Create symlink in ~/.claude

**Files:**
- Create: `~/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0` (symlink)

- [ ] **Step 1: Create the symlink**

```bash
mkdir -p /root/.claude/plugins/cache/local/php-symfony-pimcore
ln -s /home/ubuntu/projects/pimcore-development-skills/engineering/php-symfony-pimcore/plugin \
      /root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0
```

- [ ] **Step 2: Verify symlink resolves correctly**

```bash
ls -la /root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0
```

Expected: a symlink pointing to the absolute repo path.

```bash
ls /root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0/skills/ | wc -l
```

Expected: `28`

---

## Task 10: Register plugin in installed_plugins.json

**Files:**
- Modify: `/root/.claude/plugins/installed_plugins.json`

- [ ] **Step 1: Add the plugin entry**

Open `/root/.claude/plugins/installed_plugins.json`. It currently looks like:

```json
{
  "version": 2,
  "plugins": {
    "superpowers@claude-plugins-official": [ ... ],
    "code-review@claude-plugins-official": [ ... ]
  }
}
```

Add the new entry inside `"plugins"`:

```json
"php-symfony-pimcore@local": [
  {
    "scope": "user",
    "installPath": "/root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0",
    "version": "1.0.0",
    "installedAt": "2026-03-20T00:00:00.000Z",
    "lastUpdated": "2026-03-20T00:00:00.000Z"
  }
]
```

- [ ] **Step 2: Verify valid JSON**

```bash
python3 -m json.tool /root/.claude/plugins/installed_plugins.json > /dev/null && echo "Valid JSON"
```

Expected: `Valid JSON`

---

## Task 11: Enable plugin in settings.json

**Files:**
- Modify: `/root/.claude/settings.json`

- [ ] **Step 1: Add to enabledPlugins**

Open `/root/.claude/settings.json`. It currently contains:

```json
{
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true,
    "code-review@claude-plugins-official": true
  }
}
```

Add the new entry:

```json
{
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true,
    "code-review@claude-plugins-official": true,
    "php-symfony-pimcore@local": true
  }
}
```

- [ ] **Step 2: Verify valid JSON**

```bash
python3 -m json.tool /root/.claude/settings.json > /dev/null && echo "Valid JSON"
```

Expected: `Valid JSON`

---

## Task 12: Verify installation

- [ ] **Step 1: Confirm skill count in plugin directory**

```bash
find /root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0/skills -name "SKILL.md" | wc -l
```

Expected: `28`

- [ ] **Step 2: Confirm plugin.json is readable through symlink**

```bash
cat /root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0/.claude-plugin/plugin.json
```

Expected: JSON with `"name": "php-symfony-pimcore"`.

- [ ] **Step 3: Confirm a sample skill has correct frontmatter**

```bash
head -8 /root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0/skills/symfony-service-container/SKILL.md
```

Expected: frontmatter with `name:`, `description:`, `version: 1.0.0`.

- [ ] **Step 4: Start a new Claude Code session and run `/php-8x`**

Open a new Claude Code session. Type `/php-8x`. Confirm the skill content loads and displays the PHP 8.x reference material.

- [ ] **Step 5: Test model-invoked activation**

In the same session, ask: _"How do I configure Symfony Messenger with a retry strategy?"_
Confirm `symfony-messenger-queues` skill content appears in the context.

- [ ] **Step 6: Final commit of plan**

```bash
git add docs/superpowers/plans/2026-03-20-symfony-plugin-install.md
git commit -m "docs: add symfony plugin install implementation plan"
```
