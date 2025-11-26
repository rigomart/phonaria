# Audio Generation

Base scaffold for future audio generation work. Currently only a placeholder CLI is wired up.

## Prerequisites

- Python 3.10–3.11
- uv (Python package manager)

## Setup

```bash
cd packages/audio-generation

# Install dependencies
uv sync

```

## Development

```bash
# Format code
uv run ruff format src

# Lint code
uv run ruff check src

# Lint and auto-fix
uv run ruff check --fix src

# Type check
uv run pyright src
```

## Current state

- The CLI (`audio-gen`) only prints a placeholder message.
- Dependencies are empty; dev tools (ruff, pyright) remain configured.
- Voice models and generation code have been removed to allow a fresh start.
