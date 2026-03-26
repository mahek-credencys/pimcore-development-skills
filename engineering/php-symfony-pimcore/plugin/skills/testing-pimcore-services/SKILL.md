---
name: testing-pimcore-services
description: >
  This skill should be used when the user asks to "test Pimcore service",
  "mock Asset::getById", "mock Document", "test event subscriber Pimcore",
  "mock Pimcore Registry", or discusses testing Symfony services that interact
  with Pimcore APIs.
version: 1.0.0
---

## Testing Pimcore Services

### Pattern 1: Mock Asset / Document via wrapper

`Asset::getById()` and `Document::getById()` are static — PHPUnit cannot mock them directly.
Wrap them in injectable locator services:

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

### Pattern 2: Test Pimcore event subscribers (direct-call unit test)

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

### Pattern 3: Reset RuntimeCache between tests

Services that read/write `RuntimeCache` must clear it in `tearDown()` to prevent
state leaking between tests:

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
