# Word pronunciation audio

Azure Speech is the sole generator for issue #274. By default it reads all 400 unique words
in the minimal-pair catalog and the bundled curated dictionary directly. The explicit
`--source=spelling` option selects the 88 unique spelling example words instead. It
requests one Ogg/Opus file per word. `--source=practice` selects the 358 pinned
Practice words outside the catalog, checking exact pronunciation matches before
reusing the catalog’s adapt/adopt recordings. The selected catalog configuration is Jenny
(`en-US-JennyNeural`) at 10% slower, with default pitch and delivery. This
configuration lives in the tracked `catalog-config.json`. Ogg/Opus balances
speech quality and file size; Azure produces it directly at 24 kHz, mono.
Environment variables and command flags can override the catalog defaults.

Every word has an explicit IPA phoneme tag. Missing, ambiguous, or unsupported
dictionary pronunciations stop generation unless pinned in
`src/reviewed-pronunciations.ts`. That table records spelling-specific choices and
the three reviewed entries from bundled full CMU data that are absent from the
curated dictionary. It never changes catalog pronunciations. All 387 checked multisyllabic words
have checked syllable boundaries tied to their exact dictionary tokens, with
stress preserved. New multisyllabic words require an entry in
`src/word-inputs.ts`; changing a pronunciation requires checking its syllables
again. Unstressed `ER0` is spoken as /ɚ/. The CMU ARPAbet form is retained as a
pronunciation reference in the plan.

### Curated top-10k words (issue #353)

`--source=top-1k` and `--source=top-10k` select curated words that have no
recording yet, most frequent first. They replace hand input with rules, and the
plan records where each input came from:

- **Pronunciation** (`pronunciationChoice`): a choice reviewed in
  `curatedPronunciations` comes first (`reviewed`). A word with one dictionary
  form uses it (`only`). Otherwise the rule keeps the first form's syllable
  count, gives a one-syllable word its first stressed form (*the* → /ðʌ/, not
  /ðə/), and keeps the first dictionary form of longer words (`rule`). The
  reason names the forms it passed over.
- **Syllables** (`syllables`): checked splits come first (`checked`). Otherwise
  each vowel takes the longest onset English allows (`rule`). Before an
  unstressed vowel, /s/ + nasal or /l/ splits (*assess.ment*), and /tw/, /dw/ split
  unless primary stress follows (*net.work*, *be.tween*). The rule reproduces
  every checked split.
- **Left out**: heteronyms listed in `src/curated-words.ts` (*read*, *record*,
  *live*), contractions and possessives, abbreviations without a vowel letter,
  and single letters other than *a* and *i*.

When a probe or listening sample shows a wrong pick, add the word to
`curatedPronunciations`. A wrong split goes in the checked syllables in
`src/word-inputs.ts`.

### More than one form of a word

Some words get more than one recording, listed in `src/word-forms.ts`:

- **Heteronyms** (*read*, *record*, *minute*): one recording per meaning, each
  with a label such as *past tense* or *noun*. The more common meaning gets the
  plain file name.
- **"Also said" forms** (*either* /ˈaɪðɚ/, *data* /ˈdætə/): forms US speakers
  really use, recorded beside the chosen one.

