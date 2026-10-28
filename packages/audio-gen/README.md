# Word pronunciation audio

Azure Speech is the sole generator for issue #274. By default it reads all 400 unique words
in the minimal-pair catalog and the bundled curated dictionary directly. The explicit
`--source=spelling` option selects the 88 unique spelling example words instead. It
requests one Ogg/Opus file per word. `--source=practice` selects the 358 pinned schwa
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
- **/ɔ/ over /ɑ/**: when two forms differ only in one vowel, /ɑ/ in one and /ɔ/
  in the other (*caught* `K A1 T`, `K O1 T`), and the spelling marks a THOUGHT or
  CLOTH word (*au*, *aw*, *augh*, *ough*; *a* + *l* + consonant; *o* before *s*,
  *f*, *th*, *g* or *ng*), the /ɔ/ form takes the /ɑ/ form's place before the
  rule runs (`preferOForms` in `@phonaria/phonetics-data`). The reason starts
  "/ɔ/ form of the …". LOT words (*lot*, *doctor*), *o* before *n* (*on*) and
  *wa-* words (*want*) keep CMU order, and so do the exceptions in
  `OFormExceptions` (*gospel*, *mosque*). The app shows the same form (#365).
  This changed 2 top-1k and 21 top-10k picks; their retakes are in
  `output/top-1k-retakes-o2/` and `output/top-10k-retakes-o2/` (the earlier
  `-retakes-o` folders used a broader rule and are superseded), and the old
  clips for those words must stay out of the upload.
- **Syllables** (`syllables`): checked splits come first (`checked`). Otherwise
  each vowel takes the longest onset English allows (`rule`). Before an
  unstressed vowel, /s/ + nasal or /l/ splits (*assess.ment*), and /tw/, /dw/ split
  unless primary stress follows (*net.work*, *be.tween*). The rule reproduces
  every checked split. Two adjustments come from the #353 probes, because Azure
  says a /t/ that starts a syllable as a full /t/ more often:
  - A /t/ between a stressed vowel and an unstressed one ends the stressed
    syllable (/ˈdæt.ə/, not /ˈdæ.tə/), so it taps. Before syllabic /n/
    (*button*) it stays put, where Azure already gives the glottal /t/.
  - Compounds whose first word ends in /p t k/ before a stressed vowel get a
    hand-checked split at the word boundary in `compoundSyllables`
    (/ˌwʌt.ˈɛ.vɚ/, not /ˌwʌ.ˈtɛ.vɚ/), so the stop isn't aspirated.
- **Left out**: heteronyms listed in `src/curated-words.ts` (*read*, *record*,
  *live*), contractions and possessives, abbreviations without a vowel letter,
  and single letters other than *a* and *i*. `src/excluded-words.ts` lists the
  rest, each with a note (#360): fragments (*sci*, *re*, *los*, *lanka*),
  abbreviations said letter by letter (*usa*, *dna*), and written abbreviations
  (*jan*, *inc*). Real words, interjections, names and acronyms said as words
  stay in (*etc*, *nasa*, *ok*). A saved plan keeps the words it already has, so
  it still resumes; its clips of excluded words must stay out of the upload.

When a probe or listening sample shows a wrong pick, add the word to
`curatedPronunciations`. A wrong split goes in the checked syllables in
`src/word-inputs.ts`.

A one-syllable input carries no stress mark (/it/), and Azure sometimes reduces
the vowel: *eat* came out as "feet" and *i* as /eɪ/, take after take (#358).
`stressedOneSyllable` in `src/word-inputs.ts` lists the form files that write the
mark (/ˈit/), each with its reason, which the plan records as `stressWritten`.
Add a word only after a retake with the same input fails again; changing the rule
for every one-syllable word would change thousands of saved requests.

The top-10k includes the top-1k words. To plan the top-10k without the clips the
top-1k batch already has, point `--skip-generated` at that batch:

```bash
bun run --cwd packages/audio-gen generate --dry-run --source=top-10k \
  --skip-generated=output/top-1k-jenny-slower-10-ogg --out=output/top-10k-jenny-slower-10-ogg
```

The new plan leaves out every sample, form files such as `read--2` included,
that the other plan has as `generated`; its planned or failed samples stay in.
It refuses a plan with a different voice, speed or format, a generated sample
whose request differs, and a clip whose checksum no longer matches. `plan.json`
records each skipped directory, relative to the new plan, and how many samples
it covered under `skippedGenerated`.

### More than one form of a word

Some words get more than one recording, listed in `src/word-forms.ts`:

- **Heteronyms** (*read*, *record*, *minute*): one recording per meaning, each
  with a label such as *past tense* or *noun*. The more common meaning gets the
  plain file name.
- **"Also said" forms** (*either* /ˈaɪðɚ/, *data* /ˈdætə/): forms US speakers
  really use, recorded beside the chosen one.

The first form keeps the plain file name (`minute.ogg`), and each extra form adds
its number (`minute--2.ogg`). A number is assigned once and never reused,
because published keys must keep their sound. The manifest lists each uploaded form
with its label, and the app shows every form only where a word is looked up; minimal
pairs, Practice reveals and spelling examples play the main form.

`src/form-candidates.ts` finds the dictionary forms worth reviewing: the main
stress moves, or a stressed vowel changes beyond a common US merger (cot–caught,
marry–merry, pin–pen and others). Elisions, weak forms, consonant changes and
unstressed vowels never qualify. A test fails until every candidate is either
listed in `word-forms.ts` or rejected with a reason in `rejectedForms`.

Azure pads short Ogg clips to 1.8265 s (15,042 bytes), so a duration check has
to measure the speech, not the file.

### Probes and automatic checks

Before the top-10k is generated, the dev listens to a probe set and the automatic
checks run on the same clips (#353). `src/top-10k-probes.ts` lists about 100 words,
each with the risk it covers: rule splits from 2 to 7 syllables, compounds split at
one consonant, rule pronunciation picks (function words, odd first forms, syllable
counts), r-coloured vowels, syllabic consonants, /ʒ/ and /ɔɪ/, the vowel pairs Azure
blurs, and second forms. Each sample's `pickedFor` records why.

```bash
bun run --cwd packages/audio-gen generate --source=top-10k-probes --out=output/top-10k-probes-1
bun run --cwd packages/audio-gen listen --out=output/top-10k-probes-1
bun run --cwd packages/audio-gen check --out=output/top-10k-probes-1 \
  --known-good=output/published/catalog --known-good=output/published/practice-166 \
  --known-good=output/published/spelling-304
```

`listen` writes `listen.html`: play each clip, mark it yes or no with a note, and
download the filled `review.tsv` over the old one. It shows why each word was picked,
never the check results, so the marks stay blind to them.

`check` runs every check on each generated clip and writes `checks.json`, `checks.tsv`
(each check's numbers) and `checks.md`. The checks:

- **word-heard**: Azure's plain recognition hears the word, or words that sound like
  the clip's own pronunciation (*red* for *read--2*). Between vowels /t/ and /d/ count
  as one sound, since both tap (*riding* for *writing*).
- **no-swapped-sound**: the speaking-feedback judge, with its tuned thresholds and every
  sound judged against the clip's own pronunciation, finds no sound `swapped`.
- **word-accuracy**: Azure's whole-word accuracy is at least the cutoff.
- **duration**: the speech, measured from the waveform, is 0.65–1.5× the 279 ms + 60 ms
  per sound that the published clips average.
- **edges**: at least 100 ms of silence before the word and 300 ms after, so neither
  end is cut off.
- **loudness**: the speech level is within 5 dB of the batch's median.
- **clipping**: fewer than 5 samples at full scale.

The limits live in `CLIP_CHECK_LIMITS` in `src/clip-checks.ts`. The audio ones come from
the 809 published clips, which were all reviewed by ear and pass every audio check. The
word accuracy cutoff is set from the probes.

Once `review.tsv` is marked, `checks.md` compares the checks with the marks: rejected
clips each check caught, rejected clips that passed everything (misses), and accepted
clips flagged (false alarms). `--known-good` folders are only read, to count false
alarms on clips already accepted by ear. A missing tap passes every check, since
the judge accepts a tap and a full /t/ alike; it is prevented in the input instead. Copy the published output folders there
(`plan.json` and `audio/`) rather than pointing at the originals.

Scoring reuses the pronunciation harness: the same Azure scorer, two calls per clip,
with raw answers cached in `output/cache` by WAV bytes and request. A rerun costs no
calls, and copying the harness's `output/cache/azure` folder in makes the catalog clips
free. `--offline` uses only the cache. The clips and scores are never used to train
anything (Microsoft's terms).

### A batch, from generation to upload

```bash
bun run --cwd packages/audio-gen generate --source=top-1k --out=output/top-1k-jenny-slower-10-ogg
bun run --cwd packages/audio-gen check --out=output/top-1k-jenny-slower-10-ogg
bun run --cwd packages/audio-gen sample --out=output/top-1k-jenny-slower-10-ogg
bun run --cwd packages/audio-gen listen --out=output/top-1k-jenny-slower-10-ogg
# mark every clip on listen.html, save review.tsv over the old one
bun run --cwd packages/audio-gen upload --out=output/top-1k-jenny-slower-10-ogg \
  --accent=en-us --voice=jenny --dry-run
```

`sample` writes the batch's review sheet, `sample.tsv`: the clips to listen to, each with
its `reason`, and the check results behind it in `detail`. Most check flags are
recogniser habits rather than bad clips, so a rule calibrated on the dev's marks of 1,251
clips (#358) picks the flagged clips worth hearing:

- word-heard and no-swapped-sound both failed;
- word-heard failed and recognition heard a genuinely different word, not a habit: no
  speech, a word that sounds the same in the full CMU dictionary, *un-X* heard as "and X",
  one vowel swapped within a pair it blurs (ɪ–ɛ, æ–ɛ, ɑ–ʌ, u–ʊ, i–ɪ, ɔ–ɑ, ɔ–ʌ), or a /t/
  or /d/ added or dropped after the first sound (*patients* for *patience*);
- an audio check failed, or Azure's checks didn't run;
- the clip is a second form (`read--2`).

Then it adds 20 of the flagged clips the rule lets through, 15 passed clips from each risk
group (rule syllable splits, rule pronunciation picks, each vowel pair Azure blurs,
r-coloured vowels, and a /t/ that `closeTapSyllables` made tap), and 150 more passed clips
at random. `--seed` (default 358) fixes the draw. Samples the current code would plan
differently are left out, since upload leaves them out too. `sample --adopt=<list.tsv>`
takes a hand-built list instead (a `file` column, and a `reason` or `picked_for` column).
`sample` needs every sample generated and checked. It also writes `sample.json`, which
records how the sheet was chosen and hashes of the plan's samples and of `checks.json`.
An existing sheet is replaced only with `--force`, because the dev may have marked it.

`listen` shows the sheet when the batch has one, otherwise the whole plan.

`upload` refuses a batch until `checks.json` covers every clip, the plan and checks
still match what `sample.json` recorded (otherwise draw or adopt the sheet again with
`--force`), and every clip on the sheet is marked yes or no in `review.tsv`, with one row
per file. It uploads every other clip except those marked no and those the current code
would no longer plan the same way: the request changed (a stress mark or an /ɔ/ form),
the form was dropped, or the source now excludes the word (a fragment). The dry run and
the upload record list each left-out clip and why.

A clip that needs a retake goes in its own batch, generated with `--words` into a new
folder, then checked, sampled, listened to and marked like any other. Upload it in the
same run as the batch it fixes, with one `--out` per batch:

```bash
bun run --cwd packages/audio-gen upload --out=output/top-1k-jenny-slower-10-ogg \
  --out=output/top-1k-retakes-2 --accent=en-us --voice=jenny --dry-run
```

Two batches may not publish the same key in one run: mark the clip you don't want no.
A batch uploaded in a later run can replace a published key only with `--overwrite`.
Upload a batch and its retakes before running `manifest`. Once the manifest lists a
word, the source no longer offers it, so upload leaves its clips out as `already
recorded`. That usually means an earlier run uploaded part of the batch, so upload
refuses such a run unless `--skip-recorded` is passed; the dry run reports them either way.

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
The pinned 360-word schwa Practice pool, 358-word generation batch and handoff commands
are recorded in [issue #166](../../docs/research/issue-166-practice-pool.md). The strut and
r-colored vowel lists need no batch of their own: every word on them was recorded with the
top-10k words. Options:

- `--dry-run`: write a plan and review sheet without calling Azure.
- `--source=catalog|spelling|practice|top-1k|top-10k|top-10k-probes`: select a named word set; defaults to `catalog`.
- `--words=seat,seed`: select words within that source; this cannot add arbitrary words.
- `--limit=24`: limit the selection; the default catalog order is alphabetical, and
  curated tiers are in frequency order.
  The older `WORDS_LIMIT` environment variable also works; unset it for a full run.
- `--skip-generated=path`: leave out samples another plan directory has already
  generated with the same voice, speed and format. Repeat it for more directories.
  New plans only, so omit it on resume.
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
requests. This accommodates the free tier's 20 requests per minute. A network
error (the request is rejected or times out, or the audio download breaks off)
is retried on the same word after 15 seconds, up to 3 attempts in all, with one
console line per retry. Any HTTP error such as 429, 401 or 5xx, an unexpected
audio type, empty audio, or a third network error stops the run and preserves
completed recordings. HTTP errors are never retried. Check Azure usage or wait
for quota to recover, then resume. See [Azure Speech quotas](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits)
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

To upload a checked, marked output directory (see "A batch, from generation to upload"),
run from the repo root. Use the app's pinned Wrangler (`wrangler` is not installed
globally) and sign in first:

```bash
WRANGLER="$PWD/apps/phonaria/node_modules/.bin/wrangler"
"$WRANGLER" login
bun run --cwd packages/audio-gen upload \
  --out=output/top-1k-jenny-slower-10-ogg \
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
plan are uploaded. Dry run prints every exact key ↔ file mapping and every left-out
clip with its reason after local validation, makes no network or Wrangler calls, and
writes no upload record.
A generation dry-run plan is unfinished and cannot pass this validation.

Before any upload, public HEAD requests to `https://assets.rigos.dev/<key>`
check every destination. HTTP 200 refuses the batch unless `--overwrite` is
explicit; only HTTP 404 counts as absent, and other responses stop the batch.
After each upload, HEAD must return 200, the expected content-type and exact
content-length. Any upload or verification failure exits non-zero. Each run
writes an `upload-<timestamp>-<id>.json` beside each batch's `plan.json`, including
bucket, the batches, key, file, size, SHA-256, upload time, verification result, and
any error for each attempt, and each left-out clip with its reason. These records are checkpoints after each attempt and never replace a
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
`packages/phonetics-data/data/en/word-audio.json`, which the app loads on demand
and reads through `getWordAudioPath()` and `getWordAudioForms()`. The command below writes that
file; don't edit it by hand. After uploading, regenerate it from the repo root,
with one `--out` per batch uploaded together:

```bash
bun run --cwd packages/audio-gen manifest --out=output/top-1k-jenny-slower-10-ogg \
  --out=output/top-1k-retakes-2
```

The manifest lists only the clips that went up. It reads them from the upload
records in each folder, not from `plan.json`: a clip counts when a record has a
verified entry with its key and SHA-256, so clips marked no, left out, or whose
upload failed stay out. A run's record lands in every batch of the run; entries for
another batch's clips don't match this plan and are skipped. A folder with no
record, or whose records verify none of its clips, is refused.

- `words` holds every word whose plain `word.ogg` went up.
- `forms` lists, by word, every clip that went up of a word recorded more than once,
  with its label and the pronunciation the plan generated it from:
  `"read": [{ "label": "present tense", "pronunciation": "R I1 D" }, { "n": 2, "label":
  "past tense", "pronunciation": "R E1 D" }]`.
  An entry without `n` is the main recording; form `n` is `word--n.ogg`. An "also
  said" word's main entry has no label. The main pronunciation need not be the
  dictionary's first (*read* lists /ɹɛd/ first), so the Transcription popover matches
  the selected variant against it to pick the first button (#378).

The command merges into the existing manifest, keeping every word and form already
listed. It refuses to mix voice folders or accents, a plan that isn't Ogg, and a form
whose label or pronunciation differs from the one already listed, a main clip included,
whichever batch comes first. Running it again on the same batches
writes the same bytes. The phonetics-data tests require full minimal-pair catalog
coverage and allow additional recorded spelling examples.

Records from before #373 hold only `bucket`, `startedAt` and `entries`; they're read the
same way, so the spelling and Practice batches still work. The minimal-pair catalog was
uploaded by hand and has no record. For a batch like that, `record-published` writes
one: it downloads each of the plan's clips from `https://assets.rigos.dev` and marks it
verified only if the bytes match the plan's SHA-256, then exits non-zero if any don't.

```bash
bun run --cwd packages/audio-gen record-published \
  --out=output/azure-catalog-jenny-slower-10-ogg --accent=en-us --voice=jenny
```

Its record has `checked` (the public host) in place of `bucket`, and no upload times.
On copies of the three published batches, the catalog's 400 clips all matched, and
`manifest` with all three rebuilt the committed JSON byte for byte from an empty one.

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

## Checks

```bash
bun run --cwd packages/audio-gen test
bun run --cwd packages/audio-gen check-types
bun run --cwd packages/audio-gen lint
```

Provider reference: [Azure phoneme tags and stress](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation).
