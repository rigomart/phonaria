# Repository Guidelines

## Project Context
Phonaria is a learner-first pronunciation toolkit for ESL learners. It combines interactive IPA references, instant grapheme-to-phoneme transcription, dictionary lookups, and sound contrast practice inside a responsive, audio-first Next.js app that keeps IPA approachable.

## Learner Challenges
- English spelling unpredictability: learners encounter many words whose pronunciation cannot be inferred from spelling alone.
- Limited approachable references: traditional IPA resources feel academic, static, or scattered across multiple sites.
- Fragmented tooling: transcription, dictionary lookup, and contrast practice typically live in separate apps that force context switching.

## Core Toolkit
### Grapheme-to-Phoneme Studio
- Instant transcription with stress markers for any pasted sentence or passage.
- Clickable phoneme insights covering articulation detail, example words, and comparison notes.
- Dictionary bridge to jump from a word in the transcript to concise definitions and usage notes.

### IPA Reference Hub
- Interactive General American IPA chart optimized for responsive layouts.
- Articulation guidance that couples production notes, diagrams, and accessible descriptions.
- Word-level example library with audio so learners can hear each sound in context.

### Phoneme Contrasts & Minimal Pairs
- Integrated contrast information within phoneme detail dialogs to highlight frequently confused sounds.
- Minimal pair examples embedded in articulation guidance for direct comparison.
- Contrast preview available in the overview page to guide learners toward common confusion areas.

### Dictionary Lookup
- In-context definitions available without leaving the workspace.
- Pronunciation confirmation by cross-checking dictionary audio with transcription output.
- Clear empty, retry, and error states tuned for quick iteration.

## Project Structure & Module Organization
- Agents can read the README for any relevant package or app to get a fast overview before making changes.
- `apps/web`: Next.js 15 App Router project with internationalization via `[locale]` dynamic routes. Feature-specific code uses route groups (e.g. `(overview)`) and prefixed directories (`_components`, `_hooks`, `_lib`, `_store`, `_types`, `_schemas`, `_sections`) to co-locate related code. UI primitives live in `src/components`, shared utilities in `src/lib`, and feature data wiring in `src/data`.
- `packages/shared-data`: Source of truth for phoneme metadata including articulations, allophones, contrasts, spelling patterns, and CMU lookup utilities. All types and registries are exported from `src/index.ts`. Key exports include:
  - `cmudictData` and `cmudictStatsData`: Bundled CMUDict JSON and coverage stats used by the API and insights page
  - `PhonemeSymbolRegistry`: Complete phoneme catalog with IPA symbols, categories, and metadata
  - `PhonemeArticulationRegistry`: Articulatory features and production guidance for each phoneme
  - `ContrastsByPhonemeIdRegistry`: Minimal pairs and contrast information
  - `PhonemeSpellingPatternRegistry`: Common spelling patterns for each phoneme
  - `PhonemeAllophoneRegistry`: Allophonic variations with context keys
  - `CmuSymbolRegistry`: Mapping between CMU ARPABET and IPA symbols
- `packages/helper-scripts`: TypeScript utilities for ElevenLabs audio generation and CMUDict JSON/stat generation. Scripts read `.env` config and emit assets into `packages/shared-data/data`; generated audio is produced locally and manually uploaded to the external audio bucket the app references.
- `docs`: Product briefs, project overviews, enhancement plans, and feature deep-dives organized in `enhancements/` and `features/` subdirectories.

## App Routes & Organization
The web app uses Next.js App Router with internationalization:
- `app/[locale]/`: Base layout with locale-based routing (e.g. `/en`, `/es`)
  - `(overview)/`: Launchpad landing page rendered at `/{locale}`
  - `transcription/`: Grapheme-to-phoneme workspace with inspector and dialogs
  - `ipa-chart/`: Interactive IPA chart with consonants and vowels
  - `insights/`: CMUDict coverage stats and phoneme distributions
  - `credits/`: Data source acknowledgements
- `app/api/`: API routes for server-side functionality
  - `g2p/`: Grapheme-to-phoneme transcription endpoint
  - `dictionary/`: Dictionary lookup with rate limiting
- Feature-specific code lives in prefixed directories within each route (`_components`, `_hooks`, `_lib`, `_store`, `_types`, `_schemas`, `_sections`)

## Build, Test, and Development Commands
- `bun install`: Install workspace dependencies once per environment.
- `bun dev`: Launch Turborepo dev servers with Next.js Turbopack at `http://localhost:3000`; use `bun --cwd apps/web dev` for a focused UI loop.
- `bun build`: Execute workspace builds with Turbopack before production deployment.
- `bun lint`: Run Biome check with auto-fixing (`--write`); commits should land clean.
- `bun check-types`: Run `tsc --noEmit` across packages to maintain strict type safety.
- `bun test`: Execute Vitest test suites via Turborepo; use `bun --filter web test` for targeted runs.
- `bun --cwd packages/helper-scripts generate`: Regenerate ElevenLabs pronunciation audio (requires `ELEVENLABS_API_KEY` in `packages/helper-scripts/.env`).
- `bun --cwd packages/helper-scripts cmudict-to-json`: Convert CMUDict plaintext to JSON format consumed by the app (configure `CMUDICT_SRC_URL` or `CMUDICT_JSON_PATH`).
- `bun --cwd packages/helper-scripts cmudict-stats`: Build CMUDict coverage statistics used by the insights page.
- `bun --cwd packages/helper-scripts generate-word-mappings`: Produce CMU ARPA mappings for example words derived from shared-data.

