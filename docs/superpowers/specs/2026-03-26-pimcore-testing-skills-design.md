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
"test field collection", "unit test Pimcore class", testing Pimcore data object save/load behaviour.

**Content — 3 patterns:**

#### Pattern 1: Wrap static calls (testability)

`DataObject::getById()` is a static method — PHPUnit cannot mock it directly. The solution is
to inject a thin repository wrapper:

```php
// Testable wrapper — inject this instead of calling static directly
class ProductRepository
{
    public function find(int $id): ?DataObject\Product
    {
        return DataObject\Product::getById($id);
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

#### Pattern 2: Test Listing filters

Assert that listing conditions, limit, and order are set correctly without hitting the database:

```php
class ProductListingBuilderTest extends TestCase
{
    public function testAppliesActiveFilter(): void
    {
        $listing = $this->createMock(DataObject\Product\Listing::class);
        $listing->expects($this->once())
            ->method('setCondition')
            ->with('active = 1 AND price > ?', [0]);
        $listing->expects($this->once())
            ->method('setLimit')
            ->with(50);

        $builder = new ProductListingBuilder($listing);
        $builder->buildActive(minPrice: 0, limit: 50);
    }
}
```

#### Pattern 3: Test DataObject setters/getters

Instantiate DataObjects directly — no database required for pure getter/setter assertions:

```php
public function testProductNameRoundTrip(): void
{
    $product = new DataObject\Product();
    $product->setName('Test Product');
    $product->setPrice(99.99);

    $this->assertSame('Test Product', $product->getName());
    $this->assertSame(99.99, $product->getPrice());
}
```

---

### `testing-pimcore-controllers` v1.0.0

**Trigger phrases:** "test Studio Backend endpoint", "test AbstractApiController",
"Pimcore WebTestCase", "test custom Studio REST endpoint", "integration test Pimcore controller",
testing HTTP endpoints built on Pimcore Studio Backend.

**Content — 3 patterns:**

#### Pattern 1: Pimcore kernel bootstrap

Must extend `Pimcore\Test\WebTestCase` (not Symfony's `WebTestCase`) — it handles the Pimcore
container boot, including data object class autoloading:

```php
use Pimcore\Test\WebTestCase;

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

Studio endpoints require admin authentication. Set up a test admin user token:

```php
protected function setUp(): void
{
    parent::setUp();
    // Authenticate as admin for all Studio endpoint tests
    $this->client = static::createClient([], [
        'HTTP_Authorization' => 'Bearer ' . $this->getAdminToken(),
    ]);
}

private function getAdminToken(): string
{
    // Use Pimcore's test token helper or create a fixture admin user
    return \Pimcore\Tool\Authentication::generateToken('admin');
}
```

#### Pattern 3: Assert JSON response shape

Validate the structure of a Studio endpoint response:

```php
public function testResponseContainsId(): void
{
    $this->client->request('GET', '/pimcore-studio/api/custom/asset/1');
    $this->assertResponseIsSuccessful();

    $data = json_decode($this->client->getResponse()->getContent(), true);
    $this->assertArrayHasKey('id', $data);
    $this->assertSame(1, $data['id']);
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

#### Pattern 2: Test Pimcore event subscribers

Dispatch `DataObjectEvents::POST_UPDATE` manually via the EventDispatcher, assert the
subscriber reacted correctly:

```php
class ProductSaveListenerTest extends TestCase
{
    public function testClearsCacheOnSave(): void
    {
        $cache = $this->createMock(CacheInterface::class);
        $cache->expects($this->once())->method('delete')->with('product_list');

        $listener = new ProductSaveListener($cache);

        $event = new DataObjectEvent(new DataObject\Product(), []);
        $listener->onPostUpdate($event);
    }
}
```

#### Pattern 3: Reset RuntimeCache between tests

Services that read/write `Pimcore\Cache\RuntimeCache` must clear it in `tearDown()` to
prevent state leaking between tests:

```php
class ProductCacheServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        \Pimcore\Cache\RuntimeCache::clearAll();
        parent::tearDown();
    }

    public function testStoresInRuntimeCache(): void
    {
        $service = new ProductCacheService();
        $service->store('product_42', ['name' => 'Test']);

        $this->assertSame(
            ['name' => 'Test'],
            \Pimcore\Cache\RuntimeCache::load('product_42')
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

Work on a feature branch `feat/pimcore-testing-skills`, then push to GitHub.

## Out of Scope

- Mutation testing
- Test fixtures/factories beyond simple inline arrays
- Behat / BDD testing
- Selenium / browser automation
