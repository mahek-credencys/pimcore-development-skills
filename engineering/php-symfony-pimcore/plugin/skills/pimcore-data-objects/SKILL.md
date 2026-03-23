---
name: pimcore-data-objects
description: >
  This skill should be used when the user asks about "Pimcore data objects",
  "object classes", "object bricks", "field collections", "DataObject listing",
  or discusses Pimcore CMS data modelling or DataObject PHP API.
version: 1.1.0
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

## Pimcore 12 breaking changes

### getChildren() / getSiblings() — lazy-load (DataObject tree only)

In Pimcore 12, `DataObject\AbstractObject::getChildren()` and `getSiblings()` return an
**unloaded Listing object** instead of a pre-loaded array.
`Document::getChildren()` and `Asset::getChildren()` are unaffected (still return arrays).

```php
// OLD (Pimcore 11) — returned a loaded array
$children = $parentObject->getChildren();

// NEW (Pimcore 12) — returns unloaded Listing; must load or iterate
$listing = $parentObject->getChildren();
$listing->load();           // explicit load
// OR iterate directly (auto-loads on iteration)
foreach ($parentObject->getChildren() as $child) { }
```

### Removed: getObject() / setObject() on Link

`Pimcore\Model\DataObject\Data\Link::getObject()` and `setObject()` have been removed.

```php
// OLD (removed in Pimcore 12)
$link->getObject();
$link->setObject($element);

// NEW
$link->getElement();
$link->setElement($element);
```

### Native PHP 8 type hints required on extended classes

All Pimcore classes now carry native PHP 8 type declarations (arguments, return types, properties).
If you extend any Pimcore class, your method signatures must match exactly.

```php
// Must match parent signature or PHP will throw TypeError
class MyProduct extends DataObject\Product {
    public function setName(string $name): static
    {
        return parent::setName($name);
    }
}
```

### New: useInheritedValues() helper

```php
// Control inheritance inside a closure without affecting global state
$name = DataObject\Service::useInheritedValues(true, function() use ($object) {
    return $object->getName(); // returns inherited value if own value is empty
});
```
