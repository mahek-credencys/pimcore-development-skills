---
name: doctrine-lazy-loading
description: >
  This skill should be used when the user asks about "N+1 queries",
  "EXTRA_LAZY", "JOIN fetch", "batch processing", "em clear", or discusses
  avoiding excessive Doctrine queries or memory leaks in loops.
version: 1.0.0
---

## Avoid N+1 — EXTRA_LAZY + JOIN fetch

```php
// BAD — triggers N additional queries for each product's category
foreach ($products as $p) {
    echo $p->getCategory()->getName();
}

// GOOD — single LEFT JOIN in one query
$qb->leftJoin('p.category', 'c')->addSelect('c');

// For large collections: EXTRA_LAZY + slice avoids full collection load
$variants = $product->getVariants()->slice(0, 20);

// Batch processing — clear EntityManager between batches
foreach ($reader->getBatches(500) as $batch) {
    $this->process($batch);
    $this->em->clear();   // frees memory
}
```
