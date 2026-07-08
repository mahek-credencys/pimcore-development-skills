---
name: mysql-query-optimization
description: >
  This skill should be used when the user asks about "slow MySQL query",
  "EXPLAIN plan", "add an index", "full table scan", "covering index",
  "N+1 queries", or discusses MySQL/MariaDB query performance tuning.
version: 1.0.0
---

## MySQL Query Optimization (MySQL 8.4 / MariaDB 11+)

### Always start with EXPLAIN

```sql
EXPLAIN ANALYZE
SELECT o.id, o.total, c.name
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'paid' AND o.created_at >= '2026-01-01';
```

Red flags in the plan: `type: ALL` (full scan), `Using filesort`,
`Using temporary`, huge `rows` estimates vs actual.

### Index design rules

```sql
-- Composite index: equality columns first, then range, then order-by
CREATE INDEX idx_orders_status_created ON orders (status, created_at);

-- Covering index: query answered entirely from the index (Using index)
CREATE INDEX idx_orders_cover ON orders (status, created_at, total);
```

- Leftmost-prefix rule: `(a, b, c)` serves `a`, `a,b`, `a,b,c` — not `b` alone.
- An index on a column wrapped in a function is unusable —
  `WHERE DATE(created_at) = ...` scans; use a range
  (`created_at >= ? AND created_at < ?`) or a generated column + index.
- Low-cardinality columns (status flags) rarely deserve their own index —
  put them first in a composite instead.

### Kill the classic offenders

```sql
-- N+1: one query per row → one JOIN / IN query
SELECT * FROM order_items WHERE order_id IN (/* batch of ids */);

-- Deep OFFSET pagination scans everything it skips → keyset pagination
SELECT * FROM orders WHERE id > :last_seen_id ORDER BY id LIMIT 50;

-- SELECT * drags unused columns (and defeats covering indexes) — name columns
```

### Finding slow queries

```sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.5;
-- then: sys.statements_with_full_table_scans / performance_schema digests
```

### Rules of thumb

- One transaction per unit of work; keep them short — long transactions block
  purge and bloat undo.
- `innodb_buffer_pool_size` ≈ 70% of RAM on a dedicated DB host.
- Verify an index is used after adding it — dead indexes slow every write.
