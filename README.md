# Phonaria

Pronunciation toolkit for ESL learners -- interactive IPA charts, instant grapheme-to-phoneme transcription, and contrast practice in one responsive workspace.

**Live app:** [phonaria.rigos.dev](https://phonaria.rigos.dev)

Phonaria is a single application: `apps/lab`, a TanStack Start app served from Cloudflare Workers. The earlier Next.js application on Vercel was retired; see [`docs/adr/0002-single-application-on-cloudflare-workers.md`](docs/adr/0002-single-application-on-cloudflare-workers.md) for what that dropped and why.

## Tech Stack

- **Language:** React 19, TypeScript 5
- **Framework:** TanStack Start on Vite
- **Hosting:** Cloudflare Workers, deployed with Wrangler from GitHub Actions
- **Database:** Turso (libSQL) via Drizzle ORM, read through a TanStack server function
- **Styling:** Tailwind CSS v4, shadcn/ui, Lucide icons
- **State:** Zustand
- **Feature flags:** `@phonaria/flags`, backed by Worker `vars` per environment
- **Monorepo:** Turborepo + Bun workspaces
- **Testing:** Vitest (unit), Playwright (deployed browser contract)
- **Formatting:** Biome (tabs, double quotes, 100-char lines)
- **Releases:** Semantic Release for tags and GitHub Releases

## How It Works

The core flow is the **G2P transcription workspace**. A learner pastes text, and each word is resolved to stress-marked IPA through a three-tier lookup:

1. **Tier 1** -- top 1k words (~28 KB) bundled inline, resolves instantly.
2. **Tier 2** -- top 10k words (~324 KB) lazy-loaded on first miss, still client-side.
3. **Tier 3** -- the full CMUDict queried from Turso through a rate-limited server function.

This covers the large majority of lookups without a network request. Tier 3 stays server-side so the full dictionary never ships to the browser, and a build-time assertion keeps the tier-2 asset out of the Worker bundle. Each phoneme in the result is interactive: clicking one opens an articulation diagram, a plain-language description, and audio, all sourced from `packages/phonetics-data`.

All phoneme data is keyed by a **language-agnostic ID system** -- a single map of uppercase IDs to IPA symbols (`PhonemeIpaMap`). Each language declares an inventory that selects a subset of these IDs, and a capabilities registry gates what features are available per language (English has full coverage; Spanish currently has articulations only). Adding a new language means adding IDs and an inventory, not modifying existing ones.

The **IPA chart** shares the same phoneme metadata and detail system as transcription, so the learner gets consistent articulation guidance regardless of entry point. **Practice** ships behind `FLAG_PRACTICE` and is off in production.

## Project Structure

```
apps/lab/                   TanStack Start app on Cloudflare Workers
packages/phonetics-data/    Phoneme metadata and CMUDict assets
packages/ui/                Shared shadcn/ui components
packages/flags/             Env-backed feature flags
packages/lab-contract/      Browser-level contract run against a deployed app
packages/helper-scripts/    CMUDict processing and word list generation
packages/audio-gen/         ElevenLabs TTS audio generation
docs/                       Product context, decisions, and migration records
```

**Why a monorepo?** Phoneme data is consumed by both the application and the helper scripts that generate audio and word lists. Keeping it in a shared package (`phonetics-data`) means one source of truth with typed exports.

**Why co-located feature code?** Practice groups its own `_components`, `_lib`, and `_store` under `apps/lab/src/practice`. This keeps feature code close to where it's used -- Practice alone has Zustand stores, scoring logic, and session generation that don't belong anywhere else.

**Why typed phoneme copy instead of JSON catalogs?** Phoneme descriptions, allophone contexts, and contrast notes live in TypeScript modules keyed by phoneme ID rather than JSON catalogs. This preserves compile-time checks against the phoneme registry -- a missing or mistyped key is a type error, not a silent gap.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3+ (package manager)
- Node.js 18.18+

### Install and run

```bash
git clone https://github.com/rigomart/phonaria.git
cd phonaria
bun install
bun dev                                    # http://localhost:3001
```

Copy `apps/lab/.env.example` to `apps/lab/.env.local` and fill it in. Tier-3 transcription needs `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; for local TanStack Start those two also go in `apps/lab/.dev.vars` by hand. See [`apps/lab/README.md`](apps/lab/README.md) for the delivery details.

## Scripts

```bash
bun dev            # Start the dev server
bun build          # Production builds (Turborepo)
bun lint           # Biome check with auto-fix
bun check-types    # TypeScript --noEmit across packages
bun test           # Vitest unit tests
bun e2e:lab        # Browser contract against the deployed app
```

Database (`apps/lab`):

```bash
bun --cwd apps/lab db:push       # Push the Drizzle schema to Turso
```

Data generation (`packages/helper-scripts`):

```bash
bun --cwd packages/helper-scripts cmudict-to-json          # Convert CMUDict to JSON
bun --cwd packages/helper-scripts cmudict-stats            # Generate coverage stats
bun --cwd packages/helper-scripts generate-word-mappings   # CMU ARPA mappings for example words
python3 packages/helper-scripts/generate-curated-chunks.py # Tier 1/2 word lists (needs wordfreq)
```

## License

MIT. The embedded CMU Pronouncing Dictionary follows its original [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
