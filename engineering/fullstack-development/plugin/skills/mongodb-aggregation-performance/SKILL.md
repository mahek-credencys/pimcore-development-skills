---
name: mongodb-aggregation-performance
description: >
  This skill should be used when the user asks about "MongoDB aggregation",
  "$lookup", "$match pipeline", "MongoDB slow query", "MongoDB index",
  "compound index Mongo", or discusses aggregation pipelines and query performance.
version: 1.0.0
---

## MongoDB Aggregation & Performance (MongoDB 8.0)

### Pipeline: filter early, project late

```js
db.orders.aggregate([
  // 1. $match FIRST — uses indexes, shrinks everything downstream
  { $match: { status: "paid", createdAt: { $gte: ISODate("2026-01-01") } } },

  // 2. reshape / join on the reduced set
  { $unwind: "$items" },
  { $group: {
      _id: "$items.sku",
      revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      orders:  { $addToSet: "$_id" },
  }},
  { $sort: { revenue: -1 } },
  { $limit: 20 },

  // 3. $lookup only on the final small set
  { $lookup: { from: "products", localField: "_id",
               foreignField: "sku", as: "product" } },
]);
```

- Only `$match` and `$sort` **at the start** of a pipeline use indexes.
- `$lookup` after `$limit`, never before — joining then filtering is the
  classic slow pipeline.
- Keep the foreign side of every `$lookup` indexed (`foreignField`).

### Index rules (ESR)

Compound index field order: **E**quality → **S**ort → **R**ange.

```js
// query: { status: "paid", total: { $gt: 100 } } sorted by createdAt desc
db.orders.createIndex({ status: 1, createdAt: -1, total: 1 });   // E, S, R
```

- Covered query: all needed fields in the index + `projection` excluding `_id`
  → no document fetch at all.
- Partial indexes for sparse states:
  `createIndex({ expiresAt: 1 }, { partialFilterExpression: { status: "active" } })`.
- TTL index for expiring data: `createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })`.

### Diagnose

```js
db.orders.find({ status: "paid" }).explain("executionStats")
// healthy: stage IXSCAN, nReturned ≈ totalDocsExamined
// sick:    COLLSCAN, or docsExamined >> nReturned (index not selective)
```

Enable the profiler for slow ops: `db.setProfilingLevel(1, { slowms: 100 })`.

### Rules of thumb

- Pagination: range on an indexed field (`_id > lastId`), not `skip()` — skip
  walks everything it skips.
- `$facet`/`$group` stages spill to disk past 100 MB (`allowDiskUse` is a
  band-aid — fix the pipeline order first).
- Read-heavy dashboards: `$merge` the aggregation into a materialized collection
  on a schedule instead of recomputing per request.
