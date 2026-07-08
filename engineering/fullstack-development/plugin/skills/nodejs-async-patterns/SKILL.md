---
name: nodejs-async-patterns
description: >
  This skill should be used when the user asks about "async/await in Node",
  "Promise.all", "event loop blocking", "worker threads", "AbortController",
  "parallel async calls", or discusses Node.js concurrency, callbacks, or
  unhandled promise rejections.
version: 1.0.0
---

## Node.js Async Patterns

### Run independent async work in parallel

Sequential `await` on independent calls is the #1 avoidable latency bug:

```js
// BAD — 3 round trips run one after another
const user = await getUser(id);
const orders = await getOrders(id);
const prefs = await getPrefs(id);

// GOOD — all three run concurrently
const [user, orders, prefs] = await Promise.all([
  getUser(id), getOrders(id), getPrefs(id),
]);

// Use allSettled when partial failure is acceptable
const results = await Promise.allSettled(tasks);
const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
```

### Never block the event loop

CPU-heavy work (image processing, crypto, large JSON parse) freezes every request.
Offload to a worker thread:

```js
import { Worker } from 'node:worker_threads';

function runInWorker(file, data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(file, { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

### Cancel with AbortController

```js
const ac = new AbortController();
setTimeout(() => ac.abort(), 5_000);

try {
  const res = await fetch(url, { signal: ac.signal });
} catch (err) {
  if (err.name === 'AbortError') { /* timed out */ }
}
```

### Rules of thumb

- Always `await` or `.catch()` every promise — unhandled rejections crash Node (default since v15).
- Limit concurrency for large batches: use `Promise.all` on chunks or a pool (`p-limit`).
- Prefer `node:fs/promises`, `node:timers/promises` over callback APIs.
- `for await...of` for streams and paginated APIs; never buffer unbounded input in memory.
