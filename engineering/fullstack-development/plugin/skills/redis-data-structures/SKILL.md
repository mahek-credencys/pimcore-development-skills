---
name: redis-data-structures
description: >
  This skill should be used when the user asks about "Redis rate limiting",
  "distributed lock", "Redis queue", "pub/sub", "Redis sorted set leaderboard",
  "Redis streams", or discusses using Redis beyond plain caching.
version: 1.0.0
---

## Redis Data Structures in Practice

Redis is a toolbox, not just a cache — pick the structure that matches the job.

### Rate limiting (fixed window)

```js
async function isAllowed(userId, limit = 100) {
  const key = `rate:${userId}:${Math.floor(Date.now() / 60_000)}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= limit;
}
```

(Sliding window: a sorted set of timestamps with `ZREMRANGEBYSCORE` + `ZCARD`.)

### Distributed lock (single-instance)

```js
const token = crypto.randomUUID();
const acquired = await redis.set(`lock:import`, token, 'NX', 'PX', 30_000);
if (!acquired) return;                    // someone else holds it
try {
  await runImport();
} finally {                               // release only YOUR lock — atomic check
  await redis.eval(
    `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) end`,
    1, 'lock:import', token,
  );
}
```

### Job queue — use Streams (durable), not pub/sub

```js
await redis.xadd('jobs', '*', 'type', 'resize', 'assetId', '42');   // produce

// consumer group: each job delivered to ONE worker, ack'd, replayable on crash
await redis.xgroup('CREATE', 'jobs', 'workers', '$', 'MKSTREAM').catch(() => {});
const jobs = await redis.xreadgroup('GROUP', 'workers', 'w1',
  'COUNT', 10, 'BLOCK', 5000, 'STREAMS', 'jobs', '>');
/* process */ await redis.xack('jobs', 'workers', jobId);
```

Pub/sub is fire-and-forget (offline subscriber = lost message) — use it only for
ephemeral fan-out like websocket broadcasts or cache-invalidation pings.
In Node, prefer **BullMQ** (built on these primitives) over hand-rolling queues.

### Quick structure picker

| Need | Structure |
|---|---|
| Leaderboard / top-N / trending | Sorted set (`ZINCRBY`, `ZREVRANGE`) |
| Session / object fields | Hash (`HSET user:42 name "…"`) |
| Recent-items list, capped log | List + `LTRIM` |
| Unique visitors (approximate) | HyperLogLog (`PFADD`/`PFCOUNT`) |
| Feature flags / sets, tags | Set (`SISMEMBER`) |
| Durable work queue, event log | Stream + consumer groups |

### Rules of thumb

- Everything above relies on single-command atomicity; multi-step logic needs
  `MULTI`/Lua — never read-modify-write from the client.
- `SCAN`, never `KEYS`, in production.
- One Redis per concern (cache vs queue vs sessions) once traffic is real —
  eviction policies conflict (`allkeys-lru` would evict your jobs).
