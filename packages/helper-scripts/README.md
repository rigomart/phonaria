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
| `python3 packages/helper-scripts/generate-spelling-shares.py` | Each sound's spellings ranked by share, `packages/phonetics-data/data/en/spelling-shares.json`, and a review sheet at `packages/helper-scripts/output/spelling-shares.md` (git-ignored) |

`cmudict-to-json` requires `CMUDICT_SRC_URL` and accepts `CMUDICT_JSON_PATH` as an output override. The importer validates raw CMU notation and stores internal Phonaria IDs with vowel stress. Malformed pronunciation tokens stop generation with the word and source line, before writing output. Statistics, SQLite export, and curated-list generation also reject invalid stored pronunciations instead of skipping sounds. Generate the dictionary JSON before curated lists. The curated-list script uses Bun to validate its source through the shared TypeScript parser and needs Python's `wordfreq` package (`python3 -m pip install wordfreq`). Its outputs contain word-frequency data with CC-BY-SA 4.0 attribution; CMUDict retains its own license.

The phoneme-frequency script reads the curated top-10k list, so regenerate that first. For each sound it writes its share of everyday speech (words weighted by their wordfreq frequency, first pronunciation only) and its rank. The file has no timestamp: the same inputs and `wordfreq` version reproduce it exactly. See `docs/research/issue-287-phoneme-frequency.md` for the method and numbers.

The common-words script reads the curated top-1k list, so regenerate that first. For each sound it keeps the six most frequent words where the sound starts the word, sits inside it, or ends it, in the word's first pronunciation. It skips contractions, single letters and one-sound words, and leaves out the words in `src/utils/unlisted-words.ts`: the editorial flags, names, other words that need a capital letter (months, days, nationalities) and abbreviations. It also skips a word whose main recording in `word-audio.json` was made from another pronunciation (the verb "use" rather than the noun), so each play button sounds like the list says. Like the frequency file, it has no timestamp.

## Spelling shares

The spelling-shares script matches the letters of each curated top-10k word to the sounds of its first pronunciation, taken in the order the app shows them (an /ɔ/ form first, `preferOForms`), so regenerate that list first. It needs `wordfreq` and Bun. The matcher (`spelling_alignment.py`) allows any run of vowel letters for a vowel, a fixed list of letter groups per consonant (doubled letters included), a few groups that spell two sounds (*x* in *box*, *o* in *one*), and any letter as silent. Among the matches it allows, it picks the one whose letter groups were most usual across all words in the previous round, over four rounds. Silent letters then join a neighbour (*is* in *island*, *st* in *listen*, *kn* in *know*, *olo* in *colonel*), except a silent *e* after a consonant, which stays on its own and makes a single vowel before it a split spelling (*a-e* in *make*). Words it can't match, mostly abbreviations and letter names, are left out and listed on the review sheet.

Each word counts as often as it is used (its wordfreq frequency), so the shares reflect speech. A spelling's share is its part of everything that spells the sound alone; letters spelling two sounds and silent letters are listed on the review sheet but not ranked. Spellings under 2% of their sound go under `other`. Each spelling keeps its most frequent word (`topWord`) and up to three words where the sound starts, sits inside and ends a word, with the spelling's letters in brackets. Example words need a recording made from the listed pronunciation, as audio-gen's `pickPronunciation` chose it (so *and*, recorded stressed, is no example of a schwa), and leave out the words in `src/utils/unlisted-words.ts` (the editorial flags, names, words always written with a capital, abbreviations). British spellings whose American spelling is also on the list (*colour*, *centre*, *grey*) are left out entirely. A silent *e* that ends the first word of a compound stays with it (*make|up*, *where|as*) when both parts are on the list. Like the frequency file, the output has no timestamp.

## Word-page words

| Command, from the repo root | Output |
| --- | --- |
| `python3 packages/helper-scripts/pick-word-pages.py` | The words that get a page at `/words/<word>`, `packages/phonetics-data/data/en/word-pages.json` and the words alone in `word-page-list.json`, and a review sheet at `packages/helper-scripts/output/word-pages.md` (git-ignored) |

The script picks common words whose spelling hides a sound, from the same matching and shares as the spelling-shares script. A candidate is a curated top-10k word (first pronunciation) with a recording made from that pronunciation, not in `NamesAndNonWords` (`src/utils/unlisted-words.ts`), that spells at least one sound in a way that is rare for it: under the 2% below which the sound pages list a spelling under "other spellings". A doubled consonant counts with its single letter (*nn* with *n*), and vowels without stress never count, since every vowel letter spells them. Candidates rank by how rare their rarest spelling is (−log of its share), times the square root of how often the word is used, so *enough* (a common word, *gh* at 1%) and *colonel* (a rarer word, *olo* at 0.04%) both make the cut. A candidate that is another candidate plus an ending (*-s*, *-es*, *-ed*, *-d*, *-ing*, *-ly*, *-er*) with the same rare spellings is left to that word (*friend*, not *friends*). The top 150 are kept. Each rare spelling in the list carries up to three other recorded words spelled that way, those with it in the same place in the word first; for a vowel only stressed matches count, as when picking (so *women* gets no *pers[o]nal*).

The list is generated, reviewed on the sheet, then committed. At review a word may be dropped by hand, only a name, a fragment or profanity the lists missed: a name goes in `ProperNames` in `src/utils/unlisted-words.ts`, so the sound pages leave it out of their examples too, and a fragment or profanity in the script's `REVIEW_DROPS` with the reason. A word is never added by hand. The sheet lists the kept words with their rare spellings and letters, the words left to a family member, the drops and the next 50 candidates, and checks a few known words (*enough*, *women*, *colonel*, *island* in; *will*, *and* out).

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

The generator parsing regressions run in `bun run --cwd packages/audio-gen test`. The Python curated-list boundary, the phoneme-frequency computation, the spelling matcher and shares, and the word-page picker are checked with `python3 -m unittest discover -s packages/helper-scripts -p 'test_*.py'` (no `wordfreq` installation needed for tests).
