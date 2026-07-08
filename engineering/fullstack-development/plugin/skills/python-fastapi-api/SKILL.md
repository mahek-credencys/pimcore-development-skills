---
name: python-fastapi-api
description: >
  This skill should be used when the user asks to "build an API in Python",
  "FastAPI endpoint", "pydantic model", "dependency injection FastAPI",
  or discusses Python REST services, async endpoints, or OpenAPI generation.
version: 1.0.0
---

## Python API Development (FastAPI + Pydantic v2)

FastAPI generates validation, serialization, and OpenAPI docs from type hints.

```python
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI()

class ProductIn(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)

class ProductOut(ProductIn):
    id: int

def get_repo() -> ProductRepository:          # dependency — overridable in tests
    return ProductRepository(get_session())

@app.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(body: ProductIn, repo: ProductRepository = Depends(get_repo)):
    return await repo.create(body)

@app.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, repo: ProductRepository = Depends(get_repo)):
    product = await repo.find(product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
```

### Separate input / output / DB models

`ProductIn` (client payload), `ProductOut` (response shape), ORM entity — never
expose the DB model directly; it leaks columns and couples API to schema.

### Async rules

- `async def` endpoints must use async libraries (`asyncpg`, `httpx`, SQLAlchemy
  async) — one blocking call stalls the whole event loop.
- Sync-only dependency? Use a plain `def` endpoint — FastAPI runs it in a
  threadpool automatically.

### Testing

```python
from fastapi.testclient import TestClient

def test_create_product():
    app.dependency_overrides[get_repo] = lambda: FakeRepo()
    client = TestClient(app)
    r = client.post("/products", json={"name": "Widget", "price": 9.99})
    assert r.status_code == 201
    assert r.json()["name"] == "Widget"
```

### Rules of thumb

- Settings via `pydantic-settings` (`BaseSettings`) — validated env config at boot.
- Version the API path (`/api/v1`) from day one.
- Run with `uvicorn` behind a process manager; `--workers` = CPU cores for sync-heavy apps.
