# Phonix

Phonix is a phoneme-first ESL pronunciation project built around a modern Next.js application. Learners explore General American phonemes through interactive IPA charts, grapheme-to-phoneme (G2P) transcription, and in-context dictionary lookups with audio support.

## Highlights

- **Audio-first learning** – Interactive phoneme dialogs with minimal pairs, production tips, and optional ElevenLabs example audio.
- **Fast G2P service** – A bundled CMU Pronouncing Dictionary powers instant transcription and phoneme highlighting.
- **Dictionary integration** – Clickable transcriptions surface word definitions and available pronunciation audio in a side drawer.
- **Shared phoneme metadata** – Typed phoneme data and articulation metadata are reusable across the app and helper tooling.

## Monorepo layout

| Package | Description |
| --- | --- |
| [`apps/web`](apps/web/README.md) | Next.js App Router project containing the learner experience and API routes. |
| [`packages/shared-data`](packages/shared-data/README.md) | Source of truth for phoneme metadata, articulation registries, and helper utilities. |
| [`packages/helper-scripts`](packages/helper-scripts/README.md) | ElevenLabs audio generation and CMUDict tooling that feed the web app. |
| [`docs`](docs/README.md) | Product briefs, technical design notes, and feature deep-dives. |

## Getting started

### Prerequisites

- [pnpm](https://pnpm.io/) 10+
- Node.js 18.18 or newer (matching the Next.js support matrix)

### Installation & local development

```bash
pnpm install            # install workspace dependencies once
pnpm -C apps/web dev    # launch the learner experience at http://localhost:3000
```

The root `pnpm dev` command delegates to Turborepo and will start every package with a `dev` script. Use package-specific commands (shown above) for a focused workflow.

## Common workspace tasks

```bash
pnpm lint         # run Biome across packages
pnpm check-types  # run TypeScript in --noEmit mode
pnpm test         # execute Vitest suites (filtered via Turborepo)
pnpm build        # build all packages for production
```

All commits should pass linting, type checking, and relevant tests.

## Data & helper workflows

Phonix ships with pre-generated assets but also supports regeneration when source data changes:

- **CMU Pronouncing Dictionary** – Stored at `apps/web/data/cmudict.json` and bundled with the API for fast lookups. The JSON includes metadata (source, generation timestamp, counts) and the dictionary data. Regenerate with:
  ```bash
  CMUDICT_SRC_URL="<remote .dict file>" pnpm -C packages/helper-scripts cmudict-to-json
  ```
  Use `CMUDICT_JSON_PATH` to override the default output location.
- **Example audio** – ElevenLabs powered `.mp3` files saved to `apps/web/public/audio/examples`. Provide an `ELEVENLABS_API_KEY` in `packages/helper-scripts/.env` and run:
  ```bash
  pnpm -C packages/helper-scripts generate
  ```

Generated assets are committed so deployments remain deterministic.

## Documentation

Deeper product context, enhancement plans, and feature briefs live in the [`docs`](docs/README.md) directory. Start with the [project overview](docs/project-overview.md) for a guided tour and explore enhancement plans or feature notes as needed.

## Licensing

Phonix is distributed under the MIT License. The embedded CMU Pronouncing Dictionary follows its original [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
