# Word pronunciation audio

Azure Speech is the sole generator for issue #274. It reads all 400 unique words
in the minimal-pair catalog and the bundled curated dictionary directly. It
requests one Ogg/Opus file per word. The selected catalog configuration is Jenny
(`en-US-JennyNeural`) at 10% slower, with default pitch and delivery. This
configuration lives in the tracked `catalog-config.json`. Ogg/Opus balances
speech quality and file size; Azure produces it directly at 24 kHz, mono.
Environment variables and command flags can override the catalog defaults.

Every word has an explicit IPA phoneme tag. Missing, ambiguous, or unsupported
dictionary pronunciations stop generation. The 16 multisyllabic catalog words
have checked syllable boundaries tied to their exact dictionary tokens, with
stress preserved. New multisyllabic words require an entry in
`src/word-inputs.ts`; changing a pronunciation requires checking its syllables
again. Unstressed `ER0` is spoken as /ɚ/. The CMU ARPAbet form is retained as a
pronunciation reference in the plan.

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

Omitting selection options plans or generates the whole catalog. Options:

- `--dry-run`: write a plan and review sheet without calling Azure.
- `--words=seat,seed`: select catalog words.
- `--limit=24`: limit the selection; the default catalog order is alphabetical.
  The older `WORDS_LIMIT` environment variable also works; unset it for a full run.
- `--out=path`: choose an output directory, relative to `packages/audio-gen`.
  The default is a fresh `output/azure-<timestamp>/` directory.
- `--resume --out=path`: use an existing plan, skipping completed recordings.
  Omit word selection and limit options, including `WORDS_LIMIT`, on resume.
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
The tool never uploads audio or publishes an application manifest.

Generated output is ignored by Git. When using a temporary worktree, move the
completed output directory into the original checkout before removing the
worktree. Keep the plan, review sheet, and recordings together so the next
agent can verify the files and upload them without generating them again.

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
