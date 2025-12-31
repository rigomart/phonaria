# Phonaria – Web Application

This package hosts the primary Phonaria experience: a Next.js App Router project that delivers interactive IPA references, grapheme‑to‑phoneme transcription, in‑context dictionary lookups, and phoneme/example audio in a single learner‑first workspace.

## At a glance

 - App Router + locale‑based routing under `app/[locale]` (e.g. `/en`, `/es`)
 - Core routes: `/{locale}` overview, `/{locale}/transcription`, `/{locale}/ipa-chart`, `/{locale}/insights`, `/{locale}/credits`
 - API routes powered by oRPC for type-safe client–server contracts:
   - `POST /api/g2p` (G2P transcription)
   - `GET /api/dictionary` (lookup + audio)
   - `GET /api/phoneme-search` (phoneme-based word search)

## Feature overview

 - **Transcription workspace** – Stress-marked IPA output with clickable words for dictionary definitions and a phoneme inspector to surface articulation details.
 - **Interactive IPA chart** – Browse consonants, monophthongs (including r-colored vowels), and diphthongs with minimal pairs, spelling patterns, allophones, and example audio.
 - **Phoneme search** – Find words by phoneme pattern (e.g., search for words containing /θ/ or specific sound sequences) with `GET /api/phoneme-search`.
 - **Insights page** – CMUDict coverage cards, phoneme frequency charts, and syllable histograms powered by the shared CMUDict stats dataset.
 - **Dictionary integration** – `GET /api/dictionary` proxies Free Dictionary responses with Upstash Redis rate limiting; transcribed words link straight to definitions and audio.
 - **Themeable & responsive UI** – Tailwind CSS v4, shadcn/ui primitives, and next-themes provide a consistent light/dark experience across devices.
 - **Internationalization** – Locale-based routing via next-intl with support for multiple languages.
 - **Type-safe API client** – oRPC with TanStack Query integration ensures type safety across client and server boundaries without manually maintaining type definitions.

## Tech stack

 - **Framework** – Next.js 16.0.10 (App Router, Turbopack for dev and builds)
 - **UI Library** – React 19.2.3 with TypeScript 5
 - **Language** – TypeScript with strict settings and path aliases (`@/components`, `@/lib`, `@/data`)
 - **Styling** – Tailwind CSS v4, shadcn/ui components, Radix UI primitives, CSS variables in `src/app/[locale]/globals.css`
 - **State Management** – TanStack Query v5 (server state and caching), Zustand (client state stores)
 - **Internationalization** – next-intl with locale-based routing and JSON message catalogs
 - **API Framework** – oRPC with Next.js API routes for type-safe client–server communication
 - **Data Validation** – Zod schemas for API request/response validation and type safety
 - **Database** – Drizzle ORM with Neon PostgreSQL for persisted data
 - **Rate Limiting** – Upstash Redis for API endpoint protection
- **Analytics** – Vercel Analytics and Speed Insights
- **Testing** – Vitest with utility-first unit coverage for API services, hooks, and data transformations
- **Linting & Formatting** – Biome (tab indentation, 100-char line width, auto-import organization)

## Running locally

```bash
bun install             # once per workspace
bun --cwd apps/web dev     # start Next.js at http://localhost:3000
```

The root `bun dev` will also start this project if you prefer Turborepo orchestration.

 ### Useful scripts

 ```bash
 bun --cwd apps/web lint            # biome check --write
 bun --cwd apps/web check-types     # tsc --noEmit
 bun --cwd apps/web test            # vitest run
 bun --cwd apps/web build           # next build --turbopack
 bun --cwd apps/web start           # next start (after build)
 bun --cwd apps/web db:push         # drizzle-kit push (database schema)
 bun --cwd apps/web db:generate     # drizzle-kit generate (migrations)
 bun --cwd apps/web db:migrate      # drizzle-kit migrate (run migrations)
 bun --cwd apps/web db:seed         # seed the database
 ```

## Directory structure

The tree below is illustrative; prefixed folders (`_components`, `_hooks`, `_lib`, etc.) co‑locate feature code with routes without becoming URL segments.

