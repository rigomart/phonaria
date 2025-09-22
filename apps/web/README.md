# Phonix – Web Application

This package hosts the primary Phonix experience: a Next.js App Router project that delivers IPA charts, grapheme-to-phoneme transcription, dictionary lookups, and pronunciation audio for ESL learners.

## Feature overview

- **Interactive IPA chart** – Explore 40 General American phonemes with articulation metadata, example words, and optional ElevenLabs audio.
- **Grapheme-to-phoneme transcription** – `POST /api/g2p` converts user text into IPA with highlighted phoneme matches.
- **Dictionary side drawer** – Clicking a word shows definitions and pronunciation audio via `GET /api/dictionary`.
- **Themeable & responsive UI** – Tailwind CSS v4, shadcn/ui primitives, and next-themes provide a polished experience across devices.
- **Internationalization ready** – `src/i18n` exposes next-intl configuration for future locale support.

## Tech stack

- **Framework** – Next.js 15 (App Router, Turbopack dev server)
- **Language** – TypeScript with strict settings and path aliases (`@/`)
- **Styling** – Tailwind CSS v4, CSS variables managed in `src/app/globals.css`
- **State & data** – React Query (for async flows), Zustand (lightweight client stores)
- **Testing** – Vitest with utility-first unit coverage for API services and hooks
- **Linting** – Biome (shared workspace configuration)

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
├── data/                 # Bundled CMU Pronouncing Dictionary JSON
├── public/audio/         # ElevenLabs example audio (optional)
├── src/
│   ├── app/              # Routes, layouts, and API handlers (App Router)
│   │   ├── api/          # REST endpoints (e.g., g2p, dictionary)
│   │   └── (routes)      # Feature entry points
│   ├── components/       # Reusable UI components (feature folders under chart/, g2p/, core/, ui/)
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # next-intl configuration and messages
│   └── lib/              # Client/server utilities (g2p helpers, dictionary services, design tokens)
├── global.ts             # Shared runtime configuration
├── messages/             # Localized message bundles (per locale)
└── vitest.config.ts      # Test runner configuration
```

## Data dependencies

- **CMU Pronouncing Dictionary** – Expected at `apps/web/data/cmudict.json`. Regenerate via `pnpm -C packages/helper-scripts cmudict-to-json` (see helper-scripts README).
- **Example audio** – Optional `.mp3` files under `public/audio/examples`. Generated with `pnpm -C packages/helper-scripts generate` once `ELEVENLABS_API_KEY` is configured.

## Testing guidance

Unit tests live alongside the code they cover (e.g., `src/app/api/dictionary/_services/dictionary-service.test.ts`). Run `pnpm -C apps/web test` locally or rely on the root `pnpm test` command for workspace-wide coverage.
