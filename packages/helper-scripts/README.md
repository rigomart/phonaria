# Helper Scripts

Utility scripts that back the Phonix web application. They generate reusable assets (example audio and CMU Pronouncing Dictionary JSON) and provide lint/type checks for the package itself.

## Prerequisites

- `pnpm install` at the workspace root
- Node.js 18+
- Optional: `.env` file in this directory for API keys and overrides

```ini
# packages/helper-scripts/.env
ELEVENLABS_API_KEY=...
CMUDICT_SRC_URL=https://raw.githubusercontent.com/rigomart/cmudict/refs/heads/master/cmudict.dict
# CMUDICT_JSON_PATH=/absolute/or/relative/path.json   # optional override
```

## Available commands

```bash
pnpm -C packages/helper-scripts lint            # biome check --write
pnpm -C packages/helper-scripts check-types     # tsc --noEmit
pnpm -C packages/helper-scripts generate        # ElevenLabs example audio generation
pnpm -C packages/helper-scripts cmudict-to-json # Download & compact CMUDict into JSON
```

## Audio generation workflow

`generate.ts` scans the shared phoneme metadata for unique example words and creates `.mp3` files using the ElevenLabs API.

1. Supply an `ELEVENLABS_API_KEY` in `.env`.
2. Run `pnpm -C packages/helper-scripts generate`.
3. Audio is written to `apps/web/public/audio/examples/<word>.mp3` (directories are created automatically).

The script skips words that already have audio. To experiment with a smaller batch, temporarily adjust the `extractExampleWords()` call inside `src/generate.ts`.

## CMUDict JSON workflow

`cmudict-to-json.ts` downloads the raw CMU Pronouncing Dictionary, normalizes entries, and writes a compact JSON map used by the web API.

1. Configure `CMUDICT_SRC_URL` (see `.env` example above).
2. Optionally set `CMUDICT_JSON_PATH`; otherwise the output defaults to `apps/web/data/cmudict.json`.
3. Run `pnpm -C packages/helper-scripts cmudict-to-json`.

Logs include entry counts, skipped lines, and file size so you can confirm the generated dictionary before committing it.
