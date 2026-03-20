---
name: doctrine-querybuilder-dql
description: >
  This skill should be used when the user asks to "write a custom query",
  "use QueryBuilder", "write DQL", "use array hydration", or discusses
  Doctrine query building, joins, parameters, or result hydration.
version: 1.0.0
---

## QueryBuilder / DQL

```php
// Fetch only needed columns — never hydrate full objects for list views
$results = $this->em->createQueryBuilder()
    ->select('p.id, p.name, p.price, c.name AS category')
    ->from(Product::class, 'p')
    ->leftJoin('p.category', 'c')
    ->where('p.active = :active')
    ->andWhere('p.price BETWEEN :min AND :max')
    ->setParameters(['active' => true, 'min' => 10, 'max' => 500])
    ->orderBy('p.name', 'ASC')
    ->setMaxResults(50)
    ->getQuery()
    ->getArrayResult();   // array hydration = far less memory than object hydration
```
