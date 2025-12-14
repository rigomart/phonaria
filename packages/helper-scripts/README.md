# Helper Scripts

Utility scripts that back the Phonaria web application. They generate reusable assets (CMU Pronouncing Dictionary JSON, phoneme word manifests) and provide lint/type checks for the package itself.

## Prerequisites

- `bun install` at the workspace root
- Node.js 18+
- Optional: `.env` file in this directory for overrides

```ini
# packages/helper-scripts/.env
CMUDICT_SRC_URL=https://raw.githubusercontent.com/rigomart/cmudict/refs/heads/master/cmudict.dict
# CMUDICT_JSON_PATH=/absolute/or/relative/path.json   # optional override
```

## Available commands

```bash
bun --cwd packages/helper-scripts lint                     # biome check --write
bun --cwd packages/helper-scripts check-types              # tsc --noEmit
bun --cwd packages/helper-scripts cmudict-to-json          # Download & compact CMUDict into JSON
bun --cwd packages/helper-scripts cmudict-stats            # Build stats for the generated CMUDict JSON
bun --cwd packages/helper-scripts generate-word-mappings   # Generate word mappings with CMU ARPA
```

## Word mappings workflow

`generate-word-mappings.ts` extracts all example words from `@phonaria/phonetics-data` (spelling patterns, contrasts, allophones) and looks up their CMU ARPA transcriptions in the CMUDict.

- Output: `packages/audio-gen/data/cmu-arpa-mappings.json` (regenerate when phoneme data changes)
- Run: `bun --cwd packages/helper-scripts generate-word-mappings`
- Includes: word, IPA phonemic transcription, CMU ARPA tokens, lookup status, and variant info
- Input: `CMUDICT_JSON_PATH` if set, otherwise `packages/phonetics-data/data/dict/cmudict.json`

## CMUDict JSON workflow

`cmudict-to-json.ts` downloads the raw CMU Pronouncing Dictionary, normalizes entries, and writes a JSON payload with metadata and a compact map of uppercase words to sanitized ARPAbet variants used by the web API.

1. Configure `CMUDICT_SRC_URL` (see `.env` example above).
2. Optionally set `CMUDICT_JSON_PATH`; otherwise the output defaults to `packages/phonetics-data/data/dict/cmudict.json` (the shared default for all consumers).
3. Run `bun --cwd packages/helper-scripts cmudict-to-json`.

The generated JSON has the following structure:
```json
{
  "meta": {
    "formatVersion": 1,
    "source": "cmudict",
    "sourceUrl": "https://...",
    "generatedAt": "2025-01-09T12:34:56.000Z",
    "wordCount": 123456,
    "variantCount": 234567,
    "skippedLineCount": 123,
    "deduplicatedVariantCount": 456
  },
  "data": {
    "WORD1": ["VARIANT1", "VARIANT2"]
  }
}
```

Consumers should read from the `data` property for dictionary lookups. Logs include entry counts, skipped lines, and file size so you can confirm the generated dictionary before committing it.
