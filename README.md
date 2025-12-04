# Phonaria

Phonaria is a phoneme-first ESL pronunciation project built around a modern Next.js application. Learners explore General American phonemes through interactive IPA charts, grapheme-to-phoneme (G2P) transcription, and in-context dictionary lookups with audio support.

## Highlights

- **Transcription workspace** – Stress-marked IPA output with clickable words for definitions and a phoneme inspector for articulation details.
- **Interactive IPA chart** – Phoneme dialogs bundle articulation tips, minimal pairs, spelling patterns, and optional example audio.
- **Dictionary + CMUDict coverage** – CMU-based G2P with fallback handling plus an insights page backed by CMUDict statistics.
- **Shared phoneme metadata** – Typed datasets power both the app and helper tooling with a single source of truth.

## Monorepo layout

| Package | Description |
| --- | --- |
| [`apps/web`](apps/web/README.md) | Next.js App Router project containing the learner experience and API routes. |
| [`packages/shared-data`](packages/shared-data/README.md) | Source of truth for phoneme metadata, articulation registries, and helper utilities. |
| [`packages/helper-scripts`](packages/helper-scripts/README.md) | ElevenLabs audio generation and CMUDict tooling that feed the web app. |
| [`docs`](docs/README.md) | Product briefs, technical design notes, and feature deep-dives. |

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) 1.3+
- Node.js 18.18 or newer (matching the Next.js support matrix)

### Installation & local development

```bash
bun install            # install workspace dependencies once
bun --cwd apps/web dev    # launch the learner experience at http://localhost:3000
```

The root `bun dev` command delegates to Turborepo and will start every package with a `dev` script. Use package-specific commands (shown above) for a focused workflow.

## Common workspace tasks

```bash
bun lint         # run Biome across packages
bun check-types  # run TypeScript in --noEmit mode
bun test         # execute Vitest suites (filtered via Turborepo)
bun build        # build all packages for production
```

All commits should pass linting, type checking, and relevant tests.

## Data & helper workflows

Phonaria ships with pre-generated assets but also supports regeneration when source data changes:

- **CMU Pronouncing Dictionary** – Stored at `packages/shared-data/data/dict/cmudict.json` and bundled through the `shared-data` package. The `cmudict-stats.json` companion file powers the insights page. Regenerate with:
  ```bash
  CMUDICT_SRC_URL="<remote .dict file>" bun --cwd packages/helper-scripts cmudict-to-json
  bun --cwd packages/helper-scripts cmudict-stats
  ```
  Use `CMUDICT_JSON_PATH` to override the default output location.
- **Example audio** – ElevenLabs powered `.mp3` files are generated locally, then uploaded manually to the audio bucket the app references (alongside any externally sourced files). Provide an `ELEVENLABS_API_KEY` in `packages/helper-scripts/.env` and run:
  ```bash
  bun --cwd packages/helper-scripts generate
  ```

Generated assets are committed so deployments remain deterministic.

## Documentation

Deeper product context, enhancement plans, and feature briefs live in the [`docs`](docs/README.md) directory. Start with the [project overview](docs/project-overview.md) for a guided tour and explore enhancement plans or feature notes as needed.

## Licensing

Phonaria is distributed under the MIT License. The embedded CMU Pronouncing Dictionary follows its original [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
