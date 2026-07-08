---
name: react-performance
description: >
  This skill should be used when the user asks about "React re-renders",
  "React.memo", "useMemo vs useCallback", "code splitting", "lazy loading
  components", "slow list rendering", or discusses React performance profiling.
version: 1.0.0
---

## React Performance (React 19)

### Find the problem before memoizing

Profile with React DevTools → Profiler. Most "slow React" is one of: rendering
huge lists, expensive work during render, or context churn. Memoize the proven
hotspot, not everything — the React Compiler auto-memoizes in new projects,
making manual `useMemo`/`useCallback` increasingly unnecessary.

### Memoization that actually works

```jsx
// memo is defeated if any prop is a fresh object/function each render
const ProductRow = React.memo(function ProductRow({ product, onSelect }) {
  return <li onClick={() => onSelect(product.id)}>{product.name}</li>;
});

function List({ products }) {
  const [selected, setSelected] = useState(null);
  const onSelect = useCallback((id) => setSelected(id), []);  // stable reference
  return products.map(p => <ProductRow key={p.id} product={p} onSelect={onSelect} />);
}
```

### Code-split routes and heavy widgets

```jsx
const AdminDashboard = lazy(() => import('./AdminDashboard'));

<Suspense fallback={<Spinner />}>
  <AdminDashboard />
</Suspense>
```

### Long lists → virtualize

Render only visible rows with `@tanstack/react-virtual` for lists beyond a few
hundred items — DOM size, not React, is usually the bottleneck.

### Keep renders cheap

- Push state down: a keystroke in a search box shouldn't re-render the page —
  isolate it in a child component.
- Split contexts by change-frequency (theme vs. live data); a context update
  re-renders **every** consumer.
- Stable `key`s from data ids — index keys cause remounts and lost state on reorder.
- Defer non-urgent updates: `useDeferredValue(query)` keeps typing responsive
  while filtering large results.
