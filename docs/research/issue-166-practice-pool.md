# Curated Practice schwa pool for issue #166

Approved and implemented on 2026-10-17. Dry run only: no Azure calls, recordings,
uploads, manifest changes or Practice UI changes were made by this work.

## Approved inventory and provenance

`packages/phonetics-data/src/languages/en/practice-schwa.ts` pins all 360 approved
words with exact Phonaria tokens and stress. Both Practice and audio-gen import
that package subpath. The list was approved from the 2026-10-17 editorial report
prepared against commit `577f9810fc18ce8d9c4f165db78fdf62a251a3a1`.
Its temporary evidence was `/tmp/phonaria-practice-pool/report.md`,
`candidates.csv`, `candidate-variants.json` and `borderline.csv`; the tracked list
and this record preserve the decision after those files disappear.

Original candidate CSV SHA-256:
`8138194e0de34924a3d9f8daaad43e29e4ed78cca7d574919b5bf3888734980e`.
Original exact-variant JSON SHA-256:
`2080f27606224d5f29cfd2d9c6f42beb2df5a2514c1457399f2c56c2b8bd8aef`.

Selection began with 3,373 words derived from the bundled top-10k dictionary.
The approved set has at least two syllables, exactly one stored pronunciation
(including stress), explicit AX0, and 0-based rank below 5,000, with six teaching
exceptions: adopt (5,131), lemon (6,004), banana (7,008), adapt (7,218), vanilla
(8,982), sofa (9,390). There are 66 top-1k words, 288 further top-5k words and
six exceptions. Ranks refer to Phonaria’s frequency-ordered, CMU-covered list.
The shortlist favors clear schwa placements and everyday neutral vocabulary,
limits related forms, and excludes names, brands, nationality labels, sensitive
contexts, abbreviations and informal fragments for this launch.

The 11 held words remain excluded: chocolate, comfortable, people, little,
button, museum, navigation, tomato, umbrella, temperature and different.
Their holds concern alternate stress, sound sequences, syllable counts or common
syllabic-consonant realizations. A single stored form is a recording reference,
not a claim that real speech has only one realization.

| Exact syllables | Approved words | Editorial floor |
| --- | ---: | ---: |
| 2 | 131 | 100 |
| 3 | 136 | 100 |
| 4 | 79 | 60 |
| 5 | 14 | — |
| Total 4+ | 93 | 80 |

The five session bands remain 2, 2–3, 3, 3–4 and 4+ syllables, with effective
pool depths 131, 267, 136, 215 and 93. These replace the old >200-per-band rule,
which would require at least 603 words. The set has 268 one-schwa, 83 two-schwa
and nine three-schwa words. Facets use the pinned form; rank retains its original
full-dictionary position. Any missing, ambiguous or changed dictionary form
stops loading and generation rather than silently changing the inventory.
Scoring and reveal receive exactly `[pinnedVariant]`.

The original seeded 100,000-session simulation measured 8.76% adjacent-session
overlap and a busiest-word appearance rate of 3.963%. A regression simulation
uses the effective loaded pool and bounds these at 12% and 5%, while checking
band membership, reference identity and no within-session duplicates. Sessions
remain memoryless: these are variety checks, not a promised repeat interval.

The source pronunciations derive from the existing bundled CMU public-domain
dictionary; frequency order derives from wordfreq under CC-BY-SA 4.0. Existing
source attribution remains in the dictionary assets and package documentation.

## Checked syllables and recording batch

`--source=practice` validates all 360 entries, requires matching catalog overlaps,
and excludes adapt/adopt, producing exactly 358 new recordings. It preserves the
catalog and spelling sources. All 358 inputs have explicit token-preserving
syllables, stress and one IPA phoneme tag. This branch already had checked splits
for away, lemon, nation, sofa and vision from #304, so 353 additional table entries
were needed; the two catalog overlaps also retain their existing splits.

