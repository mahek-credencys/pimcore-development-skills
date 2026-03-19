---
title: PHP · Symfony · Pimcore Global Plugin — Install Design
date: 2026-03-19
status: approved
---

# PHP · Symfony · Pimcore Global Plugin — Install Design

## Goal

Package the existing 28-skill PHP/Symfony/Pimcore reference pack as a proper
Claude Code plugin and install it globally on the local machine, so all 28
skills are available both as model-invoked context and as `/` slash commands
in every project.

## Approach

**Option A — repo-backed symlink install.**
The authoritative plugin source lives inside this repo. A symlink wires it
into Claude Code's plugin cache. Edits to the repo are live immediately; no
re-copy step is needed.

## Plugin Structure (in-repo)

```
engineering/php-symfony-pimcore/plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    ├── php-8x/SKILL.md
    ├── php-oop-solid/SKILL.md
    ├── php-composer/SKILL.md
    ├── php-opcache/SKILL.md
    ├── symfony-service-container/SKILL.md
    ├── symfony-routing-controllers/SKILL.md
    ├── symfony-event-system/SKILL.md
    ├── symfony-lazy-services/SKILL.md
    ├── doctrine-entities-mapping/SKILL.md
    ├── doctrine-querybuilder-dql/SKILL.md
    ├── doctrine-lazy-loading/SKILL.md
    ├── doctrine-migrations/SKILL.md
    ├── pimcore-data-objects/SKILL.md
    ├── pimcore-documents-pages/SKILL.md
    ├── pimcore-datahub-api/SKILL.md
    ├── pimcore-full-page-cache/SKILL.md
    ├── symfony-messenger-queues/SKILL.md
    ├── symfony-console-commands/SKILL.md
    ├── symfony-custom-bundles/SKILL.md
    ├── symfony-security-voters/SKILL.md
    ├── perf-profiling/SKILL.md
    ├── perf-redis-caching/SKILL.md
    ├── perf-elasticsearch/SKILL.md
    ├── perf-ci-cd-docker/SKILL.md
    ├── testing-phpunit/SKILL.md
    ├── testing-functional/SKILL.md
    ├── testing-phpstan-psalm/SKILL.md
    └── testing-cs-fixer/SKILL.md
```

## Skill File Format

Each `SKILL.md` carries frontmatter for both invocation modes:

```yaml
---
name: symfony-service-container
description: >
  Use when working with Symfony service container, dependency injection,
  autowiring, service tagging, or tagged iterators.
version: 1.0.0
---
```

- **`name`** — becomes the slash command (`/symfony-service-container`)
- **`description`** — trigger phrases Claude uses for model-invoked activation
- Body — copy of the relevant section from the existing reference `.md` file

## plugin.json

```json
{
  "name": "php-symfony-pimcore",
  "description": "Expert-level PHP 8.x, Symfony 6/7, Pimcore 11, Doctrine ORM, testing, and ops skills",
  "author": {
    "name": "mahek-credencys"
  }
}
```

## Installation Steps

1. **Create symlink**
   ```bash
   mkdir -p ~/.claude/plugins/cache/local/php-symfony-pimcore
   ln -s /home/ubuntu/projects/pimcore-development-skills/engineering/php-symfony-pimcore/plugin \
         ~/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0
   ```

2. **Register in `installed_plugins.json`**
   Add an entry under `plugins` key:
   ```json
   "php-symfony-pimcore@local": [
     {
       "scope": "user",
       "installPath": "/root/.claude/plugins/cache/local/php-symfony-pimcore/1.0.0",
       "version": "1.0.0",
       "installedAt": "<timestamp>",
       "lastUpdated": "<timestamp>"
     }
   ]
   ```

3. **Enable in `settings.json`**
   ```json
   "enabledPlugins": {
     ...existing...,
     "php-symfony-pimcore@local": true
   }
   ```

## Complete Skill Inventory (28)

| Skill name | Source section | Trigger area |
|---|---|---|
| `php-8x` | php-foundations § PHP 8.x | match, enums, fibers |
| `php-oop-solid` | php-foundations § OOP & SOLID | interfaces, DI, patterns |
| `php-composer` | php-foundations § Composer | autoloading, versioning |
| `php-opcache` | php-foundations § OPcache | preloading, cache tuning |
| `symfony-service-container` | symfony-core § Service container | DI, autowiring, tagging |
| `symfony-routing-controllers` | symfony-core § Routing & controllers | routes, param converters |
| `symfony-event-system` | symfony-core § Event system | subscribers, listeners |
| `symfony-lazy-services` | symfony-core § Lazy services | lazy proxy |
| `doctrine-entities-mapping` | doctrine-orm § Entities & mapping | ORM attributes, relations |
| `doctrine-querybuilder-dql` | doctrine-orm § QueryBuilder / DQL | custom queries |
| `doctrine-lazy-loading` | doctrine-orm § Lazy loading | N+1, EXTRA_LAZY |
| `doctrine-migrations` | doctrine-orm § Migrations | schema evolution |
| `pimcore-data-objects` | pimcore § Data objects | classes, bricks, fields |
| `pimcore-documents-pages` | pimcore § Documents & pages | editables, areas |
| `pimcore-datahub-api` | pimcore § Datahub / API | GraphQL, REST |
| `pimcore-full-page-cache` | pimcore § Full-page cache | output caching |
| `symfony-messenger-queues` | superpower-skills § Messenger | async, workers, retry |
| `symfony-console-commands` | superpower-skills § Console | batch jobs, imports |
| `symfony-custom-bundles` | superpower-skills § Custom bundles | bundle extension |
| `symfony-security-voters` | superpower-skills § Security | voters, firewalls |
| `perf-profiling` | performance-ops § Profiling | Blackfire, Xdebug |
| `perf-redis-caching` | performance-ops § Redis | sessions, cache pools |
| `perf-elasticsearch` | performance-ops § Elasticsearch | search, product listing |
| `perf-ci-cd-docker` | performance-ops § CI/CD | deploy, containers |
| `testing-phpunit` | testing-dx § PHPUnit | unit, integration tests |
| `testing-functional` | testing-dx § Functional | WebTestCase, BrowserKit |
| `testing-phpstan-psalm` | testing-dx § PHPStan / Psalm | static analysis |
| `testing-cs-fixer` | testing-dx § CS Fixer | linting, PSR-12 |

## Out of Scope

- Publishing to a public marketplace
- Automatic update mechanism
- Project-scoped installation