## Technical Philosophy
### Modern Web Standards
- Performance-first, low-latency interactions using Next.js 15 with Turbopack for fast builds and HMR.
- Responsive surfaces that adapt naturally from phones to large displays.
- Audio-first experience built on React 19, Next.js App Router, Tailwind CSS v4, and shadcn/ui components.
- Internationalization via next-international with locale-based routing.
- Data fetching and caching with TanStack Query; client state management with Zustand.
- API rate limiting via Upstash Redis; analytics via Vercel Analytics and Speed Insights.

### Key Dependencies
- **UI Framework**: React 19.1.0 with Next.js 15.5.5 App Router
- **Styling**: Tailwind CSS v4 with shadcn/ui components built on Radix UI primitives
- **State Management**: Zustand for client state, TanStack Query for server state
- **Data Validation**: Zod schemas for runtime type safety
- **Internationalization**: next-international for locale-based routing and content
- **Developer Tools**: Biome for linting/formatting, TypeScript 5 for type checking, Vitest for testing
- **Build Tools**: Turborepo for monorepo orchestration, Bun for package management and runtime

### Development Standards
- Monorepo architecture (Bun workspaces + Turborepo) keeps shared data, helper scripts, and the web app aligned.
- Strict TypeScript adoption across all packages to maintain end-to-end type safety.
- Composable UI patterns with Radix UI primitives and data-driven layouts to prevent duplication.
- Co-located feature code using route groups and prefixed directories (`_components`, `_hooks`, `_lib`, `_store`).

## Coding Style & Naming Conventions
- Biome formats with tab indentation (visual width 2), 100-character line width, double quotes, and automatic import organization—accept formatter output instead of hand-tuning.
- Prefer TypeScript modules with named exports; React components export PascalCase symbols even if the file name is kebab-case.
- Use path aliases (`@/components/...`, `@/lib/...`, `@/data/...`) instead of relative dot paths for better maintainability.
- Feature-specific code should be co-located under route directories using prefixed folders: `_components` for UI, `_hooks` for logic, `_lib` for utilities, `_store` for state, `_types` for types, `_schemas` for validation, `_sections` for page sections.
- Route groups (e.g. `(overview)`) share layouts without affecting URL structure.

## Testing Guidelines
- Vitest drives `apps/web` tests; co-locate specs using `.test.ts` suffix (e.g. `apps/web/src/data/phoneme-details.test.ts`).
- Favor fast unit coverage on data transformations, API helpers, and utilities; integration tests should mock network boundaries.
- Test shared-data packages separately to ensure metadata integrity.
- Before pushing, run `bun test`, `bun lint`, and `bun check-types` to catch issues early.

## Commit & Pull Request Guidelines
- Follow the Conventional Commit style: `type(scope): summary` (e.g. `feat(api): add g2p fallback`).
- Squash fixups locally and keep scopes aligned with the touched package (`web`, `helper-scripts`, etc.).
- PRs need a short summary, linked issue or task, and confirmation of `bun lint`, `bun check-types`, and `bun test`. Add UI screenshots or API samples when behavior changes.

## Environment & Configuration Tips
- Never commit secrets. Keep runtime credentials in `apps/web/.env.local` and ElevenLabs keys in `packages/helper-scripts/.env`.
- Required environment variables for `apps/web`:
  - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for API rate limiting
  - `CMUDICT_SRC_URL` (optional) for CMUDict source location during builds
- When updating CMUDict assets, use the helper scripts (`cmudict-to-json`, `cmudict-stats`) and commit JSON outputs under `packages/shared-data/data/dict` so deployments stay deterministic.
- Generated audio files from `packages/helper-scripts generate` are produced locally and manually uploaded to the external audio bucket (alongside any externally sourced audio files) that the app references.

## Design & UX Patterns

Core Design Philosophy: Functional Over Marketing:
- Avoid hero sections, gradients, and marketing copy in favor of functional design
- Explain what tools do, not what benefits they provide

Progressive Disclosure:
- Show examples and guidance only when needed
- Reduce cognitive load. Single source of truth for each functionality

Styling Guidelines:
- Use design system tokens consistently; avoid arbitrary values.
- Prefer Tailwind's built-in scale for sizes, spacing, and typography (e.g. `text-xs` not `text-[11px]`).
- Use semantic color tokens from shadcn (e.g. `bg-muted`, `text-foreground`, `border`).
- Avoid opacity modifiers on colors like `bg-primary/10` or `border-border/40`.
- Use full-opacity borders and backgrounds; define new tokens if variants are needed.

## Learning Experience Principles
- Toolbox over coursework: allow learners to enter through any feature and combine tools as needed.
- Approachable language: keep explanations plain to demystify IPA, minimal pairs, and articulation terms.
- Progressive disclosure: surface guidance when needed and recede as users explore.
