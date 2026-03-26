---
title: PHP · Symfony · Pimcore — Pimcore-Specific Testing Skills Design
date: 2026-03-26
status: approved
---

# Pimcore-Specific Testing Skills — Design

## Goal

Add 3 new Pimcore-specific testing SKILL.md files to the `php-symfony-pimcore` plugin, covering
unit and integration test patterns that are unique to Pimcore's API surface. Total skill count
grows from 30 → 33.

## Approach

**Option 1 — Pattern-focused (3 separate skills).**

Each skill teaches reusable testing patterns with problem/solution code examples. Pimcore testing
has non-obvious setup requirements (static method wrapping, kernel bootstrap, RuntimeCache teardown)
that minimal snippets cannot address. Each skill covers exactly one testable layer.

## New Skills (3)

### `testing-pimcore-dataobjects` v1.0.0

**Trigger phrases:** "test a DataObject", "mock DataObject::getById", "test object brick",
"test field collection", "unit test Pimcore class", "forceLoad DataObject",
testing Pimcore data object save/load behaviour.

**Content — 3 patterns:**

#### Pattern 1: Wrap static calls (testability)

`DataObject::getById()` is a static method — PHPUnit cannot mock it directly. The solution is
to inject a thin repository wrapper:

```php
// Testable wrapper — inject this instead of calling static directly
class ProductRepository
{
    public function find(int $id, bool $force = false): ?DataObject\Product
    {
        return DataObject\Product::getById($id, $force);
    }
}
```

```php
// Test — mock the wrapper normally
class ProductServiceTest extends TestCase
{
    public function testReturnsNullForMissingProduct(): void
    {
        $repo = $this->createMock(ProductRepository::class);
        $repo->method('find')->willReturn(null);

        $service = new ProductService($repo);
        $this->assertNull($service->getProduct(999));
    }
}
```

#### Pattern 2: forceLoad for unpublished objects

**Critical Pimcore gotcha:** `DataObject::getById($id)` returns `null` for unpublished objects
by default. Tests against unpublished fixtures silently fail unless `$force = true` is passed.
Always use `forceLoad` in test setup:

```php
// BAD — returns null if object is unpublished, test fails silently
$product = DataObject\Product::getById(42);

// GOOD — always loads regardless of published state
$product = DataObject\Product::getById(42, true);

// In a repository wrapper, expose the $force parameter
$product = $this->repo->find(42, forceLoad: true);
```

#### Pattern 3: Test DataObject setters/getters

Instantiate DataObjects directly — no database required for pure getter/setter assertions:

```php
use PHPUnit\Framework\TestCase;
use Pimcore\Model\DataObject;

class ProductDataObjectTest extends TestCase
{
    public function testNameRoundTrip(): void
    {
        $product = new DataObject\Product();
        $product->setName('Test Product');
        $product->setPrice(99.99);

        $this->assertSame('Test Product', $product->getName());
        $this->assertSame(99.99, $product->getPrice());
    }
}
```

---

### `testing-pimcore-controllers` v1.0.0

**Trigger phrases:** "test Studio Backend endpoint", "test AbstractApiController",
"Pimcore\\Test\\WebTestCase", "Pimcore kernel bootstrap", "test custom Studio REST endpoint",
"integration test Pimcore controller", testing HTTP endpoints built on Pimcore Studio Backend.

Note: these triggers are intentionally distinct from `testing-functional` which covers
generic Symfony `WebTestCase`. This skill is specifically for Pimcore Studio Backend endpoints.

**Content — 3 patterns:**

#### Pattern 1: Kernel bootstrap (Pimcore version aware)

**Pimcore 10 and earlier:** extend `Pimcore\Test\WebTestCase` which handles the Pimcore
container boot including data object class autoloading.

**Pimcore 11+:** `Pimcore\Test\WebTestCase` is deprecated. Use the standard Symfony
`WebTestCase` with a custom `AppKernel` that registers all Pimcore bundles:

```php
// Pimcore 11+ — standard Symfony WebTestCase with Pimcore-aware kernel
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CustomAssetControllerTest extends WebTestCase
{
    public function testGetAssetMetadataReturns200(): void
    {
        $client = static::createClient();
        $client->request('GET', '/pimcore-studio/api/custom/asset/1');
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
    }
}
```

