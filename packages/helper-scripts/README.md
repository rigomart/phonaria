# Helper scripts

These scripts generate dictionary and word-list data used by Phonaria. Run `bun install` at the repo root first. Optional overrides go in `packages/helper-scripts/.env` (see `.env.example`).

## Dictionary and word data

| Command, from the repo root | Output |
| --- | --- |
| `bun run --cwd packages/helper-scripts cmudict-to-json` | `packages/phonetics-data/data/en/dict/cmudict.json` |
| `bun run --cwd packages/helper-scripts cmudict-stats` | Dictionary coverage statistics |
| `bun run --cwd packages/helper-scripts cmudict-to-sqlite` | `packages/phonetics-data/data/en/dict/cmudict.db`, a SQLite copy of the dictionary for Turso import (`-- --max N` writes the first N words to `cmudict-N.db`) |
| `python3 packages/helper-scripts/generate-curated-chunks.py` | Top-1k and top-10k pronunciation lists in `packages/phonetics-data/data/en/curated/` |
| `python3 packages/helper-scripts/generate-phoneme-frequency.py` | Each sound's share of everyday speech, `packages/phonetics-data/data/en/phoneme-frequency.json` |
| `bun run --cwd packages/helper-scripts generate-common-words` | Each sound's common words for its page, `packages/phonetics-data/data/en/common-words.json` |

`cmudict-to-json` requires `CMUDICT_SRC_URL` and accepts `CMUDICT_JSON_PATH` as an output override. The importer validates raw CMU notation and stores internal Phonaria IDs with vowel stress. Malformed pronunciation tokens stop generation with the word and source line, before writing output. Statistics, SQLite export, and curated-list generation also reject invalid stored pronunciations instead of skipping sounds. Generate the dictionary JSON before curated lists. The curated-list script uses Bun to validate its source through the shared TypeScript parser and needs Python's `wordfreq` package (`python3 -m pip install wordfreq`). Its outputs contain word-frequency data with CC-BY-SA 4.0 attribution; CMUDict retains its own license.

The phoneme-frequency script reads the curated top-10k list, so regenerate that first. For each sound it writes its share of everyday speech (words weighted by their wordfreq frequency, first pronunciation only) and its rank. The file has no timestamp: the same inputs and `wordfreq` version reproduce it exactly. See `docs/research/issue-287-phoneme-frequency.md` for the method and numbers.

The common-words script reads the curated top-1k list, so regenerate that first. For each sound it keeps the six most frequent words where the sound starts the word, sits inside it, or ends it, in the word's first pronunciation. It skips contractions, single letters and one-sound words, and leaves out the words in `src/utils/editorial-flags.ts` plus a short list of words that need a capital letter (months, places, nationalities) and abbreviations. It also skips a word whose main recording in `word-audio.json` was made from another pronunciation (the verb "use" rather than the noun), so each play button sounds like the list says. Like the frequency file, it has no timestamp.

## Minimal-pair candidates

| Command, from the repo root | Output |
| --- | --- |
| `bun run --cwd packages/helper-scripts find-minimal-pairs` | `packages/helper-scripts/output/minimal-pair-candidates.{json,md}` (git-ignored) |

The script proposes minimal pairs from the curated top-10k list for a person to review before adding any to the contrast catalog. It never edits the catalog. By default it covers every contrast already in the catalog. Pass `--contrast I-IX` (repeatable, phoneme IDs) to check other contrasts, and `--limit N` to change how many pairs each contrast shows (default 40).

Words must be alphabetic, at least 3 letters, and have one pronunciation. Homophones are grouped under their most frequent spelling. Pairs are sorted so that pairs of common words come first. The Markdown review sheet has a checkbox per pair and flags likely-bad words (profanity, interjections, first names) without removing them.

## Checks

```bash
bun run --cwd packages/helper-scripts check-types
bun run --cwd packages/helper-scripts lint # applies Oxlint fixes and Oxfmt formatting
```

The generator parsing regressions run in `bun run --cwd packages/audio-gen test`. The Python curated-list boundary and the phoneme-frequency computation are checked with `python3 -m unittest discover -s packages/helper-scripts -p 'test_*.py'` (no `wordfreq` installation needed for tests).
