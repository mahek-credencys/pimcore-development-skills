# Pimcore Testing Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 Pimcore-specific testing SKILL.md files to the plugin and push them on a feature branch to GitHub.

**Architecture:** Each task creates one new SKILL.md in `engineering/php-symfony-pimcore/plugin/skills/`. All work happens on the `feat/pimcore-testing-skills` branch created in Task 1. Verification uses YAML parse checks and grep assertions. Tasks 2–4 are independent; Task 5 (push) depends on all prior tasks.

**Tech Stack:** Markdown + YAML frontmatter, Claude Code plugin SKILL.md format, Python 3 (YAML validation), Git

**Spec:** `docs/superpowers/specs/2026-03-26-pimcore-testing-skills-design.md`

---

## File Map

| Action | File |
|--------|------|
| Create | `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md` |
| Create | `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md` |
| Create | `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md` |

---

### Task 1: Create feature branch

**Files:** none (git operation only)

- [ ] **Step 1: Create and switch to feature branch**

```bash
git checkout -b feat/pimcore-testing-skills
```

Expected: `Switched to a new branch 'feat/pimcore-testing-skills'`

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `feat/pimcore-testing-skills`

---

### Task 2: Create testing-pimcore-dataobjects skill

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects
```

- [ ] **Step 2: Write SKILL.md**

Write the following exact content to `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md`:

```markdown
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
```

- [ ] **Step 3: Verify YAML frontmatter**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md').read_text()
meta = yaml.safe_load(text.split('---')[1])
assert meta['version'] == '1.0.0'
assert meta['name'] == 'testing-pimcore-dataobjects'
assert 'test a DataObject' in meta['description']
print('OK')
"
```

Expected: `OK`

- [ ] **Step 4: Verify key content**

```bash
grep -q "forceLoad" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md && \
grep -q "ProductRepository" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md && \
grep -q "unpublished" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-dataobjects/SKILL.md
git commit -m "feat: add testing-pimcore-dataobjects skill (v1.0.0)"
```

---

### Task 3: Create testing-pimcore-controllers skill

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers
```

- [ ] **Step 2: Write SKILL.md**

Write the following exact content to `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md`:

```markdown
---
name: testing-pimcore-controllers
description: >
  This skill should be used when the user asks to "test Studio Backend endpoint",
  "test AbstractApiController", "Pimcore\\Test\\WebTestCase", "Pimcore kernel bootstrap",
  "test custom Studio REST endpoint", "integration test Pimcore controller", or discusses
  testing HTTP endpoints built on Pimcore Studio Backend.
version: 1.0.0
---

## Testing Pimcore Studio Backend Controllers

### Pattern 1: Kernel bootstrap (Pimcore version aware)

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

### Pattern 2: Authenticated Studio requests

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

### Pattern 3: Assert JSON response shape

Full self-contained test class — includes `setUp()` for context:

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
```

- [ ] **Step 3: Verify YAML frontmatter**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md').read_text()
meta = yaml.safe_load(text.split('---')[1])
assert meta['version'] == '1.0.0'
assert meta['name'] == 'testing-pimcore-controllers'
assert 'test Studio Backend endpoint' in meta['description']
print('OK')
"
```

Expected: `OK`

- [ ] **Step 4: Verify key content**

```bash
grep -q "loginUser" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md && \
grep -q "deprecated" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md && \
grep -q "KernelBrowser" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-controllers/SKILL.md
git commit -m "feat: add testing-pimcore-controllers skill (v1.0.0)"
```

---

### Task 4: Create testing-pimcore-services skill

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services
```

- [ ] **Step 2: Write SKILL.md**

Write the following exact content to `engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md`:

```markdown
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
```

- [ ] **Step 3: Verify YAML frontmatter**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md').read_text()
meta = yaml.safe_load(text.split('---')[1])
assert meta['version'] == '1.0.0'
assert meta['name'] == 'testing-pimcore-services'
assert 'test Pimcore service' in meta['description']
print('OK')
"
```

Expected: `OK`

- [ ] **Step 4: Verify key content**

```bash
grep -q "RuntimeCache" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md && \
grep -q "DataObjectEvent" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md && \
grep -q "AssetLocator" engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/testing-pimcore-services/SKILL.md
git commit -m "feat: add testing-pimcore-services skill (v1.0.0)"
```

---

### Task 5: Push feature branch to GitHub

**Files:** none (git operation only)

- [ ] **Step 1: Verify all 3 new skills exist**

```bash
ls engineering/php-symfony-pimcore/plugin/skills/ | grep "testing-pimcore"
```

Expected output (3 lines):
```
testing-pimcore-controllers
testing-pimcore-dataobjects
testing-pimcore-services
```

- [ ] **Step 2: Verify total skill count is now 33**

```bash
ls engineering/php-symfony-pimcore/plugin/skills/ | wc -l
```

Expected: `33`

- [ ] **Step 3: Push branch to origin**

```bash
git push -u origin feat/pimcore-testing-skills
```

Expected: branch appears on GitHub with 3 new commits.
