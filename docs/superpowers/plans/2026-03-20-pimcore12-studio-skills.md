# Pimcore 12 + Studio Skill Pack Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update 4 Pimcore-specific SKILL.md files for Pimcore 12 breaking changes and add 2 new skills covering Pimcore Studio Backend and Studio UI extension development.

**Architecture:** Each task rewrites or creates one SKILL.md file in `engineering/php-symfony-pimcore/plugin/skills/`. No runnable code is produced — verification uses YAML parse checks and grep assertions. Tasks are independent and can be executed in any order; metadata update (Task 7) must come last.

**Tech Stack:** Markdown + YAML frontmatter, Claude Code plugin SKILL.md format, Python 3 (YAML validation only)

**Spec:** `docs/superpowers/specs/2026-03-20-pimcore12-studio-skills-design.md`

---

## File Map

| Action | File |
|--------|------|
| Modify | `engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md` |
| Modify | `engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md` |
| Modify | `engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md` |
| Modify | `engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md` |
| Create | `engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md` |
| Create | `engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md` |
| Modify | `engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json` |
| Modify | `.claude-plugin/marketplace.json` |

---

### Task 1: Update pimcore-data-objects skill for Pimcore 12

**Files:**
- Modify: `engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md`

- [ ] **Step 1: Verify current file content**

```bash
cat engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md
```

Expected: version is `1.0.0`, no mention of `getElement`, `useInheritedValues`, or lazy-load.

- [ ] **Step 2: Replace file with Pimcore 12 updated content**

Write the following complete content to `engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md`:

```markdown
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
```

- [ ] **Step 3: Verify YAML frontmatter parses**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md').read_text()
parts = text.split('---')
meta = yaml.safe_load(parts[1])
assert meta['version'] == '1.1.0', f'Expected 1.1.0, got {meta[\"version\"]}'
assert meta['name'] == 'pimcore-data-objects'
print('OK')
"
```

Expected: `OK`

- [ ] **Step 4: Verify key content strings present**

```bash
grep -q "useInheritedValues" engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md && \
grep -q "getElement" engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md && \
grep -q "unloaded Listing" engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/pimcore-data-objects/SKILL.md
git commit -m "feat: update pimcore-data-objects skill for Pimcore 12 (v1.1.0)"
```

---

### Task 2: Update pimcore-documents-pages skill for Pimcore 12

**Files:**
- Modify: `engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md`

- [ ] **Step 1: Verify current file content**

```bash
cat engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md
```

Expected: version is `1.0.0`, no `|raw` note, no Pimcore 12 compatibility note.

- [ ] **Step 2: Replace file with Pimcore 12 updated content**

Write the following complete content to `engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md`:

```markdown
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
```

- [ ] **Step 3: Verify YAML frontmatter parses**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md').read_text()
parts = text.split('---')
meta = yaml.safe_load(parts[1])
assert meta['version'] == '1.1.0', f'Expected 1.1.0, got {meta[\"version\"]}'
print('OK')
"
```

Expected: `OK`

- [ ] **Step 4: Verify key content strings present**

```bash
grep -q "raw" engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md && \
grep -q "backward compatible" engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/pimcore-documents-pages/SKILL.md
git commit -m "feat: update pimcore-documents-pages skill for Pimcore 12 (v1.1.0)"
```

---

### Task 3: Update pimcore-datahub-api skill for Pimcore 12

**Files:**
- Modify: `engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md`

- [ ] **Step 1: Verify current file content**

```bash
cat engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md
```

Expected: version `1.0.0`, contains stale `/webservice/rest/object/id/{id}?apikey={key}` URL.

- [ ] **Step 2: Replace file with Pimcore 12 updated content**

Write the following complete content to `engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md`:

