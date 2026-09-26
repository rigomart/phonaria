# Helper scripts

These scripts generate dictionary data and example-word mappings used by Phonaria. Run `bun install` at the repo root first. Optional overrides go in `packages/helper-scripts/.env` (see `.env.example`).

## Dictionary and word data

| Command, from the repo root | Output |
| --- | --- |
| `bun run --cwd packages/helper-scripts cmudict-to-json` | `packages/phonetics-data/data/en/dict/cmudict.json` |
| `bun run --cwd packages/helper-scripts cmudict-stats` | Dictionary coverage statistics |
| `bun run --cwd packages/helper-scripts generate-word-mappings` | `packages/audio-gen/data/cmu-arpa-mappings.json` |
| `python3 packages/helper-scripts/generate-curated-chunks.py` | Top-1k and top-10k pronunciation lists in `packages/phonetics-data/data/en/curated/` |

`cmudict-to-json` requires `CMUDICT_SRC_URL` and accepts `CMUDICT_JSON_PATH` as an output override. Generate the dictionary JSON before word mappings or curated lists. The curated-list script needs Python's `wordfreq` package (`python3 -m pip install wordfreq`). Its outputs contain word-frequency data with CC-BY-SA 4.0 attribution; CMUDict retains its own license.

The mappings script gathers example words from `@phonaria/phonetics-data` and records their CMU ARPABET and IPA pronunciations for audio generation. It reads `CMUDICT_JSON_PATH` when set, otherwise the default dictionary JSON above.

## Checks

```bash
bun run --cwd packages/helper-scripts check-types
bun run --cwd packages/helper-scripts lint # applies Biome fixes
```
