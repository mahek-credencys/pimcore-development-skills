---
name: redis-caching-patterns
description: >
  This skill should be used when the user asks about "Redis caching",
  "cache-aside", "cache invalidation", "TTL strategy", "cache stampede",
  or discusses adding a cache layer in front of a database or API.
version: 1.0.0
---

## Redis Caching Patterns (Redis 7/8)

### Cache-aside — the default pattern

```js
async function getProduct(id) {
  const key = `product:${id}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const product = await db.products.findById(id);   // miss → source of truth
  if (product) {
    await redis.set(key, JSON.stringify(product), 'EX', 300);  // ALWAYS a TTL
  }
  return product;
}

async function updateProduct(id, data) {
  const product = await db.products.update(id, data);
  await redis.del(`product:${id}`);                 // invalidate, don't update
  return product;
}
```

**Delete on write, don't set** — writing the new value to cache during an update
races with concurrent readers; a delete forces the next reader to load fresh.

### Key discipline

- Namespaced, versioned keys: `app:v2:product:42` — bump the version to
  mass-invalidate after a schema change.
- Every key gets a TTL. A cache without expiry is a second database you now
  have to keep consistent forever.
- Jitter TTLs (`300 + rand(0,60)`) so a deploy-time warm-up doesn't expire
  everything at the same second.

### Cache stampede protection

When a hot key expires, hundreds of requests hit the DB simultaneously:

```js
const lock = await redis.set(`lock:${key}`, '1', 'NX', 'EX', 10);
if (lock) {
  const fresh = await loadFromDb();                 // one winner recomputes
  await redis.set(key, JSON.stringify(fresh), 'EX', 300);
  await redis.del(`lock:${key}`);
  return fresh;
}
await sleep(50); return getProduct(id);             // losers retry the cache
```

(Or serve slightly-stale data while one background worker refreshes.)

### What to cache

- ✅ Expensive reads, hot lists, session data, computed aggregates, API responses.
- ❌ Anything you can't afford to lose or serve stale for its TTL; per-user
  one-off data with no reuse.

### Rules of thumb

- Set `maxmemory` + `allkeys-lru` (or `volatile-lru`) — an unbounded cache OOMs.
- Cache misses must be graceful: Redis down ⇒ slower app, never a broken app
  (wrap calls, short timeouts, circuit break).
- Measure the hit rate (`INFO stats` → keyspace_hits/misses); below ~80% the
  keys or TTLs are wrong.