#### Pattern 2: Authenticated Studio requests

Studio endpoints require admin authentication. Use `loginUser()` with a seeded test admin:

```php
protected function setUp(): void
{
    parent::setUp();
    $this->client = static::createClient();

    // Load or create a test admin user via the Pimcore user service
    $admin = \Pimcore\Model\User::getByName('admin');
    $this->client->loginUser($admin);
}
```

#### Pattern 3: Assert JSON response shape

Validate the structure of a Studio endpoint response. This pattern is self-contained —
the `setUp()` from Pattern 2 is included for context:

```php
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;

class CustomAssetControllerTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $admin = \Pimcore\Model\User::getByName('admin');
        $this->client->loginUser($admin);
    }

    public function testResponseContainsId(): void
    {
        $this->client->request('GET', '/pimcore-studio/api/custom/asset/1');
        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $data);
        $this->assertSame(1, $data['id']);
    }
}
```

---

### `testing-pimcore-services` v1.0.0

**Trigger phrases:** "test Pimcore service", "mock Asset::getById", "mock Document",
"test event subscriber Pimcore", "mock Pimcore Registry", testing Symfony services that
interact with Pimcore APIs.

**Content — 3 patterns:**

#### Pattern 1: Mock Asset / Document via wrapper

Same static-call problem as DataObjects. Wrap `Asset::getById()` and `Document::getById()`
in injectable services:

```php
class AssetLocator
{
    public function find(int $id): ?Asset
    {
        return Asset::getById($id);
    }
}
```

```php
use PHPUnit\Framework\TestCase;
use Pimcore\Model\Asset;

// In test
class ThumbnailServiceTest extends TestCase
{
    public function testThrowsOnMissingAsset(): void
    {
        $locator = $this->createMock(AssetLocator::class);
        $locator->method('find')->willReturn(null);

        $service = new ThumbnailService($locator);
        $this->expectException(\InvalidArgumentException::class);
        $service->generate(999);
    }
}
```

#### Pattern 2: Test Pimcore event subscribers (direct-call unit test)

Call the listener method directly with a manually constructed event — this is a unit test,
not a dispatch test. The subscriber is tested in isolation without booting the kernel:

```php
use PHPUnit\Framework\TestCase;
use Pimcore\Event\Model\DataObjectEvent;
use Pimcore\Model\DataObject;

class ProductSaveListenerTest extends TestCase
{
    public function testClearsCacheOnSave(): void
    {
        $cache = $this->createMock(CacheInterface::class);
        $cache->expects($this->once())
              ->method('delete')
              ->with('product_list');

        $listener = new ProductSaveListener($cache);

        // Construct the event directly — no EventDispatcher needed for unit tests
        $event = new DataObjectEvent(new DataObject\Product());
        $listener->onPostUpdate($event);
    }
}
```

#### Pattern 3: Reset RuntimeCache between tests

Services that read/write `Pimcore\Cache\RuntimeCache` must clear it in `tearDown()` to
prevent state leaking between tests:

```php
use PHPUnit\Framework\TestCase;
use Pimcore\Cache\RuntimeCache;

class ProductCacheServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        RuntimeCache::clearAll();
        parent::tearDown();
    }

    public function testStoresInRuntimeCache(): void
    {
        $service = new ProductCacheService();
        $service->store('product_42', ['name' => 'Test']);

        $this->assertSame(
            ['name' => 'Test'],
            RuntimeCache::load('product_42')
        );
    }
}
```

## Skill File Locations

```
engineering/php-symfony-pimcore/plugin/skills/
├── testing-pimcore-dataobjects/SKILL.md    (new, v1.0.0)
├── testing-pimcore-controllers/SKILL.md    (new, v1.0.0)
└── testing-pimcore-services/SKILL.md       (new, v1.0.0)
```

## Branch Strategy

Work on feature branch `feat/pimcore-testing-skills`, push to GitHub.

## Out of Scope

- Mutation testing
- Test fixtures/factories beyond simple inline arrays
- Behat / BDD testing
- Selenium / browser automation
