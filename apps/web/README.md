# Phonaria – Web Application

This package hosts the primary Phonaria experience: a Next.js 15 App Router project that delivers interactive IPA charts, grapheme-to-phoneme transcription, dictionary lookups, and pronunciation audio for ESL learners.

## Feature overview

- **Transcription workspace** – Stress-marked IPA output with clickable words for dictionary definitions and a phoneme inspector to surface articulation details.
- **Interactive IPA chart** – Browse consonants, monophthongs (including r-colored vowels), and diphthongs with minimal pairs, spelling patterns, allophones, and optional example audio.
- **Insights page** – CMUDict coverage cards, phoneme frequency charts, and syllable histograms powered by the shared CMUDict stats dataset.
- **Dictionary integration** – `GET /api/dictionary` proxies Free Dictionary responses with Upstash Redis rate limiting; transcribed words link straight to definitions and audio.
- **Themeable & responsive UI** – Tailwind CSS v4, shadcn/ui primitives, and next-themes provide a polished light/dark experience across devices.
- **Internationalization** – Locale-based routing via next-international with support for multiple languages.

## Tech stack

- **Framework** – Next.js 15.5.5 (App Router, Turbopack for dev and builds)
- **UI Library** – React 19.1.0 with TypeScript 5
- **Language** – TypeScript with strict settings and path aliases (`@/components`, `@/lib`, `@/data`)
- **Styling** – Tailwind CSS v4, shadcn/ui components, Radix UI primitives, CSS variables in `src/app/[locale]/globals.css`
- **State Management** – TanStack Query v5 (server state and caching), Zustand (client state stores)
- **Internationalization** – next-international for locale-based routing and translations
- **Data Validation** – Zod schemas for API request/response validation
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
```

## Directory structure

```
apps/web
├── locales/              # Internationalization configuration (next-international)
│   ├── en/               # English translations
│   ├── client.ts         # Client-side i18n setup
│   └── server.ts         # Server-side i18n setup
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
│   │   ├── api/           # REST API endpoints
│   │   │   ├── _lib/      # Shared API utilities
│   │   │   ├── dictionary/ # Dictionary lookup with rate limiting
│   │   │   │   ├── _schemas/
│   │   │   │   ├── _services/
│   │   │   │   └── route.ts
│   │   │   └── g2p/       # Grapheme-to-phoneme transcription
│   │   │       ├── _core/
│   │   │       ├── _schemas/
│   │   │       ├── _utils/
│   │   │       └── route.ts
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
│   │   └── phoneme-details.ts  # Phoneme metadata aggregation
│   ├── hooks/             # Shared React hooks
│   │   ├── use-audio-manager/
│   │   └── use-media-query.ts
│   ├── lib/               # Shared utilities
│   │   ├── api/           # API client utilities
│   │   ├── utils.ts       # General helper functions
│   │   └── vowel-chart-geometry.ts
│   └── middleware.ts      # Next.js middleware (locale handling)
├── next.config.ts         # Next.js configuration (CSP headers, etc.)
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Vitest test runner configuration
```

### Directory naming conventions

- **Prefixed directories** (`_components`, `_hooks`, `_lib`, etc.) – Feature-specific code co-located with routes; not exposed as routes by Next.js
- **Route groups** (`(overview)`) – Share layouts without affecting URL structure
- **Locale routes** (`[locale]`) – Dynamic routing for internationalization support

## Data dependencies

- **CMU Pronouncing Dictionary** – Shipped via `shared-data` at `packages/shared-data/data/dict/cmudict.json`; the companion `cmudict-stats.json` feeds the insights page. Regenerate with:
  ```bash
  CMUDICT_SRC_URL="<remote .dict file>" bun --cwd packages/helper-scripts cmudict-to-json
  bun --cwd packages/helper-scripts cmudict-stats
  ```
- **Phoneme metadata** – Sourced from `packages/shared-data` and aggregated in `src/data/phoneme-details.ts`, including:
  - Phoneme symbols, categories, and IPA representations
  - Articulatory features and production guidance
  - Minimal pairs and contrast information
  - Spelling patterns and allophones
  - CMU ARPABET to IPA symbol mappings
- **Example audio** – ElevenLabs-generated `.mp3` files are produced locally, then manually uploaded to the audio bucket referenced by the app (alongside any externally sourced clips). Generate with `bun --cwd packages/helper-scripts generate` once `ELEVENLABS_API_KEY` is configured in `packages/helper-scripts/.env`.

## Environment variables

Create a `.env.local` file in `apps/web` with the following variables:

```env
# Required for API rate limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Optional: only needed when regenerating CMUDict JSON with helper-scripts
CMUDICT_SRC_URL=https://example.com/cmudict.dict
```

## Testing guidance

Unit tests live alongside the code they cover using `.test.ts` suffix (e.g., `src/data/phoneme-details.test.ts`, `src/app/api/g2p/_core/syllabifier.test.ts`, `src/app/api/dictionary/_services/dictionary-service.test.ts`). Run `bun --cwd apps/web test` locally or rely on the root `bun test` command for workspace-wide coverage.

## Security

- **Content Security Policy** – Configured in `next.config.ts` to restrict script sources, enforce HTTPS upgrades, and prevent clickjacking
- **Rate Limiting** – Dictionary API endpoint protected by Upstash Redis-based rate limiting to prevent abuse
- **Input Validation** – All API endpoints use Zod schemas for request validation
