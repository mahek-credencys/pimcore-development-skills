---
name: nextjs-app-router
description: >
  This skill should be used when the user asks about "Next.js App Router",
  "server components", "layout.tsx", "dynamic routes Next.js", "params
  searchParams", "use client", or discusses structuring a Next.js application.
version: 1.0.0
---

## Next.js App Router (Next.js 15/16)

### File conventions

```
app/
├── layout.tsx              # root layout — html/body, providers
├── page.tsx                # /
├── products/
│   ├── layout.tsx          # nested layout (persists across child navigations)
│   ├── page.tsx            # /products
│   ├── loading.tsx         # streaming Suspense fallback
│   ├── error.tsx           # error boundary ('use client')
│   └── [id]/page.tsx       # /products/42
└── api/orders/route.ts     # route handler (GET/POST exports)
```

### Server Components are the default — fetch where you render

```tsx
// app/products/[id]/page.tsx — runs on the server, no useEffect, no client JS
export default async function ProductPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;               // params/searchParams are async (15+)
  const product = await getProduct(id);      // direct DB/API call
  if (!product) notFound();

  return (
    <article>
      <h1>{product.name}</h1>
      <AddToCart productId={product.id} />   {/* interactive child = client */}
    </article>
  );
}
```

```tsx
// components/AddToCart.tsx — client island, as small as possible
'use client';
import { useState } from 'react';

export function AddToCart({ productId }: { productId: number }) {
  const [qty, setQty] = useState(1);
  /* ... */
}
```

### The client/server boundary

- `'use client'` marks the **boundary** — everything it imports becomes client code.
  Push it to the leaves; a page-level `'use client'` throws away the RSC benefit.
- Server → client props must be serializable (no functions, Dates become strings
  unless using the React serializer).
- Server-only secrets: `import 'server-only'` in data modules guarantees they
  never reach the bundle.

### Rules of thumb

- `loading.tsx` + `<Suspense>` around slow sections → streamed HTML, fast TTFB.
- `generateStaticParams` for known dynamic routes → built ahead of time.
- `generateMetadata` for per-page SEO instead of manual `<head>`.
- Route handlers (`route.ts`) only for external consumers/webhooks — pages
  should fetch directly, and mutations use Server Actions.