```markdown
---
name: pimcore-datahub-api
description: >
  This skill should be used when the user asks about "Pimcore Datahub",
  "datahub GraphQL", "datahub REST", "PimcoreDataHubBundle", "datahub configuration",
  or discusses Pimcore Datahub-managed web services or API keys.
  Do not use for Pimcore Studio REST endpoints — use pimcore-studio-backend instead.
version: 1.1.0
---

## Datahub / API

```bash
composer require pimcore/data-hub
php bin/console pimcore:bundle:enable PimcoreDataHubBundle
php bin/console doctrine:migrations:migrate --no-interaction
```

- GraphQL: `/pimcore-datahub-webservices/graphql/{config-name}`
- Secure with API keys + Symfony firewall rules

## Simple REST API (Pimcore 12+)

New read-only REST API backed by OpenSearch / Elasticsearch — lighter alternative to GraphQL
for asset and data object delivery:

```bash
# Index data for Simple REST API
php bin/console datahub:simple-rest:rebuild-index
```

Endpoints follow the pattern `/datahub/rest/{config-name}/...` and return JSON.
Configure in Admin → Datahub → Simple REST.

## Pimcore 12 breaking changes

### GraphQL datetime type change

Date and datetime fields now return ISO 8601 strings instead of Unix timestamp integers:

```graphql
# OLD (Pimcore 11) — Unix timestamp integer
"releaseDate": 1709294400

# NEW (Pimcore 12) — ISO 8601 string with timezone
"releaseDate": "2024-03-01T12:00:00+00:00"
```

Update any client code that parsed datetime fields as integers.

### Command renamed

```bash
# OLD (removed in Pimcore 12)
php bin/console datahub:graphql:rebuild-definitions

# NEW
php bin/console datahub:graphql:rebuild-workspaces
```
```

- [ ] **Step 3: Verify YAML frontmatter parses and stale URL is gone**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md').read_text()
parts = text.split('---')
meta = yaml.safe_load(parts[1])
assert meta['version'] == '1.1.0', f'Expected 1.1.0, got {meta[\"version\"]}'
assert '/webservice/rest/object' not in text, 'Stale REST URL still present'
print('OK')
"
```

Expected: `OK`

- [ ] **Step 4: Verify key content strings present**

```bash
grep -q "simple-rest:rebuild-index" engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md && \
grep -q "rebuild-workspaces" engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md && \
grep -q "ISO 8601" engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/pimcore-datahub-api/SKILL.md
git commit -m "feat: update pimcore-datahub-api skill for Pimcore 12 (v1.1.0)"
```

---

### Task 4: Update pimcore-full-page-cache skill for Pimcore 12

**Files:**
- Modify: `engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md`

- [ ] **Step 1: Verify current file content**

```bash
cat engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md
```

Expected: version `1.0.0`, contains `\Pimcore\Cache\Runtime::set` (deprecated class name).

- [ ] **Step 2: Replace file with Pimcore 12 updated content**

Write the following complete content to `engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md`:

```markdown
---
name: pimcore-full-page-cache
description: >
  This skill should be used when the user asks about "Pimcore full-page cache",
  "output caching", "pimcore_nocache", "full_page_cache lifetime", or discusses
  Pimcore HTTP-level caching or cache exclusion patterns.
version: 1.1.0
---

## Full-page cache

```yaml
# config/packages/pimcore.yaml — unchanged in Pimcore 12
pimcore:
  full_page_cache:
    enabled: true
    lifetime: 120
    exclude_patterns:
      - ^/admin
      - ^/api
      - ^/user
      - ^/cart
```

```php
// Disable cache programmatically for dynamic pages (Pimcore 12+)
\Pimcore\Cache\RuntimeCache::set('pimcore_nocache', true);

// NOTE: \Pimcore\Cache\Runtime is a deprecated alias — still works in Pimcore 12
// but will be removed in a future version. Use RuntimeCache.
```

## Pimcore 12 changes

- **YAML config unchanged** — `pimcore.full_page_cache` keys are identical to Pimcore 11
- **`\Pimcore\Cache\Runtime` renamed** to `\Pimcore\Cache\RuntimeCache` (old name is a
  backward-compat alias; new code must use `RuntimeCache`)
- **`Cache-Control: no-store`** — responses carrying this header are now automatically excluded
  from full-page cache; no need to set `pimcore_nocache` manually for these responses
```

- [ ] **Step 3: Verify YAML frontmatter parses and deprecated class name is replaced**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md').read_text()
parts = text.split('---')
meta = yaml.safe_load(parts[1])
assert meta['version'] == '1.1.0', f'Expected 1.1.0, got {meta[\"version\"]}'
# The old bare class (without ::) must not be the primary example
lines = [l for l in text.splitlines() if 'Pimcore\\Cache\\Runtime::set' in l and 'RuntimeCache' not in l]
assert len(lines) == 0, f'Deprecated class still used as primary example: {lines}'
print('OK')
"
```

Expected: `OK`

