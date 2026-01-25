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
- Input: `CMUDICT_JSON_PATH` if set, otherwise `packages/phonetics-data/data/en/dict/cmudict.json`

## CMUDict JSON workflow

`cmudict-to-json.ts` downloads the raw CMU Pronouncing Dictionary, normalizes entries, and writes a JSON payload with metadata and a compact map of uppercase words to sanitized ARPAbet variants used by the web API.

1. Configure `CMUDICT_SRC_URL` (see `.env` example above).
2. Optionally set `CMUDICT_JSON_PATH`; otherwise the output defaults to `packages/phonetics-data/data/en/dict/cmudict.json` (the shared default for all consumers).
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

## Curated word chunks workflow

`generate-curated-chunks.py` generates frequency-ordered word lists with CMU ARPABET pronunciations for client-side tiered lookup. This is a **Python script** (not TypeScript) because it uses the [wordfreq](https://github.com/rspeer/wordfreq) library.

### Prerequisites

```bash
pip install wordfreq
```

### Running the script

```bash
cd packages/helper-scripts
python generate-curated-chunks.py
```

### Output

The script generates two files in `packages/phonetics-data/data/en/curated/`:

| File | Words | Size |
| --- | --- | --- |
| `top-1k.json` | 1,000 | ~22 KB |
| `top-10k.json` | 10,000 | ~273 KB |

Each file contains:
- **meta**: Version, license (CC-BY-SA 4.0), attribution, and source URLs
- **words**: Simple `word → "CMU ARPABET"` mapping

### Data sources

- **Word frequencies**: [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer
  - Combines Google Books Ngrams, OpenSubtitles, SUBTLEX, Wikipedia, and more
  - License: Apache 2.0 (code), CC-BY-SA 4.0 (data)
- **Pronunciations**: CMUDict (Public Domain)

### Licensing

The generated files are licensed under **CC-BY-SA 4.0**. See the `phonetics-data` README for full attribution requirements.
