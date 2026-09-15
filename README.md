# Phonaria

Pronunciation toolkit for ESL learners -- interactive IPA charts, instant grapheme-to-phoneme transcription, dictionary lookups, and contrast practice in one responsive workspace.

**Lab:** [phonaria-lab.rigos.dev](https://phonaria-lab.rigos.dev) — the active surface, and where new work lands.
**Legacy web app:** [phonaria.rigos.dev](https://phonaria.rigos.dev) — the earlier surface Lab is superseding.

## Tech Stack

Shared across both surfaces:

- **Language:** React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui, Lucide icons
- **Monorepo:** Turborepo + Bun workspaces
- **Testing:** Vitest (unit), Playwright (browser contract and E2E)
- **Formatting:** Biome (tabs, double quotes, 100-char lines)
- **Releases:** Semantic Release for tags and GitHub Releases

**Lab** (`apps/lab`) — the active surface:

- **Framework:** TanStack Start on Vite
- **Hosting:** Cloudflare Workers, deployed with Wrangler from GitHub Actions
- **Database:** Turso (libSQL) via Drizzle ORM, read through a server function
- **State:** Zustand
- **Feature flags:** `@phonaria/flags`, backed by Worker `vars` per environment

**Legacy web app** (`apps/web`) — maintained but not receiving new features:

- **Framework:** Next.js 16 (App Router)
- **Hosting:** Vercel (auto-deploy from `main`)
- **Data fetching:** next-safe-action + TanStack Query + Zustand
- **Database:** Neon PostgreSQL via Drizzle ORM
- **Rate limiting:** Upstash Redis (sliding window)
- **i18n:** next-intl with locale-based routing (`en`, `es`)

## How It Works

The core flow is the **G2P transcription workspace**. A learner pastes text, and each word is resolved to stress-marked IPA through a three-tier lookup:

1. **Tier 1** -- top 1k words (~22 KB) bundled inline, resolves instantly.
2. **Tier 2** -- top 10k words (~273 KB) lazy-loaded on first miss, still client-side.
3. **Tier 3** -- full 130k-entry CMUDict queried from PostgreSQL via a rate-limited server action.

This covers ~95% of lookups without a network request. Each word and phoneme in the result is interactive: clicking a word opens a dictionary lookup (another server action), clicking a phoneme opens articulation details, allophones, spelling patterns, and contrast notes sourced from `packages/phonetics-data`.

All phoneme data is keyed by a **language-agnostic ID system** -- a single map of uppercase IDs to IPA symbols (`PhonemeIpaMap`). Each language declares an inventory that selects a subset of these IDs, and a capabilities registry gates what features are available per language (English has full coverage; Spanish currently has articulations only). Adding a new language means adding IDs and an inventory, not modifying existing ones.

The **IPA chart** and **find-by-sound** tools share the same phoneme metadata and detail system, so the learner gets consistent articulation guidance regardless of entry point.

## Project Structure

```
apps/lab/                   TanStack Start app on Cloudflare Workers (active surface)
apps/web/                   Legacy Next.js app (routes, server actions, UI)
packages/phonetics-data/    Phoneme metadata and CMUDict assets
packages/ui/                Shared shadcn/ui components
packages/flags/             Env-backed feature flags
packages/lab-contract/      Browser-level contract run against a deployed Lab
packages/helper-scripts/    CMUDict processing and word list generation
packages/audio-gen/         ElevenLabs TTS audio generation
docs/                       Product briefs and feature design notes
```

**Why a monorepo?** Phoneme data is consumed by both the web app and the helper scripts that generate audio and word lists. Keeping it in a shared package (`phonetics-data`) means one source of truth with typed exports.

**Why co-located feature code?** In the legacy app, each route under `apps/web/src/app/[locale]/` groups its own `_components`, `_hooks`, `_lib`, `_store`, `_types`, and `_actions` in prefixed directories. This keeps feature code close to where it's used -- the transcription route alone has server actions, Zustand stores, Zod schemas, and several specialized hooks that don't belong anywhere else.

**Why typed phoneme copy instead of JSON catalogs?** General UI strings use next-intl JSON files (`messages/{locale}.json`). But phoneme descriptions, allophone contexts, and contrast notes live in TypeScript modules keyed by phoneme ID (`src/data/phoneme-details/{locale}.ts`). This preserves compile-time checks against the phoneme registry -- a missing or mistyped key is a type error, not a silent gap.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3+ (package manager)
- Node.js 18.18+

### Install and run

```bash
git clone https://github.com/rigomart/phonaria.git
cd phonaria
bun install
```

Create `apps/web/.env.local`:

```bash
DATABASE_URL=postgresql://...              # Neon PostgreSQL connection string
UPSTASH_REDIS_REST_URL=https://...         # Upstash Redis for rate limiting
UPSTASH_REDIS_REST_TOKEN=...
SITE_URL=http://localhost:3000             # Used for sitemap/canonical URLs
SKIP_RATE_LIMIT=true                       # Bypass rate limiting in dev
```

```bash
bun dev                                    # Lab at localhost:3001
# or
bun --cwd apps/web dev                     # Legacy web app at localhost:3000
```

The Lab reads its own config from `apps/lab/.env.local`; see
`apps/lab/.env.example` and `apps/lab/README.md`.

## Scripts

```bash
bun dev            # Start the Lab dev server
bun build          # Production builds (Turborepo)
bun lint           # Biome check with auto-fix
bun check-types    # TypeScript --noEmit across packages
bun test           # Vitest unit tests
bun e2e            # Playwright E2E for the legacy web app (needs SKIP_RATE_LIMIT + DATABASE_URL)
bun e2e:lab        # Browser contract against a deployed Lab
```

Database (apps/web):

```bash
bun --cwd apps/web db:push       # Push Drizzle schema to Neon
bun --cwd apps/web db:migrate    # Run migrations
bun --cwd apps/web db:seed       # Seed database
```

Data generation (packages/helper-scripts):

```bash
bun --cwd packages/helper-scripts cmudict-to-json          # Convert CMUDict to JSON
bun --cwd packages/helper-scripts cmudict-stats            # Generate coverage stats
bun --cwd packages/helper-scripts generate-word-mappings   # CMU ARPA mappings for example words
python3 packages/helper-scripts/generate-curated-chunks.py # Tier 1/2 word lists (needs wordfreq)
```

## License

MIT. The embedded CMU Pronouncing Dictionary follows its original [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
