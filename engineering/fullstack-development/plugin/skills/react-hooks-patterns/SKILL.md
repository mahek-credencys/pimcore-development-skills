---
name: react-hooks-patterns
description: >
  This skill should be used when the user asks about "useEffect dependencies",
  "custom hooks", "useState vs useRef", "stale closure", "derived state",
  or discusses React hooks bugs, infinite re-render loops, or effect cleanup.
version: 1.0.0
---

## React Hooks Patterns (React 19)

### Don't sync state you can derive

```jsx
// BAD — duplicated state drifts and causes extra renders
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);       // must remember to update both

// GOOD — derive during render
const [items, setItems] = useState([]);
const count = items.length;
const total = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);
```

### useEffect is for synchronizing with external systems only

Event handlers, derived values, and data transforms do **not** belong in effects.

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/products/${id}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setProduct)
    .catch(err => { if (err.name !== 'AbortError') setError(err); });

  return () => controller.abort();   // cleanup prevents state-after-unmount + races
}, [id]);                            // every reactive value used inside goes here
```

For server data prefer TanStack Query (see `react-data-fetching`) over hand-rolled
effects — it handles races, caching, and retries.

### Extract reusable logic into custom hooks

```jsx
function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

// usage: const query = useDebouncedValue(searchInput);
```

### Quick rules

- `useRef` for values that must persist without re-rendering (timers, DOM nodes,
  previous values); `useState` for anything the UI shows.
- Functional updates (`setCount(c => c + 1)`) avoid stale-closure bugs in callbacks.
- Never call hooks conditionally or in loops — top level of the component only.
- An empty `[]` dependency array is a claim the effect uses no reactive values —
  let the `exhaustive-deps` ESLint rule verify it, don't silence it.