- [ ] **Step 4: Verify key content strings present**

```bash
grep -q "RuntimeCache" engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md && \
grep -q "no-store" engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md && \
grep -q "unchanged" engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/pimcore-full-page-cache/SKILL.md
git commit -m "feat: update pimcore-full-page-cache skill for Pimcore 12 (v1.1.0)"
```

---

### Task 5: Create pimcore-studio-backend skill

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md`

- [ ] **Step 1: Create directory and write SKILL.md**

```bash
mkdir -p engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend
```

Write the following complete content to `engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md`:

```markdown
---
name: pimcore-studio-backend
description: >
  This skill should be used when the user asks about "Pimcore Studio API",
  "Studio Backend Bundle", "custom Studio endpoint", "AbstractApiController",
  "/pimcore-studio/api", or building custom REST endpoints for Pimcore Studio.
version: 1.0.0
---

## Pimcore Studio Backend

Pimcore Studio is the new React-based Admin UI (replaces the legacy ExtJS Classic Admin UI).
The **Studio Backend Bundle** exposes a REST API consumed by Studio's frontend, and lets you
add custom endpoints that appear in the auto-generated Swagger docs.

### Install

```bash
composer require pimcore/studio-backend-bundle
php bin/console pimcore:bundle:enable PimcoreStudioBackendBundle
php bin/console doctrine:migrations:migrate --no-interaction
```

Swagger UI: `/pimcore-studio/api/docs`
OpenAPI JSON spec: `/pimcore-studio/api/docs.json`

### Custom endpoint

Extend `AbstractApiController`. Controllers are standard Symfony controllers — place them anywhere
and let Symfony's attribute route discovery pick them up:

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
        // constructor injection works normally — inject any service
        return $this->json(['id' => $id]);
    }
}
```

### Security

Studio endpoints use the standard Symfony firewall and voter system — no Studio-specific
auth layer. Use `denyAccessUnlessGranted()` exactly as in any other Symfony controller:

```php
public function getAssetMetadata(int $id): JsonResponse
{
    $asset = Asset::getById($id);
    $this->denyAccessUnlessGranted('ASSET_VIEW', $asset);
    return $this->json(['id' => $id, 'filename' => $asset->getFilename()]);
}
```
```

- [ ] **Step 2: Verify YAML frontmatter parses**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md').read_text()
parts = text.split('---')
meta = yaml.safe_load(parts[1])
assert meta['version'] == '1.0.0'
assert meta['name'] == 'pimcore-studio-backend'
print('OK')
"
```

Expected: `OK`

- [ ] **Step 3: Verify key content strings present**

```bash
grep -q "AbstractApiController" engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md && \
grep -q "pimcore-studio/api/docs" engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md && \
grep -q "denyAccessUnlessGranted" engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 4: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-backend/SKILL.md
git commit -m "feat: add pimcore-studio-backend skill (v1.0.0)"
```

---

### Task 6: Create pimcore-studio-ui skill

**Files:**
- Create: `engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md`

- [ ] **Step 1: Create directory and write SKILL.md**

```bash
mkdir -p engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui
```

Write the following complete content to `engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md`:

```markdown
---
name: pimcore-studio-ui
description: >
  This skill should be used when the user asks about "Pimcore Studio UI",
  "Studio widget", "admin UI extension", "Studio React component", "Studio slot",
  "Studio UI SDK", "custom panel in Studio", or building admin UI extensions for Pimcore Studio.
version: 1.0.0
---

## Pimcore Studio UI

Pimcore Studio is the new React + TypeScript admin interface that replaces the legacy
ExtJS Classic Admin UI.

**Classic Admin UI timeline:**
- Pimcore 12: Classic Admin UI (ExtJS) **deprecated**
- Platform 2026.1: Classic Admin UI **removed**
- Legacy ExtJS admin extensions must be **rewritten in React** for Studio

### Stack

- **Frontend:** React + TypeScript + Ant Design
- **PHP bundle:** `pimcore/studio-ui-bundle` (ships the compiled JS frontend)
- **Extension API npm package:** `@pimcore-studio/ui-bundle-api`

### Setup

```bash
# In your custom bundle's frontend directory
npm install @pimcore-studio/ui-bundle-api
```

### Register a custom widget

Extensions plug into named **slots** in the Studio layout using the `pluginSystem` singleton:

