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