Boundaries were reviewed using maximal legal American English onsets, while
preserving suffix boundaries such as assess/ment, use/ful, success/ful and
serious/ly. Dictionary pronunciation boundaries were checked against
[Merriam-Webster assessment](https://www.merriam-webster.com/dictionary/assessment),
[useful](https://www.merriam-webster.com/dictionary/useful),
[successful](https://www.merriam-webster.com/dictionary/successful),
[seriously](https://www.merriam-webster.com/dictionary/seriously),
[familiar](https://www.merriam-webster.com/dictionary/familiar),
[annual](https://www.merriam-webster.com/dictionary/annual),
[environment](https://www.merriam-webster.com/dictionary/environment) and
[visual](https://www.merriam-webster.com/dictionary/visual).
ER0 remains one rhotic vowel token (/ɚ/), including before another vowel; it is
never rewritten into AX0 + R. Primary and secondary stress stay exactly as pinned.
No unresolved syllable-boundary decisions remain for these token sequences.
The recordings still require human listening approval, especially reduced
syllables and rhotic-vowel transitions; a dry run cannot establish naturalness.

The five words away, lemon, nation, sofa and vision also occur in the unrecorded
#304 spelling batch. Coordinate those batches before uploading: this source
intentionally deduplicates against the catalog, not an unpublished spelling plan.
The existing adapt/adopt clips must also have their reference and listening
acceptance verified before the full Practice audio rollout.

## Orchestrator generation and upload

From the repository root, generate with Jenny at −10%, matching the catalog.
This paid command has **not** been run:

```bash
WORDS_LIMIT= AZURE_SPEECH_VOICE=en-US-JennyNeural \
  bun run --cwd packages/audio-gen generate \
  --source=practice --limit=358 --rate=-10 --format=ogg --rpm=20 \
  --out=output/azure-practice-166-jenny-slower-10-ogg
```

Resume an interrupted run using the saved plan (omit source and limit):

```bash
WORDS_LIMIT= AZURE_SPEECH_VOICE=en-US-JennyNeural \
  bun run --cwd packages/audio-gen generate --resume \
  --rate=-10 --format=ogg --rpm=20 \
  --out=output/azure-practice-166-jenny-slower-10-ogg
```

Listen to and accept every clip in `review.tsv` before publishing. Sign in using
the app’s pinned Wrangler as described in the audio-gen README. Validate locally:

```bash
bun run --cwd packages/audio-gen upload \
  --out=output/azure-practice-166-jenny-slower-10-ogg \
  --accent=en-us --voice=jenny --bucket=rigos-assets --concurrency=8 --dry-run
```

The orchestrator can then publish the accepted batch by removing `--dry-run`.
After a verified upload, the orchestrator merges the batch into the existing
manifest, retaining the existing catalog recordings:

```bash
bun run --cwd packages/audio-gen manifest \
  --out=output/azure-practice-166-jenny-slower-10-ogg
```

The 400 catalog words plus the 360 Practice words cover 758 unique identities;
any separately published spelling additions remain preserved. This change adds
no Practice words to the app manifest.

## Local verification

Credential-free dry run: `/tmp/phonaria-practice-dryrun/plan.json`, `review.tsv`
and `verification.json`. Exactly 358 unique planned samples, one explicit phoneme
tag each, zero errors and zero recordings. The CLI ran directly with Bun’s
`--no-env-file` and `DOTENV_CONFIG_PATH=/dev/null`.

The before/after catalog plans (400 entries) and spelling plans (88 entries)
are identical after removing only `createdAt`; every sample and setting matches.
Evidence is in the dry-run directory’s `verification.json`, with baseline plans
under `/tmp/phonaria-166-{catalog,spelling}-{before,after}/`.

- `bun run test`: all five workspace test tasks passed, 1,754 tests total
  (832 phonetics-data, 185 audio-gen, 710 app, 22 browser-contract unit tests,
  five flags tests). This includes the 100,000-session simulation.
- `bun run check-types`: all seven packages passed.
- `bun lint`: passed; `git diff --check` passed.
- Independent comment check: two comments deleted, one public contract tightened,
  one kept; no open findings.

No browser journey or listening review was run. Practice UI/audio playback is
owned by the separate integration workstream; these checks cover the inventory,
loader, session/scoring reference and generation plan.
