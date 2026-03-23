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
