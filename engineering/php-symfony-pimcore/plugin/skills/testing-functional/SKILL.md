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
