---
name: python-modern-features
description: >
  This skill should be used when the user asks about "Python type hints",
  "dataclasses", "pattern matching", "f-strings", "pathlib", "walrus operator",
  or discusses modern Python 3.12+ syntax and idioms.
version: 1.0.0
---

## Modern Python (3.12+)

### Type hints — new generic syntax

```python
# 3.12+ generic syntax — no TypeVar boilerplate
def first[T](items: list[T]) -> T | None:
    return items[0] if items else None

type UserId = int                      # type alias statement
def get_user(user_id: UserId) -> "User | None": ...
```

Run `mypy --strict` (or pyright) in CI — hints without a checker are comments.

### Dataclasses for data, not dicts

```python
from dataclasses import dataclass, field

@dataclass(slots=True, frozen=True)     # slots: less memory; frozen: hashable/immutable
class Product:
    name: str
    price: float
    tags: list[str] = field(default_factory=list)   # NEVER mutable defaults directly
```

For validation at boundaries (APIs, config) use pydantic models instead —
dataclasses don't validate.

### Structural pattern matching

```python
match event:
    case {"type": "order.created", "order": {"id": int(order_id)}}:
        process_order(order_id)
    case {"type": "order.cancelled", **rest}:
        cancel(rest)
    case _:
        logger.warning("unhandled event %s", event.get("type"))
```

### Everyday idioms

```python
from pathlib import Path

config = Path("config") / "app.toml"           # pathlib over os.path
text = config.read_text(encoding="utf-8")

if (n := len(items)) > 100:                    # walrus: bind + test
    logger.info(f"processing {n} items")       # f-strings always

with open(src) as f, open(dst, "w") as out:    # context managers for resources
    out.write(f.read())

squares = {x: x * x for x in range(10)}        # comprehensions over map/filter
```

### Rules of thumb

- `enumerate`/`zip` instead of `range(len(...))`; unpacking over indexing.
- Exceptions for errors, not return codes; catch **specific** exceptions.
- `logging` module, never `print`, in library/service code.
- Python 3.13 is the current maintained baseline — pin `requires-python = ">=3.12"`.
