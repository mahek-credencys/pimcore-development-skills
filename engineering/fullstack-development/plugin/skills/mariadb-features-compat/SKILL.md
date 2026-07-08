---
name: mariadb-features-compat
description: >
  This skill should be used when the user asks about "MariaDB vs MySQL",
  "system-versioned tables", "MariaDB sequences", "migrate MySQL to MariaDB",
  or discusses MariaDB-specific features or compatibility concerns.
version: 1.0.0
---

## MariaDB Features & MySQL Compatibility (MariaDB 11.8 / 12.3 LTS)

MariaDB is drop-in compatible for standard SQL/InnoDB workloads, but the forks
have diverged — treat them as different databases when using advanced features.

### System-versioned tables — audit history for free

```sql
CREATE TABLE products (
    id    BIGINT UNSIGNED PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL
) WITH SYSTEM VERSIONING;

-- Point-in-time queries — no trigger-based audit tables needed
SELECT * FROM products FOR SYSTEM_TIME AS OF '2026-06-01 00:00:00';
SELECT * FROM products FOR SYSTEM_TIME ALL WHERE id = 42;   -- full change history
```

### Sequences (standard SQL, shareable across tables)

```sql
CREATE SEQUENCE order_seq START WITH 1000 INCREMENT BY 1;
INSERT INTO orders (id, ...) VALUES (NEXT VALUE FOR order_seq, ...);
```

### Other MariaDB-only conveniences

- `INSERT ... RETURNING` / `DELETE ... RETURNING` — fetch affected rows without
  a second query.
- `UUID` native column type (11.7+) — compact 16-byte storage, index-friendly.
- Storage engines: ColumnStore (analytics), Spider (sharding), S3 (archive).

### Divergences that bite in migrations

| Area | MySQL 8.4 | MariaDB 11+ |
|---|---|---|
| JSON | Native binary `JSON` type | `JSON` is an alias for `LONGTEXT` + validation |
| Auth default | `caching_sha2_password` | `mysql_native_password` / `ed25519` |
| GTID replication | Incompatible formats — can't mix in one topology | |
| `EXPLAIN ANALYZE` | Yes | Use `ANALYZE FORMAT=JSON` |

### Rules of thumb

- Pick one fork per product and pin CI to the same major version as production.
- Cross-fork migration: dump with `mysqldump --compatible` style plain SQL,
  avoid fork-specific DDL, and re-test every `JSON_*` function call.
- Version support: MariaDB LTS lines (11.8, 12.3) get 3+ years — plan upgrades
  by LTS, skip rolling releases in production.
