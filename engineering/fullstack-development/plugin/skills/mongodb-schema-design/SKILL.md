---
name: mongodb-schema-design
description: >
  This skill should be used when the user asks about "MongoDB schema",
  "embed vs reference", "MongoDB data modelling", "document structure",
  "Mongoose schema", or discusses designing collections and relationships in MongoDB.
version: 1.0.0
---

## MongoDB Schema Design (MongoDB 8.0)

**Design for your queries, not for normalization.** Data that is read together
should live together in one document.

### Embed vs reference

| Embed when | Reference when |
|---|---|
| Read together ("show order with items") | Entity queried independently |
| Bounded size (order items, address) | Unbounded growth (logs, events) |
| Child meaningless without parent | Many-to-many, shared entities |

```js
// Embedded — one read serves the whole page
{
  _id: ObjectId(),
  orderNo: "ORD-1042",
  customer: { _id: ObjectId(), name: "Acme" },   // duplicated snapshot — OK
  items: [{ sku: "W-1", qty: 2, price: 9.99 }],  // bounded array
  status: "paid",
  createdAt: ISODate()
}

// Referenced — reviews grow forever, so they get their own collection
db.reviews.insertOne({ productId: order.items[0].productId, rating: 5, ... })
```

**Hard limits:** 16 MB per document; arrays beyond a few thousand elements kill
update performance — unbounded lists always become their own collection.

### Standard patterns

- **Extended reference:** store the 2-3 fields you display (`customer.name`)
  alongside the id — avoids a lookup on every list render; sync on change.
- **Bucket:** time-series readings grouped per hour/day per device
  (or use native time-series collections).
- **Computed:** store running totals/counts updated on write (`$inc`) instead of
  aggregating on every read.
- **Schema versioning:** a `schemaVersion` field lets old and new document
  shapes coexist while code migrates lazily.

### Enforce shape with validation

```js
db.createCollection("orders", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["orderNo", "status", "items"],
    properties: {
      status: { enum: ["pending", "paid", "shipped", "cancelled"] },
      items:  { bsonType: "array", minItems: 1 },
    },
  }},
});
```

(With Mongoose, the schema serves this role — keep `strict: true`.)

### Rules of thumb

- Duplicating read-mostly data is normal here; plan the update path when it changes.
- Multi-document transactions exist but signal a relational-shaped model —
  restructure so one document = one atomic unit when possible.
- `_id` is immutable — never encode mutable business data in it.
