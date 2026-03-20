---
name: pimcore-documents-pages
description: >
  This skill should be used when the user asks about "Pimcore documents",
  "Pimcore pages", "editables", "areas", "pimcore_input", "pimcore_wysiwyg",
  or discusses Pimcore CMS page rendering or Twig editables.
version: 1.0.0
---

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
