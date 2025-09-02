# Build Scripts

This package contains build-time scripts and utilities for the Phonix project.

## Scripts

### `build:embedded-dict`

Generates an optimized embedded dictionary for Phase 2 of the G2P enhancement. This script:

- Downloads the Google 10,000 most common English words
- Cross-references with the full CMUdict to extract pronunciations
- Includes all known homographs regardless of frequency
- Generates an optimized JSON file at `apps/web/public/data/embedded-dict.json`

**Usage:**
```bash
# From the project root
pnpm run build:embedded-dict

# Or from the web app
cd apps/web
pnpm run build:embedded-dict

# Or directly from this package
cd packages/build-scripts
pnpm run build:embedded-dict
```

**Output:**
- File: `apps/web/public/data/embedded-dict.json`
- Format: ARPABET phonemes (converted to IPA at runtime)
- Target size: ~300-500KB
- Coverage: ~7k-9k words including all homographs

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm run typecheck

# Lint code
pnpm run lint
```

## Architecture

This package follows the monorepo pattern and can be used by any app in the workspace. Scripts are designed to be run from the project root and will output files to the appropriate locations in the consuming applications.
