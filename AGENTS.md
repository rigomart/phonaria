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
- `packages/phonetics-data`: Source of truth for phoneme metadata including articulations, allophones, contrasts, spelling patterns, and CMU lookup utilities. See the package README for architecture details. Key API surface:
  - `PhonemeIpaMap` / `getIpaForPhonemeId()`: Core ID-to-IPA symbol map (language-agnostic)
  - Language-aware getters: `getConsonantArticulationRegistryForLanguage()`, `getLanguagePhonemeIds()`, `getLanguagePhonemeCount()`, etc.
  - `hasLanguageFeature()` / `getLanguageFeatureCapabilities()`: Feature flags per language (Spanish currently has articulations only)
  - English-specific data: `EnglishContrastsByPhonemeId`, `EnglishPhonemeAllophones`, `EnglishPhonemeSpellingPatterns`, `CmuArpaMap`
  - Subpath exports for large assets: `@phonaria/phonetics-data/data/en/curated-1k`, `curated-10k`, `cmudict-stats`
- `packages/helper-scripts`: Utilities for data generation. TypeScript scripts handle ElevenLabs audio generation and CMUDict processing; Python scripts generate curated word lists. Scripts read `.env` config and emit assets into `packages/phonetics-data/data`; generated audio is produced locally and manually uploaded to the external audio bucket the app references.
- `docs`: Product briefs, project overviews, enhancement plans, and feature deep-dives organized in `enhancements/` and `features/` subdirectories.

## Internationalization & Translations (Agent Notes)
- UI text uses next-intl message catalogs in `apps/web/messages/{locale}.json` via `useTranslations(...)`.
- Typed phoneme-detail copy lives in `apps/web/src/data/phoneme-details/{locale}.ts` and is accessed with `getPhonemeDetailsCopy(locale)` (non-React) or `usePhonemeDetailsCopy()` from `apps/web/src/data/phoneme-details/client.ts` (client components).
- This split exists because phoneme copy is keyed by `@phonaria/phonetics-data` IDs/types; keeping it in TypeScript preserves type safety, prevents missing keys, and reduces drift as phoneme registries evolve.
- Translation tone: neutral, natural, and learner-first; keep labels short and functional (avoid marketing language and regionalisms).
- Terminology: use `IPA` as the primary label; `IPA (AFI)` is acceptable on first mention in explanatory copy.

## Phoneme ID System & Target Accent
- `packages/phonetics-data/src/core/ipa-map.ts` defines custom uppercase IDs that each map to exactly one IPA symbol. The map is the single source of truth regardless of language. IDs are extensible: when two languages need phonemically distinct sounds (e.g. English `E`=/ɛ/ vs Spanish `EE`=/e/), add a new ID rather than overriding an existing one.
- `TargetAccent` (`"en-us" | "es-419"`) is the accent whose sounds are being taught. It is separate from locale (UI display language). Components that render accent-specific phoneme data (charts, articulations) should accept `targetAccent` as a prop rather than deriving it implicitly.
- Per-language phoneme inventories live in `packages/phonetics-data/src/languages/inventories.ts` and bridge core IDs to language scopes. Articulation data lives in `src/languages/{lang}/articulations.ts`.

## App Routes & Organization
The web app uses Next.js App Router with internationalization:
- `app/[locale]/`: Base layout with locale-based routing (e.g. `/en`, `/es`)
  - `(overview)/`: Launchpad landing page rendered at `/{locale}`
  - `transcription/`: Grapheme-to-phoneme workspace with inspector, dialogs, and tiered lookup
  - `ipa-chart/`: Interactive IPA chart with consonants and vowels
  - `find-by-sound/`: Search words by phoneme patterns
  - `insights/`: CMUDict coverage stats and phoneme distributions
  - `credits/`: Data source acknowledgements
- Server actions in `_actions/` directories handle server-side functionality (transcription, dictionary lookup, phoneme search) with tiered client-side caching via TanStack Query
- Feature-specific code lives in prefixed directories within each route (`_components`, `_hooks`, `_lib`, `_store`, `_types`, `_schemas`, `_sections`)

