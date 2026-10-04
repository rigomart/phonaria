# Helper scripts

These scripts generate dictionary data and word-mapping reports used by Phonaria. Run `bun install` at the repo root first. Optional overrides go in `packages/helper-scripts/.env` (see `.env.example`).

## Dictionary and word data

| Command, from the repo root | Output |
| --- | --- |
| `bun run --cwd packages/helper-scripts cmudict-to-json` | `packages/phonetics-data/data/en/dict/cmudict.json` |
| `bun run --cwd packages/helper-scripts cmudict-stats` | Dictionary coverage statistics |
| `bun run --cwd packages/helper-scripts generate-word-mappings` | `packages/audio-gen/data/cmu-arpa-mappings.json` |
| `python3 packages/helper-scripts/generate-curated-chunks.py` | Top-1k and top-10k pronunciation lists in `packages/phonetics-data/data/en/curated/` |

`cmudict-to-json` requires `CMUDICT_SRC_URL` and accepts `CMUDICT_JSON_PATH` as an output override. The importer validates raw CMU notation and stores internal Phonaria IDs with vowel stress. Malformed pronunciation tokens stop generation with the word and source line, before writing output. Statistics, phoneme search-index, SQLite export, and curated-list generation also reject invalid stored pronunciations instead of skipping sounds. Generate the dictionary JSON before curated lists. The word-mapping report can use the bundled curated dictionary directly. The curated-list script uses Bun to validate its source through the shared TypeScript parser and needs Python's `wordfreq` package (`python3 -m pip install wordfreq`). Its outputs contain word-frequency data with CC-BY-SA 4.0 attribution; CMUDict retains its own license.

The mappings script gathers only minimal-pair catalog words from `@phonaria/phonetics-data` and exports their actual CMU ARPAbet and IPA pronunciations. It uses the bundled curated top-10k dictionary by default; `CMUDICT_JSON_PATH` selects an explicit dictionary JSON override. Missing or ambiguous entries have no API pronunciation and cause a nonzero exit. This report is optional: `packages/audio-gen` now reads the catalog and curated dictionary directly.

## Minimal-pair candidates

| Command, from the repo root | Output |
| --- | --- |
| `bun run --cwd packages/helper-scripts find-minimal-pairs` | `packages/helper-scripts/output/minimal-pair-candidates.{json,md}` (git-ignored) |

The script proposes minimal pairs from the curated top-10k list for a person to review before adding any to the contrast catalog. It never edits the catalog. By default it covers every contrast already in the catalog. Pass `--contrast I-IX` (repeatable, phoneme IDs) to check other contrasts, and `--limit N` to change how many pairs each contrast shows (default 40).

Words must be alphabetic, at least 3 letters, and have one pronunciation. Homophones are grouped under their most frequent spelling. Pairs are sorted so that pairs of common words come first. The Markdown review sheet has a checkbox per pair and flags likely-bad words (profanity, interjections, first names) without removing them.

## Checks

```bash
bun run --cwd packages/helper-scripts check-types
bun run --cwd packages/helper-scripts lint # applies Biome fixes
```

The generator parsing regressions run in `bun run --cwd packages/audio-gen test` alongside the mapping-report tests. The Python curated-list boundary is checked with `python3 -m unittest discover -s packages/helper-scripts -p 'test_*.py'` (no `wordfreq` installation needed for tests).
