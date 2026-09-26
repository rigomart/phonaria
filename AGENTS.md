# Repository Guidelines

## Project Structure & Module Organization
- Agents can read the README for any relevant package or app to get a fast overview before making changes.
- `apps/phonaria`: The Phonaria application, and the only one. TanStack Start on Vite, deployed to Cloudflare Workers at `phonaria.rigos.dev`. Routes live in `src/routes`, shared chrome in `src/components`, domain logic in `src/lib`, Practice in `src/practice`, and request-time Cloudflare adapters in `src/server/cloudflare`. Worker delivery is configured only in `wrangler.jsonc`. See `apps/phonaria/README.md`.
- `packages/flags`: Env-backed feature flags (`FLAG_*`) so modules can ship dark and be enabled per environment. The app supplies them as Worker `vars`.
- `packages/browser-contract`: Browser-level contract run with Playwright against a deployed target, selected by target profile.
- `packages/phonetics-data`: Source of truth for phoneme metadata including articulations, allophones, contrasts, spelling patterns, and CMU lookup utilities. See the package README for architecture details. Key API surface:
  - `PhonemeIpaMap` / `getIpaForPhonemeId()`: Core ID-to-IPA symbol map (language-agnostic)
  - Language-aware getters: `getConsonantArticulationRegistryForLanguage()`, `getLanguagePhonemeIds()`, `getLanguagePhonemeCount()`, etc.
  - `hasLanguageFeature()` / `getLanguageFeatureCapabilities()`: Feature flags per language (Spanish currently has articulations only)
  - English-specific data: `EnglishContrastsByPhonemeId`, `EnglishPhonemeAllophones`, `EnglishPhonemeSpellingPatterns`, `CmuArpaMap`
  - Subpath exports for large assets: `@phonaria/phonetics-data/data/en/curated-1k`, `curated-10k`, `cmudict-stats`
- `packages/helper-scripts`: Utilities for data generation. TypeScript scripts handle ElevenLabs audio generation and CMUDict processing; Python scripts generate curated word lists. Scripts read `.env` config and emit assets into `packages/phonetics-data/data`; generated audio is produced locally and manually uploaded to the external audio bucket the app references.
- `docs`: Product context and the project overview, accepted decisions in `adr/`, agent conventions in `agents/`, and migration records in `research/`.

## Phoneme ID System & Target Accent
- `packages/phonetics-data/src/core/ipa-map.ts` defines custom uppercase IDs that each map to exactly one IPA symbol. The map is the single source of truth regardless of language. IDs are extensible: when two languages need phonemically distinct sounds (e.g. English `E`=/ɛ/ vs Spanish `EE`=/e/), add a new ID rather than overriding an existing one.
- `TargetAccent` (`"en-us" | "es-419"`) is the accent whose sounds are being taught. It is separate from locale (UI display language). Components that render accent-specific phoneme data (charts, articulations) should accept `targetAccent` as a prop rather than deriving it implicitly.
- Per-language phoneme inventories live in `packages/phonetics-data/src/languages/inventories.ts` and bridge core IDs to language scopes. Articulation data lives in `src/languages/{lang}/articulations.ts`.

## Build, Test, and Development Commands
- `bun install`: Install workspace dependencies once per environment.
- `bun dev`: Launch the TanStack Start app at `http://localhost:3000`.
- `bun build`: Execute workspace production builds.
- `bun lint`: Run Biome check with auto-fixing (`--write`); commits should land clean.
- `bun check-types`: Run `tsc --noEmit` across packages to maintain strict type safety.
- `bun test`: Execute Vitest test suites via Turborepo; use `bun --filter @phonaria/app test` for targeted runs.
- `bun e2e`: Run the shared browser contract against a deployed base URL (default: public Cloudflare production). See `packages/browser-contract/README.md`.
- `bun e2e:baseline`: Collect page-load and transcription latency baselines.
- `bun --cwd packages/browser-contract e2e:install`: Install Chromium for the browser contract.
- `bun --cwd packages/audio-gen generate`: Regenerate ElevenLabs pronunciation audio (requires `ELEVENLABS_API_KEY` in `packages/audio-gen/.env`).
- `bun --cwd packages/helper-scripts cmudict-to-json`: Convert CMUDict plaintext to JSON format consumed by the app (configure `CMUDICT_SRC_URL` or `CMUDICT_JSON_PATH`).
- `bun --cwd packages/helper-scripts cmudict-stats`: Build CMUDict coverage statistics from the dictionary.
- `bun --cwd packages/helper-scripts generate-word-mappings`: Produce CMU ARPA mappings for example words derived from `@phonaria/phonetics-data`.
- `python3 packages/helper-scripts/generate-curated-chunks.py`: Generate curated top-1k and top-10k word lists for client-side tiered lookup (requires `pip install wordfreq`).

## Design & UX Patterns

Styling Guidelines:
- Use design system tokens consistently; avoid arbitrary values.
- Prefer Tailwind's built-in scale for sizes, spacing, and typography (e.g. `text-xs` not `text-[11px]`).
- Use semantic color tokens from shadcn (e.g. `bg-muted`, `text-foreground`, `border`).
- Avoid opacity modifiers on colors like `bg-primary/10` or `border-border/40`.
- Use full-opacity borders and backgrounds; define new tokens if variants are needed.

## Learning Experience Principles
- Toolbox over coursework: allow learners to enter through any feature and combine tools as needed.
- Approachable language: keep explanations plain to demystify IPA, minimal pairs, and articulation terms.
