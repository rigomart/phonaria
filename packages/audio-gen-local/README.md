# Audio Gen Local

Scaffold for generating audio for every example word in the phonetics datasets. The package consumes a typed word manifest emitted from `packages/shared-data` and will eventually stream audio output to the web app.

## Prerequisites

- Python 3.10–3.11
- uv (Python package manager)

## Setup

```bash
cd packages/audio-gen-local

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

## Data source

- Word list: `data/phoneme-words.json`
- How it’s produced: `bun --cwd packages/helper-scripts emit-phoneme-words`  
  (reads spelling patterns, contrasts, and allophones from `shared-data`, then writes the manifest here)
- Regenerate whenever you edit phoneme metadata.

## CLI

```bash
# Print manifest meta and the full word list
uv run audio-gen
```

## Current state

- CLI (`audio-gen`) loads the manifest and prints meta + all words.
- Dependencies are minimal; dev tools (ruff, pyright) remain configured.
- Voice models and generation code have been removed to allow a fresh start.
