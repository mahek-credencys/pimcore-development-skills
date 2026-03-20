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

- `getChildren()` / `getSiblings()` on `AbstractObject`, `Document`, and `Asset` now return **unloaded Listing
  objects** — must call `.load()` explicitly or iterate directly (auto-loads on iteration)
- `getObject()` / `setObject()` removed from `Pimcore\Model\Document\Link` and
  `Pimcore\Model\DataObject\Data\Link` — use `getElement()` / `setElement()` instead
- Native PHP 8 type hints added to all Pimcore classes — custom classes extending Pimcore must match signatures
- New helper: `DataObject\Service::useInheritedValues(bool, Closure)` for inheritance control within closures

### `pimcore-documents-pages` v1.0.0 → v1.1.0

Changes to add:

- Twig editables (`pimcore_input`, `pimcore_wysiwyg`, `pimcore_image`, `pimcore_renderlet`) are **unchanged** —
  note this explicitly so developers don't second-guess backward compatibility
- Add `raw` Twig filter note for wysiwyg output stored in variables
- Note removal of `$types` property from `Pimcore\Model\Document`

### `pimcore-datahub-api` v1.0.0 → v1.1.0

Changes to add:

- New **Datahub Simple REST API** — read-only access to assets and data objects, backed by
  OpenSearch/Elasticsearch for performance; complements GraphQL
- GraphQL: datetime fields changed type from `int` → `string` (now timezone-aware ISO 8601)
- Deprecated command removed: `datahub:graphql:rebuild-definitions`
  — replacement: `datahub:graphql:rebuild-workspaces`

### `pimcore-full-page-cache` v1.0.0 → v1.1.0

Changes to add:

- YAML config (`pimcore.full_page_cache`) is **unchanged** — confirm explicitly
- `\Pimcore\Cache\Runtime` renamed to `\Pimcore\Cache\RuntimeCache`; old name still aliased but deprecated
- Responses with `Cache-Control: no-store` header are now **automatically excluded** from full-page cache

## New Skills (2)

### `pimcore-studio-backend` v1.0.0

**Trigger phrases:** "Pimcore Studio API", "Studio Backend Bundle", "custom Studio endpoints",
"AbstractApiController", "pimcore-studio/api", building custom REST endpoints for Pimcore Studio.

**Content:**

- Install: `composer require pimcore/studio-backend-bundle`
- Extend `AbstractApiController` to register custom REST endpoints consumed by Studio frontend
- Use `#[Route]` + OpenAPI attributes (`#[OA\Get]`, `#[OA\Post]`, `#[OA\Tag]`) for auto-generated Swagger docs
- Swagger UI: `/pimcore-studio/api/docs` — OpenAPI spec: `/pimcore-studio/api/docs.json`
- Security: Studio endpoints use the standard Symfony firewall/voter system
- Code example: custom endpoint returning asset metadata (controller, route, OA attributes)

### `pimcore-studio-ui` v1.0.0

**Trigger phrases:** "Pimcore Studio UI", "Studio widget", "admin UI extension", "Studio React component",
"registering a custom widget in Studio", building admin UI extensions for Pimcore Studio.

**Content:**

- Stack: React + TypeScript + Ant Design — Studio UI is `pimcore/studio-ui-bundle`
- Classic Admin UI (ExtJS) deprecated in Pimcore 12; **removed in Platform 2026.1**
- Extending Studio UI: create a custom npm package that registers widgets/panels via the Studio extension API
- Key concepts: widget registration, slot system (plug-in points), Studio UI SDK
- PHP pairing: custom Studio UI extensions consume `pimcore-studio-backend` endpoints
- Migration note: legacy ExtJS admin extensions must be rewritten in React for Studio

## Plugin Metadata Changes

- `plugin.json` description updated to: `"Expert-level PHP 8.x, Symfony 6/7, Pimcore 11/12 + Studio,
  Doctrine ORM, testing, and ops skills"`
- `marketplace.json` description updated to match

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

Also update:
- `engineering/php-symfony-pimcore/plugin/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

## Out of Scope

- Pimcore 10 compatibility
- Pimcore 13 / Symfony 7 (not released yet)
- Full migration tooling or CLI scripts
- Publishing updated plugin to a public registry
