---
name: doctrine-entities-mapping
description: >
  This skill should be used when the user asks about "Doctrine entities",
  "ORM mapping", "table attributes", "ManyToOne", "OneToMany", or discusses
  Doctrine PHP attributes, entity relations, or repository classes.
version: 1.0.0
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
