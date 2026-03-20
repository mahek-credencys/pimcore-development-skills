---
title: PHP · Symfony · Pimcore — Pimcore 12 + Studio Skill Pack Update Design
date: 2026-03-20
status: approved
---

# Pimcore 12 + Studio Skill Pack Update — Design

## Goal

Update the existing 4 Pimcore-specific skills to cover Pimcore 12 breaking changes, and add 2 new skills
covering Pimcore Studio Backend and Studio UI extension development. Total skill count grows from 28 → 30.

## Approach

**Option 2 — Update 4 existing + add 2 new Studio skills.**

The Studio Backend skill (`pimcore-studio-backend`) is PHP-native work that fits the pack's focus perfectly.
The Studio UI skill (`pimcore-studio-ui`) keeps admin UI extension context in one place and gives developers
a clear migration target for deprecated ExtJS extensions.

## Skills to Update (4)

### `pimcore-data-objects` v1.0.0 → v1.1.0

Breaking changes to add:

- `getChildren()` / `getSiblings()` on `DataObject\AbstractObject` now return **unloaded Listing objects**
  in Pimcore 12 — must call `.load()` explicitly or iterate directly (auto-loads on iteration).
  **Scope: DataObject tree only.** `Document::getChildren()` and `Asset::getChildren()` return arrays
  and are unaffected.

  ```php
  // OLD (Pimcore 11) — returns loaded array
  $children = $parentObject->getChildren();

  // NEW (Pimcore 12) — returns unloaded Listing; must load or iterate
  $listing = $parentObject->getChildren();
  $listing->load();           // explicit load
  // OR
  foreach ($parentObject->getChildren() as $child) { } // auto-loads
  ```

- `getObject()` / `setObject()` removed from `Pimcore\Model\DataObject\Data\Link` —
  use `getElement()` / `setElement()` instead

- Native PHP 8 type hints added to all Pimcore classes — custom classes **extending** Pimcore classes
  must update method signatures to match (argument types, return types, property types)

- New helper: `DataObject\Service::useInheritedValues(bool $enabled, Closure $fn)` — controls
  object inheritance inside a closure without affecting global state

  ```php
  $name = DataObject\Service::useInheritedValues(true, function() use ($object) {
      return $object->getName(); // returns inherited value if own value is empty
  });
  ```

### `pimcore-documents-pages` v1.0.0 → v1.1.0

Changes to add:

- Twig editables (`pimcore_input`, `pimcore_wysiwyg`, `pimcore_image`, `pimcore_renderlet`) are
  **unchanged in Pimcore 12** — backward compatible, no migration needed

- When storing `pimcore_wysiwyg` output in a Twig variable, apply `|raw` to prevent double-escaping
  (Twig auto-escapes HTML by default; wysiwyg returns raw HTML):

  ```twig
  {% set body = pimcore_wysiwyg('body') %}
  {{ body|raw }}   {# must use |raw — output is already HTML #}
  ```

  Note: inline `{{ pimcore_wysiwyg('body') }}` does NOT need `|raw` because Twig does not
  double-escape the return value of registered Pimcore functions.

### `pimcore-datahub-api` v1.0.0 → v1.1.0

Changes to make:

- **Remove** the stale legacy REST URL line (`/webservice/rest/object/id/{id}?apikey={key}`) —
  this endpoint was removed before Pimcore 11 and is no longer valid

- **Add** new Datahub Simple REST API (introduced alongside Pimcore 12):
  - Read-only access to assets and data objects
  - Data indexed in OpenSearch / Elasticsearch for performance
  - Complements GraphQL for lightweight integrations

- **Add** GraphQL breaking change: datetime/date fields changed type from `int` → `string`
  (ISO 8601 with timezone, e.g. `"2024-03-01T12:00:00+00:00"`)

- **Replace** deprecated command:
  ```bash
  # OLD (removed in Pimcore 12)
  php bin/console datahub:graphql:rebuild-definitions

  # NEW
  php bin/console datahub:graphql:rebuild-workspaces
  ```

- **Update trigger description** to disambiguate from `pimcore-studio-backend`:
  scope this skill to "Datahub-managed GraphQL/REST configurations" only.
  Trigger on: "Datahub", "PimcoreDataHubBundle", "datahub GraphQL", "datahub REST", "datahub configuration".
  Do NOT trigger on: "Studio API", "Studio endpoint", "AbstractApiController" (those belong to `pimcore-studio-backend`).

### `pimcore-full-page-cache` v1.0.0 → v1.1.0

Changes to make:

- YAML config (`pimcore.full_page_cache.enabled`, `lifetime`, `exclude_patterns`) is **unchanged**
  in Pimcore 12 — confirm this explicitly in the skill body

- **Update the code example** from the deprecated class to the new name:
  ```php
  // OLD (deprecated alias — still works but will be removed)
  \Pimcore\Cache\Runtime::set('pimcore_nocache', true);

  // NEW (Pimcore 12)
  \Pimcore\Cache\RuntimeCache::set('pimcore_nocache', true);
  ```
  Both names work in Pimcore 12 (old name is a backward-compat alias), but new code should use
  `RuntimeCache`.

