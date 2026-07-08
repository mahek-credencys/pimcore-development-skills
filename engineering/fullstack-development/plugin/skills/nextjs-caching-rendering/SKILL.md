---
name: nextjs-caching-rendering
description: >
  This skill should be used when the user asks about "Next.js caching",
  "ISR", "revalidate", "static vs dynamic rendering", "stale data in Next.js",
  "revalidateTag", or discusses why a Next.js page shows outdated content.
version: 1.0.0
---

## Next.js Caching & Rendering

Most "why is my data stale / why is my page slow" issues are cache-layer
misunderstandings. Know which layer you're fighting.

### Static vs dynamic — decided per route

A route is **static** (built once, served from cache) unless it uses dynamic
APIs (`cookies()`, `headers()`, `searchParams`) or opts out:

```ts
export const dynamic = 'force-dynamic';   // always render per-request
export const revalidate = 300;            // ISR: static, regenerated every 5 min
```

### ISR + on-demand revalidation (the workhorse pattern)

```ts
// Tag data when fetching
const products = await fetch(`${API}/products`, {
  next: { revalidate: 300, tags: ['products'] },
}).then(r => r.json());

// Invalidate precisely when data changes (in a Server Action or webhook)
import { revalidateTag } from 'next/cache';
revalidateTag('products');
```

CMS/PIM-driven sites (e.g. Pimcore as headless backend): static pages + a
webhook route handler calling `revalidateTag` on publish = CDN speed with
fresh content.

### Caching non-fetch data sources (ORM, DB)

```ts
import { unstable_cache } from 'next/cache';

export const getProducts = unstable_cache(
  () => db.product.findMany({ where: { active: true } }),
  ['products-list'],                       // cache key
  { revalidate: 300, tags: ['products'] },
);
```

(Next 15+ `'use cache'` directive supersedes this once `cacheComponents` is on.)

### The four layers (debug top-down)

| Layer | Scope | Cleared by |
|---|---|---|
| Request memoization | one render pass | automatic |
| Data cache (fetch/unstable_cache) | across requests | `revalidateTag/Path`, TTL |
| Full route cache | static routes | rebuild or revalidation |
| Router cache | client navigation | `router.refresh()`, mutation |

### Rules of thumb

- `fetch` is **not cached by default** since Next 15 — opt in with
  `next.revalidate`/`cache: 'force-cache'`.
- Stale page after deploy-time fetch? You built it statically — check `dynamic`
  and `revalidate` before blaming the API.
- Per-user content can't be statically cached — read `cookies()` and accept
  dynamic rendering, or stream the personal part in a Suspense boundary.
