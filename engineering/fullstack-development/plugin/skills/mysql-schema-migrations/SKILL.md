---
name: mysql-schema-migrations
description: >
  This skill should be used when the user asks about "MySQL schema design",
  "choose column types", "foreign keys", "database migration", "ALTER TABLE
  on a large table", or discusses relational data modelling and safe schema changes.
version: 1.0.0
---

## MySQL Schema Design & Migrations

### Column type discipline

```sql
CREATE TABLE orders (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id   BIGINT UNSIGNED NOT NULL,
    status        ENUM('pending','paid','shipped','cancelled') NOT NULL DEFAULT 'pending',
    total         DECIMAL(10,2) NOT NULL,            -- money is NEVER FLOAT/DOUBLE
    meta          JSON NULL,                          -- sparse attrs; index via generated cols
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

- `utf8mb4` always (`utf8` is a broken 3-byte legacy alias).
- `VARCHAR` sized honestly (`email VARCHAR(255)`, `country CHAR(2)`).
- `NOT NULL` by default; NULL only when "unknown" is a real business state.
- Every table gets `created_at`/`updated_at`.

### Normalize first, denormalize with evidence

3NF until a measured read-path problem says otherwise; then denormalize
deliberately (counter columns, summary tables) and document the write path
that keeps them consistent.

### Migrations — forward-only and reversible in shape

Every schema change is a versioned migration file in git (Doctrine Migrations,
Flyway, Prisma/Knex migrations — same rules):

- One logical change per migration; never edit an applied migration.
- Expand → migrate → contract for zero downtime:
  1. **Expand:** add the new nullable column/table (safe, online).
  2. **Migrate:** backfill in batches; dual-write from the app.
  3. **Contract:** switch reads, drop the old column in a later release.
- Batched backfills (`LIMIT 1000` loops) — a single giant `UPDATE` locks the table.

### Large-table ALTERs

MySQL 8.4: most `ADD COLUMN` are `ALGORITHM=INSTANT`. For the rest use
`gh-ost` or `pt-online-schema-change` instead of locking a hot table.

### Rules of thumb

- Foreign keys ON — data integrity in the DB, not just the ORM.
- Charset/collation set at table creation; converting later rebuilds the table.
- Test migrations against a production-sized copy before release day.
