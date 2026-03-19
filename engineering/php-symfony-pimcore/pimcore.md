---
id: pimcore
category: Pimcore
level: Expert
skills:
  - name: Data objects
    detail: Classes, bricks, fields
  - name: Documents & pages
    detail: Editables, areas
  - name: Datahub / API
    detail: GraphQL, REST
  - name: Full-page cache
    detail: Output caching
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

## Datahub / API

```bash
composer require pimcore/data-hub
php bin/console pimcore:bundle:enable PimcoreDataHubBundle
php bin/console doctrine:migrations:migrate --no-interaction
```

- GraphQL: `/pimcore-datahub-webservices/graphql/{config-name}`
- REST:    `/webservice/rest/object/id/{id}?apikey={key}`
- Secure with API keys + Symfony firewall rules

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
