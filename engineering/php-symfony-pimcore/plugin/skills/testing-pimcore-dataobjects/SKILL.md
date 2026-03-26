---
name: testing-pimcore-dataobjects
description: >
  This skill should be used when the user asks to "test a DataObject",
  "mock DataObject::getById", "test object brick", "test field collection",
  "unit test Pimcore class", "forceLoad DataObject", or discusses testing
  Pimcore data object save/load behaviour.
version: 1.0.0
---

## Testing Pimcore Data Objects

### Pattern 1: Wrap static calls (testability)

`DataObject::getById()` is a static method — PHPUnit cannot mock it directly. Inject a
thin repository wrapper so the dependency becomes mockable:

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

### Pattern 2: forceLoad for unpublished objects

**Critical Pimcore gotcha:** `DataObject::getById($id)` returns `null` for unpublished
objects by default. Tests against unpublished fixtures silently fail unless `$force = true`
is passed. Always use forceLoad in test setup:

```php
// BAD — returns null if object is unpublished, test fails silently
$product = DataObject\Product::getById(42);

// GOOD — always loads regardless of published state
$product = DataObject\Product::getById(42, true);

// In a repository wrapper, expose the $force parameter
$product = $this->repo->find(42, forceLoad: true);
```

### Pattern 3: Test DataObject setters/getters

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
