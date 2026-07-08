---
name: react-data-fetching
description: >
  This skill should be used when the user asks about "fetch data in React",
  "TanStack Query", "react-query", "useQuery", "cache invalidation",
  "optimistic update", or discusses server state, loading states, or refetching.
version: 1.0.0
---

## React Data Fetching (TanStack Query v5)

Server state (API data) is not client state — don't put it in useState/Redux.
TanStack Query gives caching, deduping, retries, and race-safety for free.

### Queries

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ProductList({ category }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['products', { category }],      // cache key — include ALL inputs
    queryFn: () => fetchProducts(category),
    staleTime: 60_000,                          // serve cached data for 1 min
  });

  if (isPending) return <Spinner />;
  if (isError)   return <ErrorBox error={error} />;
  return <ul>{data.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### Mutations + invalidation

```jsx
function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.post('/products', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }), // refetch lists
  });
}

// in the component
const create = useCreateProduct();
<button disabled={create.isPending} onClick={() => create.mutate(form)}>Save</button>
```

### Query key discipline

- Keys are the cache identity: `['products']` list, `['products', id]` detail.
- Centralize them in a `queryKeys` factory object so invalidation never typos.
- Everything the queryFn uses must appear in the key — otherwise stale cache hits.

### Rules of thumb

- `staleTime` is the main tuning knob; default 0 means refetch on every mount/focus.
- Optimistic updates: `onMutate` snapshot → rollback in `onError` → settle in
  `onSettled` with invalidation.
- Pagination: `placeholderData: keepPreviousData` prevents UI flicker between pages.
- For Next.js App Router, fetch on the server first and hydrate; use React Query
  for interactive client-side updates.
