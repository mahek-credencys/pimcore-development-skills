---
name: pimcore-data-objects
description: >
  This skill should be used when the user asks about "Pimcore data objects",
  "object classes", "object bricks", "field collections", "DataObject listing",
  or discusses Pimcore CMS data modelling or DataObject PHP API.
version: 1.0.0
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
