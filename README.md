# Phonaria

Phonaria is a learner-first pronunciation toolkit for ESL learners. It’s a toolbox rather than a course: interactive IPA references, instant grapheme‑to‑phoneme (G2P) transcription, contrast guidance, and in‑context dictionary lookups live in one responsive, phoneme‑focused workspace.

## Highlights

- **G2P studio** – Paste text for stress‑marked IPA; click words for definitions and click phonemes for articulation, allophones, spelling patterns, and contrasts.
- **IPA reference hub** – Responsive General American chart with production guidance, minimal pairs, and example words (with audio where available).
- **Dictionary bridge** – In‑context lookups with audio and clear empty/error states, rate‑limited via Upstash Redis.
- **Insights** – CMUDict coverage, phoneme frequency, and syllable distribution visualizations.
- **Phonetics data core** – Typed phoneme registries and CMUDict assets power both the UI and helper scripts.

## Monorepo layout

| Package | Description |
| --- | --- |
| [`apps/web`](apps/web/README.md) | Next.js App Router project containing the learner experience and API routes. |
| [`packages/phonetics-data`](packages/phonetics-data/README.md) | Source of truth for phoneme metadata, articulation registries, and helper utilities. |
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

## Contributing

Contributions are welcome. Before opening a PR:

- Use the scoped scripts above and keep changes aligned to the relevant package (`apps/web`, `packages/phonetics-data`, etc.).
- Run `bun lint`, `bun check-types`, and `bun test`.
- Prefer small, focused commits and follow Conventional Commit messages.

See `docs/project-overview.md` for product context and `docs/README.md` for enhancement plans and feature briefs.

## Data & helper workflows

Phonaria ships with pre-generated assets but also supports regeneration when source data changes:

- **CMU Pronouncing Dictionary** – Stored at `packages/phonetics-data/data/dict/cmudict.json` and bundled through the `@phonaria/phonetics-data` package. The `cmudict-stats.json` companion file powers the insights page. Regenerate with:
  ```bash
  CMUDICT_SRC_URL="<remote .dict file>" bun --cwd packages/helper-scripts cmudict-to-json
  bun --cwd packages/helper-scripts cmudict-stats
  ```
  Use `CMUDICT_JSON_PATH` to override the default output location.
- **Example word audio** – AI-generated `.mp3` files (currently produced via ElevenLabs) are generated locally, then uploaded manually to the audio bucket the app references. These are temporary while the example word list is still evolving; human recordings can replace them once the set stabilizes. Provide an `ELEVENLABS_API_KEY` in `packages/helper-scripts/.env` and run:
  ```bash
  bun --cwd packages/helper-scripts generate
  ```

Generated assets are committed so deployments remain deterministic.

## Documentation

Deeper product context, enhancement plans, and feature briefs live in the [`docs`](docs/README.md) directory. Start with the [project overview](docs/project-overview.md) for a guided tour and explore enhancement plans or feature notes as needed.

## Licensing

Phonaria is distributed under the MIT License. The embedded CMU Pronouncing Dictionary follows its original [BSD-3-Clause license](CMUdict-BSD-3-LICENSE.md).