```
apps/web
├── messages/             # next-intl message catalogs (e.g., en.json, es.json)
├── public/               # Static assets (SVG icons, optional audio)
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── [locale]/     # Locale-based routing (e.g., /en, /es)
│   │   │   ├── (overview)/       # Launchpad rendered at /{locale}
│   │   │   ├── transcription/    # G2P workspace with phoneme inspector + dialogs
│   │   │   │   ├── _components/
│   │   │   │   ├── _hooks/
│   │   │   │   ├── _lib/
│   │   │   │   ├── _schemas/
│   │   │   │   ├── _store/
│   │   │   │   ├── _types/
│   │   │   │   └── page.tsx
│   │   │   ├── ipa-chart/        # IPA chart with phoneme detail dialogs
│   │   │   │   ├── _components/
│   │   │   │   ├── _lib/
│   │   │   │   ├── _sections/
│   │   │   │   ├── _store/
│   │   │   │   └── page.tsx
│   │   │   ├── insights/         # CMUDict stats and coverage visualizations
│   │   │   │   ├── _components/
│   │   │   │   └── page.tsx
│   │   │   ├── credits/          # Data source acknowledgements
│   │   │   ├── _hooks/           # Shared locale-level hooks
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── providers.tsx
 │   │   ├── api/                 # oRPC API endpoints
 │   │   │   ├── [[...rest]]/     # Catch-all route for oRPC handler
 │   │   │   │   └── route.ts     # RPCHandler with GET/POST exports
 │   │   │   ├── router.ts        # Router definition combining all procedures
 │   │   │   ├── _shared/         # Shared API utilities and middleware
 │   │   │   │   ├── base.ts      # Base procedure with shared context
 │   │   │   │   └── middleware/  # Rate limiting, auth, etc.
 │   │   │   ├── dictionary/      # Dictionary lookup with rate limiting
 │   │   │   │   ├── procedure.ts # oRPC procedure definition
 │   │   │   │   ├── service.ts   # Dictionary API service
 │   │   │   │   └── model.ts     # Zod schemas and types
 │   │   │   ├── g2p/             # Grapheme-to-phoneme transcription
 │   │   │   │   ├── procedure.ts # oRPC procedure definition
 │   │   │   │   ├── service.ts   # G2P processing logic
 │   │   │   │   ├── model.ts     # Zod schemas and types
 │   │   │   │   ├── syllabifier.ts
 │   │   │   │   ├── cmudict.ts
 │   │   │   │   ├── text-processing.ts
 │   │   │   │   ├── phonotactics.ts
 │   │   │   │   └── phoneme-generator.ts
 │   │   │   └── phoneme-search/  # Phoneme-based word search
 │   │   │       ├── procedure.ts # oRPC procedure definition
 │   │   │       ├── service.ts   # Search service
 │   │   │       ├── model.ts     # Zod schemas and types
 │   │   │       └── phoneme-utils.ts
│   │   └── favicon.ico
│   ├── components/        # Shared UI components
│   │   ├── phoneme-details/  # Phoneme dialog components
│   │   ├── ui/            # shadcn/ui components (Radix UI based)
│   │   ├── audio-controls.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-switcher.tsx
│   ├── data/              # Bundled data wiring for the app
│   │   └── phoneme-details/ # Locale-aware phoneme copy + typed definitions
│   ├── hooks/             # Shared React hooks
│   │   ├── use-audio-manager/
│   │   └── use-media-query.ts
│   ├── i18n/              # next-intl routing, navigation, and request config
│   ├── lib/               # Shared utilities
│   │   ├── orpc/          # oRPC client configuration and types
│   │   │   ├── client.ts  # oRPC client instance
│   │   │   ├── server.ts  # Server-side oRPC client
│   │   │   ├── types.ts   # Inferred types from router (use these!)
│   │   │   └── index.ts   # TanStack Query utils and exports
│   │   ├── utils.ts       # General helper functions
│   │   └── vowel-chart-geometry.ts
├── next.config.ts         # Next.js configuration (CSP headers, etc.)
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Vitest test runner configuration
```

### Directory naming conventions

- **Prefixed directories** (`_components`, `_hooks`, `_lib`, etc.) – Feature-specific code co-located with routes; not exposed as routes by Next.js
- **Route groups** (`(overview)`) – Share layouts without affecting URL structure
- **Locale routes** (`[locale]`) – Dynamic routing for internationalization support

## API type patterns

Use oRPC type inference instead of importing from API model files:

```ts
// Good: Import from @/lib/orpc
import { orpc, type G2PResponse, type WordDefinition } from "@/lib/orpc";

// Bad: Don't import from API model files
import type { G2PResponse } from "@/app/api/g2p/model";
```

Types in `src/lib/orpc/types.ts` are inferred from the router using `InferClientOutputs` and `InferClientInputs`.

## Data dependencies

- **CMU Pronouncing Dictionary** – Shipped via `@phonaria/phonetics-data` at `packages/phonetics-data/data/dict/cmudict.json`; the companion `cmudict-stats.json` feeds the insights page. Regenerate with:
  ```bash
  CMUDICT_SRC_URL="<remote .dict file>" bun --cwd packages/helper-scripts cmudict-to-json
  bun --cwd packages/helper-scripts cmudict-stats
  ```