```typescript
// src/Resources/public/js/studio-extension.ts
import { pluginSystem } from '@pimcore-studio/ui-bundle-api'
import { CustomAssetPanel } from './components/CustomAssetPanel'

pluginSystem.registerPlugin({
  name: 'custom-asset-panel',
  onInit: () => {
    pluginSystem.registerWidget({
      slot: 'asset-detail-tabs',   // slot name from Studio UI docs
      component: CustomAssetPanel,
      priority: 10,
    })
  },
})
```

### Key concepts

- **Slot** — named injection point in the Studio layout (e.g. `asset-detail-tabs`, `object-sidebar`)
- **Widget** — React component registered into a slot
- **Plugin system** — `pluginSystem` singleton from `@pimcore-studio/ui-bundle-api` that
  bootstraps all extensions at startup

### PHP pairing

Custom Studio UI widgets typically consume data from custom REST endpoints.
Use the `pimcore-studio-backend` skill to build the API side of the extension.
```

- [ ] **Step 2: Verify YAML frontmatter parses**

```bash
python3 -c "
import yaml, pathlib
text = pathlib.Path('engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md').read_text()
parts = text.split('---')
meta = yaml.safe_load(parts[1])
assert meta['version'] == '1.0.0'
assert meta['name'] == 'pimcore-studio-ui'
print('OK')
"
```

Expected: `OK`

- [ ] **Step 3: Verify key content strings present**

```bash
grep -q "pluginSystem" engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md && \
grep -q "@pimcore-studio/ui-bundle-api" engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md && \
grep -q "2026.1" engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md && \
echo "All checks passed"
```

Expected: `All checks passed`

- [ ] **Step 4: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/skills/pimcore-studio-ui/SKILL.md
git commit -m "feat: add pimcore-studio-ui skill (v1.0.0)"
```

---

### Task 7: Update plugin.json and marketplace.json descriptions

**Files:**
- Modify: `engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Verify current plugin.json content**

```bash
cat engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json
```

Expected: description contains `Pimcore 11` (without `/12 + Studio`).

- [ ] **Step 2: Update plugin.json**

Write the following content to `engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "php-symfony-pimcore",
  "description": "Expert-level PHP 8.x, Symfony 6/7, Pimcore 11/12 + Studio, Doctrine ORM, testing, and ops skills",
  "author": {
    "name": "mahek-credencys"
  }
}
```

- [ ] **Step 3: Update marketplace.json**

Write the following content to `.claude-plugin/marketplace.json`:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "pimcore-development-skills",
  "description": "Expert-level PHP 8.x, Symfony 6/7, Pimcore 11/12 + Studio, Doctrine ORM, testing, and ops skill pack for Claude Code",
  "owner": {
    "name": "mahek-credencys"
  },
  "plugins": [
    {
      "name": "php-symfony-pimcore",
      "description": "Expert-level PHP 8.x, Symfony 6/7, Pimcore 11/12 + Studio, Doctrine ORM, testing, and ops skills",
      "category": "development",
      "source": "./engineering/php-symfony-pimcore/plugin",
      "homepage": "https://github.com/mahek-credencys/pimcore-development-skills"
    }
  ]
}
```

- [ ] **Step 4: Verify both files updated**

```bash
grep -q "Pimcore 11/12" engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json && \
grep -q "Pimcore 11/12" .claude-plugin/marketplace.json && \
echo "Both files updated"
```

Expected: `Both files updated`

- [ ] **Step 5: Commit**

```bash
git add engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "feat: update plugin and marketplace descriptions for Pimcore 12 + Studio"
```

---

### Task 8: Push to GitHub

**Files:** none (git operation only)

- [ ] **Step 1: Verify all 6 skill files are present**

```bash
ls engineering/php-symfony-pimcore/plugin/skills/ | grep pimcore
```

Expected output includes all 6: `pimcore-data-objects`, `pimcore-datahub-api`,
`pimcore-documents-pages`, `pimcore-full-page-cache`, `pimcore-studio-backend`, `pimcore-studio-ui`

- [ ] **Step 2: Verify skill count is now 30**

```bash
ls engineering/php-symfony-pimcore/plugin/skills/ | wc -l
```

Expected: `30` (counts one directory per skill — no non-directory entries exist in this folder)

- [ ] **Step 3: Push to origin main**

```bash
git push origin main
```

Expected: `main -> main` confirmation line in output.