- **Add** note: responses with `Cache-Control: no-store` header are now **automatically excluded**
  from full-page cache — no need to set `pimcore_nocache` for these responses

## New Skills (2)

### `pimcore-studio-backend` v1.0.0

**Trigger phrases:** "Pimcore Studio API", "Studio Backend Bundle", "custom Studio endpoint",
"AbstractApiController", "/pimcore-studio/api", "Studio REST endpoint", building custom REST endpoints
for Pimcore Studio.

**Install:**
```bash
composer require pimcore/studio-backend-bundle
php bin/console pimcore:bundle:enable PimcoreStudioBackendBundle
```

**Controller skeleton** — controllers live in `src/Controller/Api/` (any namespace works, but this
is the convention). Register via standard Symfony route loading (`config/routes.yaml` or attribute routes
auto-discovered by Symfony):

```php
namespace App\Controller\Api;

use OpenApi\Attributes as OA;
use Pimcore\Bundle\StudioBackendBundle\Controller\AbstractApiController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[OA\Tag('Custom')]
#[Route('/pimcore-studio/api/custom')]
class CustomAssetController extends AbstractApiController
{
    #[OA\Get(
        path: '/pimcore-studio/api/custom/asset/{id}',
        summary: 'Get custom asset metadata',
        tags: ['Custom'],
    )]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Asset metadata')]
    #[Route('/asset/{id}', methods: ['GET'])]
    public function getAssetMetadata(int $id): JsonResponse
    {
        // use injected services — constructor injection works normally
        return $this->json(['id' => $id]);
    }
}
```

**Swagger UI:** `/pimcore-studio/api/docs`
**OpenAPI JSON spec:** `/pimcore-studio/api/docs.json`

**Security:** Studio endpoints use the standard Symfony firewall. Use voters and `denyAccessUnlessGranted()`
exactly as in any other Symfony controller — no Studio-specific auth layer.

### `pimcore-studio-ui` v1.0.0

**Trigger phrases:** "Pimcore Studio UI", "Studio widget", "admin UI extension", "Studio React component",
"Studio slot", "Studio UI SDK", "custom panel in Studio", building admin UI extensions for Pimcore Studio.

**Stack:** React + TypeScript + Ant Design.
Studio UI is the `pimcore/studio-ui-bundle` package (PHP bundle) which ships the JS frontend.

**Classic Admin UI timeline:**
- Pimcore 12: Classic Admin UI (ExtJS) deprecated
- Platform 2026.1: Classic Admin UI **removed**
- Legacy ExtJS admin extensions must be rewritten in React for Studio

**npm setup** (inside a custom bundle's `public/` or a standalone npm package):
```bash
npm install @pimcore-studio/ui-bundle-api
```

**Widget registration** — register a custom panel via the Studio slot/widget system:

```typescript
// src/Resources/public/js/studio-extension.ts
import { pluginSystem } from '@pimcore-studio/ui-bundle-api'
import { CustomAssetPanel } from './components/CustomAssetPanel'

pluginSystem.registerPlugin({
  name: 'custom-asset-panel',
  onInit: () => {
    pluginSystem.registerWidget({
      slot: 'asset-detail-tabs',   // slot identifier from Studio UI docs
      component: CustomAssetPanel,
      priority: 10,
    })
  },
})
```

**PHP side:** Custom Studio UI extensions consume REST endpoints from `pimcore-studio-backend`.

**Key concepts:**
- **Slot** — named injection point in the Studio layout (e.g. `asset-detail-tabs`, `object-sidebar`)
- **Widget** — React component registered into a slot
- **Plugin system** — singleton from `@pimcore-studio/ui-bundle-api` that bootstraps extensions

## Plugin Metadata Changes

Two separate files need updating (different roles):

1. **`engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json`** — plugin-level metadata
   consumed when this plugin is installed. Update `description` to:
   `"Expert-level PHP 8.x, Symfony 6/7, Pimcore 11/12 + Studio, Doctrine ORM, testing, and ops skills"`

2. **`.claude-plugin/marketplace.json`** (repo root) — marketplace registry listing. Update the
   `plugins[0].description` field to match the same string above.

## Skill File Locations

```
engineering/php-symfony-pimcore/plugin/skills/
├── pimcore-data-objects/SKILL.md          (update v1.0.0 → v1.1.0)
├── pimcore-documents-pages/SKILL.md       (update v1.0.0 → v1.1.0)
├── pimcore-datahub-api/SKILL.md           (update v1.0.0 → v1.1.0)
├── pimcore-full-page-cache/SKILL.md       (update v1.0.0 → v1.1.0)
├── pimcore-studio-backend/SKILL.md        (new, v1.0.0)
└── pimcore-studio-ui/SKILL.md             (new, v1.0.0)
```

## Out of Scope

- Pimcore 10 compatibility
- Pimcore 13 / Symfony 7 (not yet released)
- Full migration tooling or CLI scripts
- Publishing updated plugin to a public registry
- Pimcore Studio Cloud (SaaS variant)
