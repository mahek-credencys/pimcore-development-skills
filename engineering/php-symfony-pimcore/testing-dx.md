---
id: testing-dx
category: Testing & DX
level: Expert
skills:
  - name: PHPUnit
    detail: Unit & integration
  - name: Functional testing
    detail: WebTestCase, BrowserKit
  - name: PHPStan / Psalm
    detail: Static analysis
  - name: CS Fixer / standards
    detail: Linting, PSR-12
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
