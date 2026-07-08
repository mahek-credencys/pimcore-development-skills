---
name: python-testing-pytest
description: >
  This skill should be used when the user asks about "pytest", "fixtures",
  "parametrize", "monkeypatch", "mock in Python tests", or discusses Python
  unit testing, test organization, or coverage.
version: 1.0.0
---

## Python Testing (pytest)

### Fixtures + parametrize do most of the work

```python
import pytest
from myapp.services import PriceCalculator

@pytest.fixture
def calculator() -> PriceCalculator:
    return PriceCalculator(tax_rate=0.2)

@pytest.mark.parametrize(
    ("net", "expected"),
    [(100.0, 120.0), (0.0, 0.0), (19.99, 23.99)],
)
def test_gross_price(calculator: PriceCalculator, net: float, expected: float):
    assert calculator.gross(net) == pytest.approx(expected)

def test_negative_price_rejected(calculator: PriceCalculator):
    with pytest.raises(ValueError, match="negative"):
        calculator.gross(-1)
```

### Mock at the boundary you own

```python
def test_fetch_retries_on_timeout(mocker):        # pytest-mock
    api = mocker.patch("myapp.services.payment.gateway_client")
    api.charge.side_effect = [TimeoutError, {"status": "ok"}]

    result = PaymentService().charge(order)

    assert result.status == "ok"
    assert api.charge.call_count == 2

def test_reads_api_key_from_env(monkeypatch):
    monkeypatch.setenv("API_KEY", "test-key")
    assert load_config().api_key == "test-key"
```

Patch where the name is **used** (`myapp.services.payment.gateway_client`), not
where it's defined — the most common mocking mistake.

### Project config

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-q --strict-markers --cov=myapp --cov-report=term-missing"
```

### Rules of thumb

- Fixture scopes: `function` default; `session` for expensive resources (DB container).
- `conftest.py` shares fixtures per directory — no imports needed.
- Async code: `pytest-asyncio` with `asyncio_mode = "auto"`.
- Integration tests against a real DB via Testcontainers beat mocked cursors.
- Freeze time with `freezegun`/`time-machine` — never `sleep()` in tests.
