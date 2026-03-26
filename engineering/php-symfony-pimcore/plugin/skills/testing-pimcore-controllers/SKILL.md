---
name: testing-pimcore-controllers
description: >
  This skill should be used when the user asks to "test Studio Backend endpoint",
  "test AbstractApiController", "Pimcore\Test\WebTestCase", "Pimcore kernel bootstrap",
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