The first form keeps the plain file name (`minute.ogg`), and each extra form adds
its number (`minute--2.ogg`). A number is assigned once and never reused,
because published keys must keep their sound. The manifest refuses labelled forms
until it can list them (#322).

`src/form-candidates.ts` finds the dictionary forms worth reviewing: the main
stress moves, or a stressed vowel changes beyond a common US merger (cot–caught,
marry–merry, pin–pen and others). Elisions, weak forms, consonant changes and
unstressed vowels never qualify. A test fails until every candidate is either
listed in `word-forms.ts` or rejected with a reason in `rejectedForms`.

Azure pads every Ogg clip to the same length (1.8265 s), so a duration check has
to measure the speech, not the file.

## Setup

Run `bun install` at the repository root. Set environment variables in your
shell, or copy `.env.example` to `packages/audio-gen/.env` and fill it locally:

| Variable | Meaning |
| --- | --- |
| `AZURE_SPEECH_KEY` | Key from your Azure Speech resource |
| `AZURE_SPEECH_REGION` | That resource's region, e.g. `eastus` |
| `AZURE_SPEECH_VOICE` | Optional en-US neural voice; defaults to Jenny |
| `AZURE_SPEECH_RATE_PERCENT` | Optional speed override; catalog defaults to -10 (10% slower) |
| `AZURE_SPEECH_FORMAT` | Optional `ogg` or `mp3` override; catalog defaults to Ogg/Opus |
| `AZURE_REQUESTS_PER_MINUTE` | Optional pacing; defaults to 20 |

Use the key and region from the same Speech resource. No SDK, Azure storage
account, or additional keys are needed. Credentials stay in the local
environment; they are never written to output plans.

## Commands

Run these from the repository root. Preview the full catalog without keys,
network calls, or new recordings:

```bash
bun run --cwd packages/audio-gen generate --dry-run --out=output/azure-catalog-jenny-slower-10-ogg
```

When ready to generate, use that saved plan:

```bash
bun run --cwd packages/audio-gen generate --resume --out=output/azure-catalog-jenny-slower-10-ogg
```

Or generate a small selection in a fresh directory:

```bash
bun run --cwd packages/audio-gen generate --words=seat,seed,adapt,adopt
```

Omitting selection options plans or generates the whole catalog. For the reviewed
56-word spelling batch and every pronunciation decision, see
[issue #304 review record](../../docs/research/issue-304-spelling-recordings.md).
The pinned 360-word Practice pool, 358-word generation batch and handoff commands
are recorded in [issue #166](../../docs/research/issue-166-practice-pool.md). Options:

- `--dry-run`: write a plan and review sheet without calling Azure.
- `--source=catalog|spelling|practice|top-1k|top-10k`: select a named word set; defaults to `catalog`.
- `--words=seat,seed`: select words within that source; this cannot add arbitrary words.
- `--limit=24`: limit the selection; the default catalog order is alphabetical, and
  curated tiers are in frequency order.
  The older `WORDS_LIMIT` environment variable also works; unset it for a full run.
- `--out=path`: choose an output directory, relative to `packages/audio-gen`.
  The default is a fresh `output/azure-<timestamp>/` directory.
- `--resume --out=path`: use an existing plan, skipping completed recordings.
  Omit source, word selection and limit options, including `WORDS_LIMIT`, on resume.
- `--rpm=20`: override request pacing for this run (1–600).
- `--rate=-10`: speak 10% slower. Integer percentages from -50 to 100 are
  supported; 0 keeps the voice's default delivery. Saved plans include any
  speed change, and resume requires the same speed.
- `--format=ogg`: generate Ogg/Opus. Use `--format=mp3` for earlier MP3 plans.
  A format change requires a fresh output directory; renaming files does not convert them.

Generation is sequential and defaults to a pause of at least 3.1 seconds between
requests. This accommodates the free tier's 20 requests per minute. An HTTP 429,
timeout, or other failure stops the run and preserves completed recordings;
there are no automatic paid retries. Check Azure usage or wait for quota to
recover, then resume. See [Azure Speech quotas](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits)
before increasing the pace for a paid resource.

## Outputs and review

Each directory contains:

- `plan.json`: dictionary pronunciation, exact request, voice, output format,
  per-word status, related pairs, and a SHA-256 checksum for each completed clip.
- `review.tsv`: listening checks for pronunciation, naturalness, intact word
  edges, comparable loudness, acceptance, and notes.
- `audio/<word>.ogg`: original 24 kHz mono Ogg/Opus from Azure. An MP3 override
  produces `.mp3` files at 24 kHz, 160 kbps, mono.

Resume checks that the voice, speed, format, pronunciation, request, and completed recordings
still match the saved plan. It preserves review notes and refuses to overwrite
files. Changing the voice or dictionary requires a fresh output directory.

A `.generation.lock` prevents two runs from using the same directory. After an
abrupt process termination, first make sure the old process has stopped, then
remove that directory's lock file and resume. If audio was saved just before the
process stopped but its status was not saved, the generator reports an untracked
recording and stops: preserve that file and start a fresh directory with only
the remaining words. Do not replace a completed clip in place.

Listen to every clip individually and beside its minimal-pair words. Check the
intended sounds and stress, natural delivery, intact initial and final
consonants, and comparable loudness. Mark acceptance only after listening.
Original clips remain untrimmed; any editing should preserve them separately.
Generation never uploads audio; use the separate upload command after review.

Generated output is ignored by Git. When using a temporary worktree, move the
completed output directory into the original checkout before removing the
worktree. Keep the plan, review sheet, and recordings together so the next
agent can verify the files and upload them without generating them again.

## Publishing recordings

Accepted recordings are served from the public `rigos-assets` R2 bucket
(`https://assets.rigos.dev`) as `audio/{targetAccent}/words/{voice}/{word}.ogg`.
The voice folder is the lowercase voice name, so Jenny's clips are
`audio/en-us/words/jenny/seat.ogg`. A new accent or voice gets a sibling folder.
The 400-word en-US Jenny set is uploaded.

To upload a completed, reviewed output directory, run from the repo root. Use the
app's pinned Wrangler (`wrangler` is not installed globally) and sign in first:

```bash
WRANGLER="$PWD/apps/phonaria/node_modules/.bin/wrangler"
"$WRANGLER" login
bun run --cwd packages/audio-gen upload \
  --out=output/azure-spelling-304-jenny-slower-10-ogg \
  --accent=en-us --voice=jenny --bucket=rigos-assets --concurrency=8 --dry-run
```

Remove `--dry-run` to publish. The command resolves the pinned Wrangler from the
repository root and always passes `--remote`; without it Wrangler only writes to
a local simulated bucket. `--out` is relative to `packages/audio-gen` (absolute
paths also work). `--bucket` defaults to `rigos-assets`, and `--concurrency`
defaults to 8 (1–32). `--accent` must equal the plan's target accent; `--voice`
must be lowercase and match the folder derived from the plan's voice, as used by
the manifest (`en-US-JennyNeural` → `jenny`).

The entire plan must be generated, with nonempty files whose SHA-256 checksums
match. Ogg plans publish `.ogg` with `audio/ogg`; MP3 plans publish `.mp3` with
`audio/mpeg` (the app manifest currently accepts Ogg only). No files outside the
plan are uploaded. Dry run prints every exact key ↔ file mapping after local
validation, makes no network or Wrangler calls, and writes no upload record.
A generation dry-run plan is unfinished and cannot pass this validation.

Before any upload, public HEAD requests to `https://assets.rigos.dev/<key>`
check every destination. HTTP 200 refuses the batch unless `--overwrite` is
explicit; only HTTP 404 counts as absent, and other responses stop the batch.
After each upload, HEAD must return 200, the expected content-type and exact
content-length. Any upload or verification failure exits non-zero. Each run
writes an `upload-<timestamp>-<id>.json` beside `plan.json`, including bucket,
key, file, size, SHA-256, upload time, verification result, and any error for each
attempt. These records are checkpoints after each attempt and never replace a
previous run's record. An uploaded but unverified object still exists; inspect
the record before retrying with `--overwrite`. The public hostname is fixed;
a different bucket must also be served there for these checks to be meaningful.

Object keys do not include rate or format, so a re-take of an existing voice
set should go to a new voice folder name (for example `jenny-2`) rather than
overwrite keys that browsers and Cloudflare may have cached. The current plan and
manifest derive the folder directly from the Azure voice name; a versioned folder
such as `jenny-2` needs explicit plan/manifest support before this command can use
it. `--voice` cannot silently redirect a Jenny plan into another folder.

The app only offers a play button for words listed in the committed manifest,
`packages/phonetics-data/src/languages/en/word-audio.ts`, read through
`getWordAudioPath()`. After uploading, regenerate it from the repo root:

```bash
bun run --cwd packages/audio-gen manifest --out=output/azure-catalog-jenny-slower-10-ogg
```

The command merges the completed batch into the existing manifest, retaining
every previously recorded word and refusing to mix voice folders. It refuses
to run unless every sample in `plan.json` is generated and an Ogg file, and
takes the voice folder from the plan's voice (`en-US-JennyNeural` becomes
`jenny`). The phonetics-data tests require full minimal-pair catalog coverage
and allow additional recorded spelling examples. Add new words only after upload.

## Voice and speed probes

The compact probe uses six words: seat/seed, sheep/ship, and adapt/adopt.
Probes retain MP3 output for compatibility with the existing listening pages;
catalog format overrides do not change them. Each configuration requests one
take per word. First compare Jenny, Aria,
Guy, and Christopher at their default speed, pitch, and delivery: 24 clips.

```bash
bun run --cwd packages/audio-gen probe --stage=voices --out=output/voice-probes
```

After choosing two voices, compare those at 10% and 20% slower: another 24 clips.
For example, if the shortlist is Aria and Guy:

```bash
bun run --cwd packages/audio-gen probe --stage=rates --voices=Aria,Guy --out=output/speed-probes
```

Both stages support `--dry-run`, `--resume`, and `--rpm`. Resume requires the
original output directory, stage, and shortlist. Word counts and speeds are
fixed by the stage, independent of `WORDS_LIMIT` or `AZURE_SPEECH_RATE_PERCENT`.
The tools preserve previous clips. Each configuration has its own plan,
recordings, and review sheet; `probe.json` records the comparison setup and
`index.html` provides a listening table. Open that HTML file in a browser,
or serve just the probe directory locally:

```bash
python3 -m http.server 8800 --bind 127.0.0.1 --directory packages/audio-gen/output/voice-probes
```

Then open `http://127.0.0.1:8800`. Only one clip plays at a time. Record listening
checks in the individual `review.tsv` files, then use the chosen voice and speed
for catalog generation. Speed changes use Azure's SSML `prosody` element without
changing the explicit IPA pronunciation.

## Existing recordings

Earlier local 24-word trials use the older plan format. Keep those recordings,
their original Azure plan entries, and review rows for listening and review
rather than passing them to `--resume`.

The optional dictionary audit remains available:

```bash
bun run --cwd packages/helper-scripts generate-word-mappings
```

It writes `data/cmu-arpa-mappings.json`; the generator does not depend on it.

## Checks

```bash
bun run --cwd packages/audio-gen test
bun run --cwd packages/audio-gen check-types
bun run --cwd packages/audio-gen lint
```

Provider reference: [Azure phoneme tags and stress](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation).
