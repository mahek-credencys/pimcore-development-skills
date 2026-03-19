# Marketplace Metadata — Design Spec
**Date:** 2026-03-19
**Status:** Approved
**Author:** mahek-credencys

---

## Goal

Add a `marketplace` block to `engineering/index.json` so the PHP · Symfony · Pimcore Expert Pack can be discovered, browsed, and installed from a custom/self-hosted marketplace that fetches `index.json` directly from the GitHub raw URL.

---

## Schema

A single `"marketplace"` key is added to the existing `index.json`. All marketplace-specific fields are nested under it, keeping the top-level registry fields (used by Claude Code CLI) unchanged.

### `marketplace` block structure

| Field | Type | Purpose |
|---|---|---|
| `display.description` | string | Human-readable summary shown in the marketplace card |
| `display.icon_url` | string\|null | URL to a square icon image (PNG/SVG). `null` if no asset exists; marketplace must render a placeholder. |
| `display.banner_url` | string\|null | URL to a wide banner image. `null` if no asset exists; marketplace must render a placeholder. |
| `categories` | string[] | Filterable tags used **only** by the marketplace UI (distinct from top-level `tags` which are used by the Claude Code CLI). Both may have overlapping values. |
| `pricing.model` | enum | One of `"free"`, `"paid"`, `"team"`. This pack uses `"free"`. Marketplace must reject unknown values. |
| `stats.installs` | number | **Seed value only.** The marketplace must ignore this field and use its own server-side install count. This field exists solely for bootstrapping a new marketplace with no prior data. |
| `stats.rating` | number\|null | `null` when `rating_count === 0`; otherwise a float 0–5. These two fields must be kept in sync: `rating` is `null` if and only if `rating_count` is `0`. The marketplace enforces this invariant server-side; the JSON always carries the seed state (`null` / `0`). |
| `stats.rating_count` | number | Count of reviews. Seed value `0`. See `stats.rating` invariant above. |
| `compatibility.min_claude_code_version` | string (semver) | Minimum Claude Code version in `MAJOR.MINOR.PATCH` semver format. Marketplace must use semver comparison; if the user's installed version is below this value the marketplace must block install and display a version warning. |
| `compatibility.platforms` | enum[] | Subset of `["linux", "macos", "windows"]` (lowercase). No other values are valid. Marketplace hides the pack on unsupported platforms. |
| `changelog` | array | Array of `{ version: string (semver), date: string (ISO 8601 YYYY-MM-DD), notes: string (max 500 chars) }` entries, newest first. `changelog[0].version` must always match the top-level `version` field; a mismatch is a validation error. |

### `files` vs `skills_count`

`files` lists the **skill category files** (7 files). `skills_count` (28) is the total number of individual skill rules across all files — one file may contain many skills. These are independent fields; `skills_count` is authoritative for display and is not validated against `files.length`.

### `categories` vs `tags`

`tags` (top-level) are consumed by the **Claude Code CLI** for indexing and search. `categories` (inside `marketplace`) are consumed by the **custom marketplace UI** for browse filters. They may overlap in value but serve different consumers and must not be assumed to stay in sync.

---

## Fetch Flow

1. **Registration** — The marketplace operator registers the pack by providing the raw `index.json` URL:
   `https://raw.githubusercontent.com/mahek-credencys/pimcore-development-skills/main/engineering/index.json`

2. **Discovery/Browse** — The marketplace fetches that URL on a schedule, reads `marketplace.display`, `marketplace.categories`, `marketplace.pricing`, and renders the pack listing card.

3. **Install** — When a user installs the pack, the marketplace reads the top-level `files` array and fetches each skill file. It increments `stats.installs` server-side.

4. **Update detection** — The marketplace compares the top-level `version` field on each fetch. On version bump, it reads `marketplace.changelog[0]` to display release notes.

---

## Final `index.json`

```json
{
  "pack_id": "php-symfony-pimcore-expert",
  "name": "PHP · Symfony · Pimcore Expert Pack",
  "version": "1.0.0",
  "author": "mahek-credencys",
  "repo": "https://github.com/mahek-credencys/pimcore-development-skills",
  "raw_base": "https://raw.githubusercontent.com/mahek-credencys/pimcore-development-skills/main/",
  "skills_count": 28,
  "level": "Expert",
  "tags": ["php", "symfony", "pimcore", "doctrine", "backend"],
  "files": [
    "engineering/php-symfony-pimcore/php-foundations.md",
    "engineering/php-symfony-pimcore/symfony-core.md",
    "engineering/php-symfony-pimcore/doctrine-orm.md",
    "engineering/php-symfony-pimcore/pimcore.md",
    "engineering/php-symfony-pimcore/superpower-skills.md",
    "engineering/php-symfony-pimcore/performance-ops.md",
    "engineering/php-symfony-pimcore/testing-dx.md"
  ],
  "marketplace": {
    "display": {
      "description": "28 expert-level Claude Code skills for PHP 8.x, Symfony, Pimcore, Doctrine ORM, and production ops. Built for backend teams shipping on the Pimcore stack.",
      "icon_url": null,
      "banner_url": null
    },
    "categories": ["php", "symfony", "pimcore", "doctrine", "backend"],
    "pricing": {
      "model": "free"
    },
    "stats": {
      "installs": 0,
      "rating": null,
      "rating_count": 0
    },
    "compatibility": {
      "min_claude_code_version": "1.0.0",
      "platforms": ["linux", "macos", "windows"]
    },
    "changelog": [
      {
        "version": "1.0.0",
        "date": "2026-03-19",
        "notes": "Initial release with 28 expert-level skills across PHP, Symfony, Pimcore, Doctrine ORM, performance, and testing."
      }
    ]
  }
}
```

> **Note:** `icon_url` and `banner_url` are `null` until image assets are added to `assets/` in the repo. Once added, set them to the raw GitHub URLs for `assets/icon.png` and `assets/banner.png`.

---

## Assets

`icon_url` and `banner_url` ship as `null` in the initial release. When image assets are ready, add them to an `assets/` directory in the repo root and update these fields to the corresponding raw GitHub URLs. The marketplace must render a placeholder when either field is `null`.

## Fetch / Caching Guidance

The marketplace fetches `index.json` on a **periodic schedule** (recommended: every 24 hours or on user-triggered refresh). It must respect standard HTTP cache headers (`ETag`, `Cache-Control`) returned by the GitHub raw CDN to avoid redundant fetches.

---

## Out of Scope

- Server-side marketplace implementation
- Auth / publishing API
- Paid pricing tiers
- Automated stats sync back to `index.json`
