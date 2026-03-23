---
name: pimcore-documents-pages
description: >
  This skill should be used when the user asks about "Pimcore documents",
  "Pimcore pages", "editables", "areas", "pimcore_input", "pimcore_wysiwyg",
  or discusses Pimcore CMS page rendering or Twig editables.
version: 1.1.0
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

## Pimcore 12 — editable compatibility note

All Twig editable functions (`pimcore_input`, `pimcore_wysiwyg`, `pimcore_image`,
`pimcore_renderlet`) are **unchanged in Pimcore 12** — fully backward compatible, no migration needed.

## wysiwyg output in Twig variables

When storing `pimcore_wysiwyg` output in a Twig variable, apply `|raw` to prevent Twig from
double-escaping the HTML (Twig auto-escapes HTML by default; wysiwyg returns raw HTML):

```twig
{% set body = pimcore_wysiwyg('body') %}
{{ body|raw }}   {# must use |raw — output is already HTML #}
```

Inline `{{ pimcore_wysiwyg('body') }}` does **not** need `|raw` — Pimcore's Twig extension
marks its return value safe automatically.
