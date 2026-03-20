---
name: symfony-routing-controllers
description: >
  This skill should be used when the user asks about "routing", "controller
  attributes", "param converters", "MapEntity", "route requirements", or
  discusses Symfony routes, #[Route], or controller request mapping.
version: 1.0.0
---

## Routing & controllers

```php
#[Route('/products/{slug}', name: 'product_show', methods: ['GET'])]
public function show(
    #[MapEntity(mapping: ['slug' => 'slug'])]
    Product $product,
    Request $request,
): Response {
    return $this->render('product/show.html.twig', [
        'product' => $product,
    ]);
}
```
