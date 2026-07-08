---
name: python-tooling
description: >
  This skill should be used when the user asks about "uv", "ruff", "Python
  dependency management", "pyproject.toml", "virtualenv", "mypy setup",
  or discusses Python project setup, linting, formatting, or packaging.
version: 1.0.0
---

## Python Tooling (uv + ruff)

`uv` replaces pip/pip-tools/virtualenv/pyenv (10-100x faster); `ruff` replaces
flake8/isort/black in one tool. This is the current-standard fast setup.

### Project lifecycle with uv

```bash
uv init myservice && cd myservice     # scaffolds pyproject.toml
uv add fastapi uvicorn                # add deps (updates lockfile)
uv add --dev pytest ruff mypy
uv sync                               # reproduce env from uv.lock
uv run pytest                         # run inside the managed venv
uv python install 3.13                # manage interpreter versions too
```

Commit `uv.lock`. CI uses `uv sync --frozen` for exact reproducible installs.

### One config file — pyproject.toml

```toml
[project]
name = "myservice"
requires-python = ">=3.12"
dependencies = ["fastapi", "uvicorn"]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM"]   # errors, imports, bugbear, upgrades

[tool.mypy]
strict = true
```

### Daily commands

```bash
uv run ruff check --fix .    # lint + autofix (incl. import sorting)
uv run ruff format .         # format (black-compatible)
uv run mypy src              # type check
```

### CI gate (GitHub Actions)

```yaml
- uses: astral-sh/setup-uv@v5
- run: uv sync --frozen
- run: uv run ruff check . && uv run ruff format --check .
- run: uv run mypy src
- run: uv run pytest
```

### Rules of thumb

- Never `pip install` into the system Python; every project gets its own env.
- Pre-commit hook with ruff keeps diffs clean and reviews about logic, not style.
- Publish internal libs with `uv build` + a private index; pin apps, range libs.
