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