## Build, Test, and Development Commands
- `bun install`: Install workspace dependencies once per environment.
- `bun dev`: Launch Turborepo dev servers with Next.js Turbopack at `http://localhost:3000`; use `bun --cwd apps/web dev` for a focused UI loop.
- `bun build`: Execute workspace builds with Turbopack before production deployment.
- `bun lint`: Run Biome check with auto-fixing (`--write`); commits should land clean.
- `bun check-types`: Run `tsc --noEmit` across packages to maintain strict type safety.
- `bun test`: Execute Vitest test suites via Turborepo; use `bun --filter @phonaria/app test` for targeted runs.
- `bun e2e`: Run Playwright E2E tests against the web app (requires `SKIP_RATE_LIMIT=true` and `DATABASE_URL`).
- `bun --cwd apps/web e2e:ui`: Open Playwright UI for interactive test debugging.
- `bun --cwd apps/web e2e:install`: Install Playwright browsers (Chromium).
- `bun --cwd packages/helper-scripts generate`: Regenerate ElevenLabs pronunciation audio (requires `ELEVENLABS_API_KEY` in `packages/helper-scripts/.env`).
- `bun --cwd packages/helper-scripts cmudict-to-json`: Convert CMUDict plaintext to JSON format consumed by the app (configure `CMUDICT_SRC_URL` or `CMUDICT_JSON_PATH`).
- `bun --cwd packages/helper-scripts cmudict-stats`: Build CMUDict coverage statistics used by the insights page.
- `bun --cwd packages/helper-scripts generate-word-mappings`: Produce CMU ARPA mappings for example words derived from `@phonaria/phonetics-data`.
- `python3 packages/helper-scripts/generate-curated-chunks.py`: Generate curated top-1k and top-10k word lists for client-side tiered lookup (requires `pip install wordfreq`).

## Technical Philosophy
### Modern Web Standards
- Performance-first, low-latency interactions using Next.js 15 with Turbopack for fast builds and HMR.
- Responsive surfaces that adapt naturally from phones to large displays.
- Audio-first experience built on React 19, Next.js App Router, Tailwind CSS v4, and shadcn/ui components.
- Internationalization via next-intl with locale-based routing.
- Data fetching and caching with TanStack Query; client state management with Zustand.
- API rate limiting via Upstash Redis; analytics via Vercel Analytics and Speed Insights.

### Key Stack
React 19 + Next.js 15 App Router, Tailwind CSS v4 + shadcn/ui (Radix), Zustand + TanStack Query, next-intl, Zod, Biome, Vitest, Turborepo + Bun.

## Coding Style & Naming Conventions
- Biome formats with tab indentation (visual width 2), 100-character line width, double quotes, and automatic import organization—accept formatter output instead of hand-tuning.
- Prefer TypeScript modules with named exports; React components export PascalCase symbols even if the file name is kebab-case.
- Use path aliases (`@/components/...`, `@/lib/...`, `@/data/...`) instead of relative dot paths for better maintainability.
- Feature-specific code should be co-located under route directories using prefixed folders: `_components` for UI, `_hooks` for logic, `_lib` for utilities, `_store` for state, `_types` for types, `_schemas` for validation, `_sections` for page sections.
- Route groups (e.g. `(overview)`) share layouts without affecting URL structure.
- AVOID using emojis in the codebase and documentation.

## Testing Guidelines
- Vitest drives `apps/web` unit tests; co-locate specs using `.test.ts` suffix (e.g. `apps/web/src/data/phoneme-details.test.ts`).
- Favor fast unit coverage on data transformations, API helpers, and utilities; integration tests should mock network boundaries.
- Test phonetics-data packages separately to ensure metadata integrity.
- E2E tests live in `apps/web/e2e/` using Playwright; they test main user flows (transcription, find-by-sound, navigation).
- E2E tests run automatically on push to main via `.github/workflows/e2e.yml`.
- Before pushing, run `bun test`, `bun lint`, and `bun check-types` to catch issues early.

## Commit & Pull Request Guidelines

### Conventional Commits (Critical for CI/CD)
This project uses Semantic Release for automated releases. Commit message format directly controls version bumps. Always use conventional commits:

```
type(scope): description

# Examples:
feat(ui): add dark mode toggle        # Minor release (0.1.0)
fix(api): resolve timeout issue       # Patch release (0.0.1)
feat!: redesign authentication        # Major release (1.0.0)
docs: update README                   # No release
chore: update dependencies            # No release
```

| Prefix | Release Impact |
|--------|----------------|
| `feat:` | Minor version bump |
| `fix:` | Patch version bump |
| `feat!:` or `fix!:` | Major version bump |
| `docs:`, `chore:`, `ci:`, `test:` | No version bump |

Choose commit types from the **user's perspective**, not implementation details. Ask: "What changed for the user?"

### Pull Request Standards
- Squash fixups locally and keep scopes aligned with the touched package (`@phonaria/app`, `helper-scripts`, etc.).
- PRs need a short summary, linked issue or task, and confirmation of `bun lint`, `bun check-types`, and `bun test`. Add UI screenshots or API samples when behavior changes.

## Environment & Configuration Tips
- Never commit secrets. Keep runtime credentials in `apps/web/.env.local` and ElevenLabs keys in `packages/helper-scripts/.env`.

## Design & UX Patterns

Core Design Philosophy: Functional Over Marketing:
- Use a clean, minimalistic design language.
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