- **Phoneme metadata** – Canonical IDs and structures live in `packages/phonetics-data`; learner-facing copy is layered on in `src/data/phoneme-details/`, including:
  - Phoneme symbols, categories, and IPA representations
  - Articulatory features and production guidance
  - Minimal pairs and contrast information
  - Spelling patterns and allophones
  - CMU ARPABET to IPA symbol mappings
- **Sagittal illustrations** – Derived from a Wikimedia Commons base SVG and adapted into consistent variants for articulation panels (see the Credits & Sources page for attribution).
- **Example word audio** – AI-generated `.mp3` files (currently produced via ElevenLabs) are produced locally, then manually uploaded to the audio bucket referenced by the app. These are temporary while the example word list is still evolving; human recordings can replace them once the set stabilizes. Generate with `bun --cwd packages/helper-scripts generate` once `ELEVENLABS_API_KEY` is configured in `packages/helper-scripts/.env`.

## Internationalization & translations

Phonaria uses **two complementary translation layers**:

1) **UI copy (next-intl messages)** – Navigation, page text, labels, and general UI strings live in `messages/{locale}.json` and are accessed with `useTranslations(...)`.

2) **Typed domain copy (phoneme details)** – Some strings are tightly coupled to `@phonaria/phonetics-data` IDs/types (e.g. `PhonemeSymbolId`, articulatory feature keys/values, allophone context keys). Those are stored as locale-specific TypeScript bundles in `src/data/phoneme-details/` and accessed with:

- Client components: `usePhonemeDetailsCopy()` from `@/data/phoneme-details/client`
- Non-React contexts/tests: `getPhonemeDetailsCopy(locale)` from `@/data/phoneme-details`

Why not put phoneme detail strings into `messages/*.json`?

- The keys come from `@phonaria/phonetics-data` registries and must stay **complete and in sync** as phoneme IDs/features evolve.
- TypeScript enforces coverage with `Record<PhonemeSymbolId, ...>` and strict typing, preventing missing/typo’d keys at build time.
- The data is not just “UI labels”; it’s a localized layer over the canonical phoneme model that’s reused across charts, tooltips, and dialogs.

### Copy tone

- Keep translations neutral and natural (avoid regionalisms and overly literal phrasing).
- Prefer concise, functional labels over marketing copy.
- Use `IPA` as the primary term; `IPA (AFI)` is acceptable on first mention in explanatory text.

### Adding a new locale

- Add `messages/{locale}.json` for UI strings.
- Add `src/data/phoneme-details/{locale}.ts` for phoneme detail copy and register it in `src/data/phoneme-details/index.ts`.
- Add the locale to `src/i18n/routing.ts`.
- Run `bun --cwd apps/web test` and `bun --cwd apps/web check-types` (phoneme copy has coverage tests).

## Environment variables

Create a `.env.local` file in `apps/web` with the following variables:

 ```env
 # Required for API rate limiting
 UPSTASH_REDIS_REST_URL=your_upstash_redis_url
 UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

 # Required for database
 DATABASE_URL=your_neon_database_url

 # Optional: Search Console verification (Vercel system env: VERCEL_PROJECT_PRODUCTION_URL)
 GOOGLE_SITE_VERIFICATION=your_verification_code

 # Optional: only needed when regenerating CMUDict JSON with helper-scripts
 CMUDICT_SRC_URL=https://example.com/cmudict.dict
 ```

 Notes:
 - `VERCEL_PROJECT_PRODUCTION_URL` (Vercel system env) is used to build canonical URLs,
   `metadataBase`, `robots.txt`, and `sitemap.xml`. If unavailable (local dev),
   the app falls back to `http://localhost:3000`. Ensure "Automatically expose System
   Environment Variables" is enabled in Vercel project settings.
 - `GOOGLE_SITE_VERIFICATION` enables the Search Console verification meta tag.
   Set this in Vercel for production and in `apps/web/.env.local` if you want to verify locally.

## Testing guidance

Unit tests live alongside the code they cover using `.test.ts` suffix (e.g., `src/data/phoneme-details.test.ts`, `src/app/api/g2p/_core/syllabifier.test.ts`, `src/app/api/dictionary/_services/dictionary-service.test.ts`). Run `bun --cwd apps/web test` locally or rely on the root `bun test` command for workspace-wide coverage.

 ## Security

 - **Content Security Policy** – Configured in `next.config.ts` to restrict script sources, enforce HTTPS upgrades, and prevent clickjacking
 - **Rate Limiting** – All API endpoints protected by Upstash Redis-based rate limiting to prevent abuse
 - **Input Validation** – All API endpoints use Elysia types with Zod schemas for request validation
