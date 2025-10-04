# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
pnpm install                    # Install workspace dependencies once
pnpm -C apps/web dev           # Start Next.js dev server at http://localhost:3000
pnpm dev                       # Start all packages with dev scripts (via Turborepo)
```

### Build & Quality Assurance
```bash
pnpm build                     # Build all packages for production
pnpm lint                      # Run Biome across all packages
pnpm check-types               # Run TypeScript in --noEmit mode
pnpm test                      # Execute Vitest test suites (filtered via Turborepo)
```

### Package-Specific Commands
```bash
pnpm -C apps/web build         # Build web app only
pnpm -C apps/web lint          # Lint web app only
pnpm -C apps/web test          # Test web app only
pnpm -C packages/helper-scripts generate           # Generate ElevenLabs audio
pnpm -C packages/helper-scripts cmudict-to-json    # Convert CMU dict to JSON
```

## Architecture Overview

Phonix is a monorepo built with Turborepo containing a phoneme-first ESL pronunciation application.

### Monorepo Structure
- **`apps/web`** - Next.js App Router application with learner experience and API routes
- **`packages/shared-data`** - Source of truth for phoneme metadata, articulation registries, and utilities
- **`packages/helper-scripts`** - ElevenLabs audio generation and CMUDict processing tooling
- **`docs`** - Product briefs and technical documentation

### Key Technologies
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **State Management**: Zustand, TanStack Query
- **Data**: CMU Pronouncing Dictionary, custom phoneme metadata
- **Audio**: ElevenLabs TTS integration
- **Tooling**: Biome for linting, Vitest for testing, Turborepo for monorepo management

### Core Application Features
The web app provides three main learning experiences:
1. **IPA Chart (`/ipa-chart`)** - Interactive phoneme exploration with audio examples
2. **Grapheme-to-Phoneme (`/g2p`)** - Text transcription with phoneme highlighting
3. **Minimal Pairs (`/minimal-pairs`)** - Pronunciation practice with similar-sounding words

### Data Architecture
- **Phoneme metadata** centralized in `packages/shared-data/src/` with typed definitions
- **CMU Pronouncing Dictionary** bundled as JSON at `apps/web/data/cmudict.json`
- **Audio assets** stored in `apps/web/public/audio/examples/`
- **Shared types and utilities** exported from `packages/shared-data` for reuse across packages

### API Routes
Next.js API routes handle:
- Dictionary lookups with phoneme transcriptions
- G2P transcription services
- Audio file serving

## Development Guidelines

### Code Style (from Cursor rules)
- Use **camelCase** for variables/functions, **PascalCase** for components/types, **kebab-case** for files
- Prefer **named exports** over default exports
- Use **colocated file structure** - keep files close to usage
- Prefer **types** over interfaces, **type unions** over extending interfaces
- **AVOID `any`** type usage
- No inline comments unless complexity requires it
- No JSDoc comments except for complex functions/components

### Package Management
- Use **pnpm** as package manager (version 10.15.1)
- Add dependencies via `pnpm add <dependency>` (never edit package.json directly)
- Workspace dependencies use `workspace:*` protocol

### Testing & Quality
- All commits must pass linting, type checking, and relevant tests
- Use Vitest for unit testing
- TypeScript `--noEmit` mode for type validation

### Post-Task Quality Checks
After completing any coding task, run the following commands to ensure code quality:
```bash
# Run linting with auto-fix (Biome will automatically fix fixable issues)
pnpm lint

# Run type checking to catch TypeScript errors
pnpm check-types

# Run tests if applicable
pnpm test
```

**IMPORTANT**: Always run `pnpm lint` and `pnpm check-types` before considering a task complete. This catches formatting issues, linting violations, and type errors early. The lint command includes auto-fix functionality, so it will resolve many issues automatically.

### Data Generation
When updating phoneme data or audio:
1. Update source data in `packages/shared-data`
2. Regenerate CMU dict: `CMUDICT_SRC_URL="<url>" pnpm -C packages/helper-scripts cmudict-to-json`
3. Generate audio: `pnpm -C packages/helper-scripts generate` (requires `ELEVENLABS_API_KEY`)
4. Generated assets are committed for deterministic deployments