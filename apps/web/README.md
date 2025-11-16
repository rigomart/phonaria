# Phonaria – Web Application

This package hosts the primary Phonaria experience: a Next.js 15 App Router project that delivers interactive IPA charts, grapheme-to-phoneme transcription, dictionary lookups, and pronunciation audio for ESL learners.

## Feature overview

- **Interactive IPA chart** – Explore 40 General American phonemes organized by consonants, monophthongs, diphthongs, and rhotics with detailed articulation metadata, example words, minimal pairs, and optional ElevenLabs audio.
- **Grapheme-to-phoneme transcription** – `POST /api/g2p` converts user text into IPA with stress markers and clickable phoneme insights.
- **Phoneme detail dialogs** – Click any phoneme to view production guidance, articulatory features, spelling patterns, allophones, and contrast information.
- **Dictionary integration** – Clicking a transcribed word shows definitions and pronunciation audio via `GET /api/dictionary` (with Upstash Redis rate limiting).
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
pnpm install             # once per workspace
pnpm -C apps/web dev     # start Next.js at http://localhost:3000
```

The root `pnpm dev` will also start this project if you prefer Turborepo orchestration.

### Useful scripts

```bash
pnpm -C apps/web lint            # biome check --write
pnpm -C apps/web check-types     # tsc --noEmit
pnpm -C apps/web test            # vitest run
pnpm -C apps/web build           # next build --turbopack
pnpm -C apps/web start           # next start (after build)
```

## Directory structure

```
apps/web
├── locales/              # Internationalization configuration (next-international)
│   ├── en/               # English translations
│   ├── client.ts         # Client-side i18n setup
│   └── server.ts         # Server-side i18n setup
├── public/               # Static assets (SVG icons, audio files)
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── [locale]/     # Locale-based routing (e.g., /en, /es)
│   │   │   ├── (g2p)/    # Route group: G2P transcription tool (renders at /{locale})
│   │   │   │   ├── _components/   # Feature-specific UI components
│   │   │   │   ├── _hooks/        # Feature-specific React hooks
│   │   │   │   ├── _lib/          # Feature-specific utilities
│   │   │   │   ├── _schemas/      # Zod validation schemas
│   │   │   │   ├── _store/        # Zustand state stores
│   │   │   │   ├── _types/        # TypeScript type definitions
│   │   │   │   └── page.tsx       # Route page component
│   │   │   ├── ipa-chart/ # IPA chart with phoneme details
│   │   │   │   ├── _components/
│   │   │   │   ├── _lib/
│   │   │   │   ├── _sections/
│   │   │   │   ├── _store/
│   │   │   │   └── page.tsx
│   │   │   ├── overview/  # Landing page with feature previews
│   │   │   ├── dev/       # Development utilities (dev only)
│   │   │   ├── _hooks/    # Shared locale-level hooks
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
│   │   ├── audio-button.tsx
│   │   ├── audio-controls.tsx
│   │   ├── header.tsx
│   │   ├── mode-toggle.tsx
│   │   └── theme-provider.tsx
│   ├── data/              # Bundled data files
│   │   ├── dict/          # CMU Pronouncing Dictionary
│   │   │   └── cmudict.json
│   │   └── phoneme-details.ts  # Phoneme metadata aggregation
│   ├── hooks/             # Shared React hooks
│   │   └── use-audio-manager/
│   ├── lib/               # Shared utilities
│   │   ├── api/           # API client utilities
│   │   └── utils.ts       # General helper functions
│   └── middleware.ts      # Next.js middleware (locale handling)
├── next.config.ts         # Next.js configuration (CSP headers, etc.)
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Vitest test runner configuration
```

### Directory naming conventions

- **Prefixed directories** (`_components`, `_hooks`, `_lib`, etc.) – Feature-specific code co-located with routes; not exposed as routes by Next.js
- **Route groups** (`(g2p)`) – Share layouts without affecting URL structure
- **Locale routes** (`[locale]`) – Dynamic routing for internationalization support

## Data dependencies

- **CMU Pronouncing Dictionary** – Located at `src/data/dict/cmudict.json` with metadata (source URL, generation timestamp, entry counts) and dictionary data. Regenerate via `pnpm -C packages/helper-scripts cmudict-to-json` (see helper-scripts README).
- **Phoneme metadata** – Sourced from `packages/shared-data` package, including:
  - Phoneme symbols, categories, and IPA representations
  - Articulatory features and production guidance
  - Minimal pairs and contrast information
  - Spelling patterns and allophones
  - CMU ARPABET to IPA symbol mappings
- **Example audio** – Optional `.mp3` files under `public/audio/examples`. Generated with `pnpm -C packages/helper-scripts generate` once `ELEVENLABS_API_KEY` is configured in `packages/helper-scripts/.env`.

## Environment variables

Create a `.env.local` file in `apps/web` with the following variables:

```env
# Required for API rate limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Optional: CMUDict source URL for builds
CMUDICT_SRC_URL=https://example.com/cmudict.dict
```

## Testing guidance

Unit tests live alongside the code they cover using `.test.ts` suffix (e.g., `src/data/phoneme-details.test.ts`, `src/app/api/dictionary/_services/dictionary-service.test.ts`). Run `pnpm -C apps/web test` locally or rely on the root `pnpm test` command for workspace-wide coverage.

## Security

- **Content Security Policy** – Configured in `next.config.ts` to restrict script sources, enforce HTTPS upgrades, and prevent clickjacking
- **Rate Limiting** – Dictionary API endpoint protected by Upstash Redis-based rate limiting to prevent abuse
- **Input Validation** – All API endpoints use Zod schemas for request validation
