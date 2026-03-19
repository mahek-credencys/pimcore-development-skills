---
id: doctrine-orm
category: Doctrine ORM
level: Expert
skills:
  - name: Entities & mapping
    detail: Attributes, relations
  - name: QueryBuilder / DQL
    detail: Custom queries
  - name: Lazy loading
    detail: Avoid N+1, fetch EXTRA_LAZY
  - name: Migrations
    detail: Schema evolution
---

## Entities & mapping

```php
#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\Table(name: 'products')]
#[ORM\Index(columns: ['slug'], name: 'idx_product_slug')]
class Product {
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private int $id;

    #[ORM\Column(length: 255, unique: true)]
    private string $slug;

    #[ORM\ManyToOne(targetEntity: Category::class, fetch: 'LAZY')]
    #[ORM\JoinColumn(nullable: false)]
    private Category $category;

    #[ORM\OneToMany(
        targetEntity: Variant::class,
        mappedBy: 'product',
        fetch: 'EXTRA_LAZY',
        cascade: ['persist', 'remove'],
        orphanRemoval: true,
    )]
    private Collection $variants;
}
```

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

## Migrations

```bash
# Generate migration from entity changes
php bin/console doctrine:migrations:diff

# Review generated file in migrations/, then:
php bin/console doctrine:migrations:migrate --no-interaction

# In CI/CD — allow no pending migration without error
php bin/console doctrine:migrations:migrate \
  --no-interaction --allow-no-migration

# Check current status
php bin/console doctrine:migrations:status
```
