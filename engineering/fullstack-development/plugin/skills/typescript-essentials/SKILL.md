---
name: typescript-essentials
description: >
  This skill should be used when the user asks about "TypeScript types",
  "tsconfig strict", "discriminated union", "utility types", "satisfies",
  "unknown vs any", or discusses typing Node.js/React code and type-safe APIs.
version: 1.0.0
---

## TypeScript Essentials

### Non-negotiable tsconfig

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,   // arr[i] is T | undefined — catches real bugs
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,       // explicit `import type`
    "module": "nodenext",
    "target": "es2023"
  }
}
```

### Discriminated unions replace boolean flags

```ts
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function render(state: FetchState<Product[]>) {
  switch (state.status) {
    case 'success': return state.data.length;  // data only exists here — compiler enforced
    case 'error':   return state.error.message;
    default:        return null;
  }
}
```

### Everyday patterns

```ts
// unknown for untrusted input — forces narrowing (never use any)
function parse(json: string): unknown { return JSON.parse(json); }

// satisfies: validate shape without widening the type
const routes = {
  home: '/', product: '/products/:id',
} satisfies Record<string, string>;

// Derive types from runtime schemas — single source of truth
import { z } from 'zod';
const ProductSchema = z.object({ id: z.number(), name: z.string() });
type Product = z.infer<typeof ProductSchema>;

// Utility types instead of hand-copied shapes
type ProductPatch = Partial<Pick<Product, 'name'>>;
type ProductMap = Record<number, Readonly<Product>>;
```

### Rules of thumb

- `any` disables the compiler; `unknown` + narrowing keeps safety at boundaries.
- Type function **returns** explicitly on exported/public APIs; infer locals.
- Prefer `interface` for public object contracts, `type` for unions/compositions.
- Validate at runtime boundaries (HTTP, env, DB rows) with zod — TS types vanish
  at runtime and guarantee nothing about external data.
