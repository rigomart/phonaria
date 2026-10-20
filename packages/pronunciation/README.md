# @phonaria/pronunciation

Hears which sound a learner said. It holds the scoring contract, the judge and the scorers, and is source-imported with no build step. See [#324](https://github.com/rigomart/phonaria/issues/324) for the plan.

The work is split in two so a scorer can be replaced without touching the judge:

- A **scorer** takes a recording and a `ScoringRequest` (the target accent and the words said, each with its accepted pronunciations as base phoneme IDs) and returns `RecordingEvidence`, one `WordEvidence` per word. For each accepted pronunciation it could line up, a word's evidence has one entry per sound with its time span, the target's score and rival scores. A sound it couldn't line up is reported as `missing`. Audio is a 16 kHz mono 16-bit PCM WAV file as a `Uint8Array`.
- The **word gate**, `gateWord`, first checks that the recording holds the target word at all. A scorer told to expect *ship* scores whatever was said as *ship*, so without it *kid*, *ships* or "a ship" would get a sound verdict.
- The **judge**, `judgeWord`, is a pure function that turns one word's evidence into a verdict for each sound: `match`, `swapped` with the heard phoneme ID and the word that makes, or `unclear` with the reason it couldn't decide.

Practice starts with single words, sent as a list of one. Requests and evidence are lists so phrases can follow without changing the contract; judging across words (skipped words, weak forms, sounds that change at word boundaries) comes with them.

```ts
import { createWordFinder, gateWord, judgeWord } from "@phonaria/pronunciation";

const ship = { text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] };
const recording = await scorer.score(wav, { targetAccent: "en-us", words: [ship] });
const [evidence] = recording.words;

gateWord({ target: ship, evidence, transcript: recording.transcript, pronunciationsOf, targetAccent: "en-us" });
// { type: "judged" }, or { type: "different-word", heard: ["a", "ship"] }, or { type: "not-heard" }

const findWord = createWordFinder([["sheep", [["SH", "I", "P"]]], ...dictionary]);
judgeWord({ evidence, targetAccent: "en-us", findWord });
// { pronunciationIndex: 0, sounds: [
//   { position: 0, phonemeId: "SH", verdict: { type: "match" } },
//   { position: 1, phonemeId: "IX", verdict: { type: "swapped", heard: "I", heardWord: "sheep" } },
//   { position: 2, phonemeId: "P", verdict: { type: "match" } },
// ] }
```

Both take an optional `judgedPhonemeIds` to judge only some sounds, such as a contrast's two; by default they judge every sound in the word.

Besides the sounds, evidence can carry what the gate needs. Every field is optional, so a scorer that can't tell leaves it out:

- `RecordingEvidence.transcript`: what a recognizer heard with no target words to steer it, as lowercase words and a 0..1 confidence. `null` means no speech.
- `RecordingEvidence.insertedWords`: words heard besides the target words.
- `WordEvidence.accuracy`: how well the audio fits the whole word, 0..1.
- `WordEvidence.omitted`: the scorer found the word isn't in the recording, which is not the same as having no evidence for it.
- `SoundEvidence.accuracy`: how well the audio fits the target sound on its own, 0..1, where `targetScore` only ranks it against rivals.

## Scores

Every scorer normalizes its scores to 0..1, higher meaning the audio fits that phoneme better. Scores from different scorers aren't comparable, so the judge's rules are fixed and only its margins are tuned per scorer.

## Judge rules

- `match` when the target beats the best rival by the match margin, or, when the scorer reported no rivals, when the target score reaches the match floor.
- `swapped` only when the winning rival is a contrast partner of the target sound (from the contrast catalog in `@phonaria/phonetics-data`) and beats the target by the swap margin. A sound with no contrast partners, such as /h/, is only ever `match` or `unclear`.
- `unclear` otherwise, with a `reason` the UI can explain:
  - `no-evidence`: the scorer couldn't line the sound up (`missing`).
  - `close-call`: the best rival is a contrast partner, but neither it nor the target wins by its margin.
  - `other-sound`: the best rival isn't a contrast partner, the top rivals tie, or the scorer reported no rivals and the target is under the match floor.

A `null` judgement (below) means the same as `no-evidence` for every sound.

Every sound gets a verdict, one per occurrence, or only the sounds in `judgedPhonemeIds` when it is given. With several accepted pronunciations, the judge uses the one with the highest mean target score, counting missing sounds as zero. `judgeWord` returns `null` when the scorer lined up none of them.

### Heard word

A `swapped` verdict carries `heardWord` when the judged pronunciation, with only that sound swapped for the heard one, is a word: *ship* with /i/ for /ɪ/ makes *sheep*. The judge stays pure and loads no dictionary; the caller passes `findWord`, a lookup from phoneme IDs to a word. `createWordFinder` builds one from a list of words and their pronunciations, the first word listed winning a homophone, so list the words to prefer first: from the curated top-10k alone, *pin* with /b/ makes *been*, not *bin*. Without `findWord`, or when the swap makes no word, `heardWord` is absent.

### Allowed variants

A normal en-us variant of a sound, from `EnglishPhonemeAllophones`, is not a mistake. Most come back from a scorer as the phoneme itself: aspirated /p t k/, longer and shorter /i/ and /æ/, dark /l/. A scorer whose alphabet writes a variant apart folds it into the phoneme in its adapter, as the Azure one maps both `ɝ` and `ɚ` to `ER`.

Two kinds of variant sound like another phoneme, so the judge maps them itself, from the sounds around them in the judged pronunciation:

- **The flap**, between vowels: the /t/ of *water* and the /d/ of *ladder*. Heard as RX (ɾ, for a scorer that has it), or as /d/ for /t/ and /t/ for /d/.
- **Unaspirated /p/ and /k/** after a word-initial /s/: the /p/ of *spin* heard as /b/, the /k/ of *skate* as /ɡ/. No English word starts with /sb/ or /sɡ/, but inside a word voicing after /s/ is a contrast (*discussed* and *disgust*, *disperse* and *disburse*), so there /b/ for /p/ is a swap. Of the curated top-10k, 152 words start with s+p or s+k and 199 have one inside the word, where the variant isn't allowed. None of its pairs differ only by p-b or k-g after /s/, so an exception list drawn from it would be empty, but 8 of its words, such as *disgusting* and *baseball*, have /sb/ or /sɡ/ inside the word.

A heard variant counts as the target: its score can win for the target, and it is never a rival, so a flapped *water* is `match`. Both variants equal a contrast partner (t-d, p-b, k-g), but only where English doesn't contrast them; a test checks that no minimal pair in the catalog differs on a sound where its partner is allowed. Pronunciations carry no stress, so the flap is also allowed before a stressed vowel, as in *adopt*, where speakers don't flap. The glottal /t/ of *button* has no phoneme to be heard as, and isn't mapped; that /t/ is between vowels, so the flap's are allowed there.

`LENIENT_MARGINS` is the default. It starts lenient because marking a correct sound wrong costs more trust than missing a mistake.

## Word gate

`gateWord` runs before the judge and returns one of three outcomes:

- `judged`: judge the sounds.
- `different-word` with `heard`: something else was said. `heard` is the transcript's words, or empty when there's nothing to name (the scorer found the word missing but the transcript says it was there, or there is no transcript).
- `not-heard`: no speech at all.

The rule, in order:

1. No speech heard: `not-heard`.
2. The scorer marked the target word omitted: `different-word`.
3. The transcript holds more than one word: `different-word`.
4. The transcript is one word that sounds like the target, or like the target with one judged sound swapped for a contrast partner (*sheep* for *ship*): `judged`. Naming that swap is the judge's job.
5. The transcript is one other word: `different-word` only if the scoring agrees the word was off. That's a word accuracy under 0.3, or a transcript confidence of at least 0.5 with some sound the judge can't call under 0.6 accuracy.

With `judgedPhonemeIds` given, the judge can call the sounds in it. With every sound judged, it can call a sound where a contrast partner or an allowed variant is among the top-scoring sounds, at or above the target, since that's a swap it can name or a variant it accepts. A low /p/ in *ships* said for *ship*, where /s/ won, still says the word was off, even when /b/ scored a little above /p/.

Without a transcript, steps 3 to 5 become one check: a word accuracy under 0.3.

Transcript words are compared by pronunciation through `pronunciationsOf`, which the caller supplies, so a homophone such as *by* for *buy* counts as the target. The transcript alone never rejects a word, and never names a swap: Azure transcribed a clear *pool* as "pull" and a clear *bat* as "that", and the judge reads both correctly from the scoring.

The thresholds are `WORD_GATE_MARGINS`, to be tuned in [#335](https://github.com/rigomart/phonaria/issues/335). They come from the wrong-word investigation in [#344](https://github.com/rigomart/phonaria/issues/344), on 124 TTS clips: 1 of 48 target or partner recordings rejected (Guy's *sit* transcribed as "set", with a low /s/), and none of 60 unrelated words, words with added sounds, phrases or silences let through. A nonword one sound off the target, such as *shap* for *ship*, mostly gets through and is judged; that is fair, since it is a mispronounced target.

## Alignment

`alignPhonemes` lines up expected phoneme IDs with the ones a scorer reports, by edit distance. A vowel never lines up with a consonant. An expected sound only lines up with a reported one when every cheapest alignment pairs them: Azure's single `b` in *probably* (`p ɹ ɑ b l i` against `P R A B AX B L I`) could be either `B`, so neither gets it and both come out `missing`, rather than one being judged on the other's audio. Scorers use it to line up their own idea of a word with each accepted pronunciation.

## Azure scorer

`createAzureScorer({ key, region })` returns a `Scorer` backed by Azure Pronunciation Assessment and plain speech recognition. It uses `fetch` only, with no Speech SDK and no Node APIs, so a Worker and a Bun script can share it. The caller passes the key and region; the scorer never reads the environment. It supports `en-us` only and throws for other accents.

```ts
import { createAzureScorer } from "@phonaria/pronunciation";

const scorer = createAzureScorer({ key: env.AZURE_SPEECH_KEY, region: env.AZURE_SPEECH_REGION });
const recording = await scorer.score(wav, request);
```

It sends each recording twice, in parallel: `requestAzureAssessment` for Pronunciation Assessment and `requestAzureRecognition` for plain recognition, each returning Azure's raw response. `azureEvidenceFromResponse(assessment, request, recognition?)` turns them into evidence, with the transcript taken from the recognition. If only the recognition fails, the scorer returns evidence without a transcript. Each attempt is two billable calls, and the audio goes to Microsoft twice. Tests run on saved responses in `src/azure/fixtures`, with no key or network; `fixtures/miscue` holds both answers for *ship*, *sheep*, *kid*, *ships*, "a ship" and silence scored against *ship*.

### The request

It posts the WAV to `https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed` with `Content-Type: audio/wav; codecs=audio/pcm; samplerate=16000`. The `Pronunciation-Assessment` header is base64 of this UTF-8 JSON:

```json
{
	"ReferenceText": "ship",
	"GradingSystem": "HundredMark",
	"Granularity": "Phoneme",
	"Dimension": "Comprehensive",
	"PhonemeAlphabet": "IPA",
	"NBestPhonemeCount": 10,
	"EnableMiscue": true
}
```

The reference text is the target words joined by spaces. With miscue detection on, Azure marks a reference word it didn't hear as `Omission` and an extra word as `Insertion`, where without it every reference word comes back scored. It doesn't change the scores of a word it did hear: the investigation's swaps were judged the same either way, and scores moved by two points at most, except on recordings of another word, such as *seats*, which miscue scores lower. It catches most unrelated words but not phrases or added sounds, and it marks silence as `Success` with the word omitted, so the gate needs the transcript too.

Plain recognition is the same request with no `Pronunciation-Assessment` header. Its best result's `Lexical` and `Confidence` are the transcript; a status of `NoMatch`, `InitialSilenceTimeout` or `BabbleTimeout`, or an empty `Lexical`, means no speech.

### What the live API returns

Checked against the live API on 2026-10-19, using the catalog's Jenny recordings and Guy TTS converted to 16 kHz mono WAV:

- **The header keys work.** `PhonemeAlphabet: "IPA"` switches phonemes to IPA, and `NBestPhonemeCount` sets how many n-best phonemes come back: 5 and 10 both returned exactly that many for every sound.
- **N-best is usable.** Each sound carries `NBestPhonemes`, best first. The scores are relative: the top one is always 100, and ties at 100 happen. `AccuracyScore` is a separate, absolute 0–100 rating of the phoneme Azure expected. The same audio scored twice gave identical numbers.
- **The phonemes are Azure's lexicon, not what it heard.** *sheep* scored against *ship* still comes back as `ʃ ɪ p`; the swap only shows in n-best. For the vowel, `ɪ` gets accuracy 35 and n-best `i` 100, `ʃ` 71, `ɪ` 2. For *ship* said as *ship*, `ɪ` gets accuracy 100 and n-best `ɪ` 100, `p` 39, `ɛ` 8.
- **N-best mixes in neighbouring sounds.** A vowel's list often holds the consonants around it (`p` 39 in the *ship* vowel), so a rival winning outright isn't always a contrast partner.
- **Correct TTS doesn't always win cleanly.** *thin* gives `ɛ` and `ɪ` both 100 for the vowel and `θ` 100 with `f` 94. *very* gives `b` and `d` 100 above `v` 57. The judge reads these as `unclear`. *sin* against *thin* gives `s` 100 and `θ` 14, and *pull* against *pool* gives `ʊ` 100 and `u` 46, both judged `swapped`.
- **Quirks.** Azure writes ASCII `g`, not IPA `ɡ`. It writes vowel + /ɹ/ as one unit (`very` is `v ɛɹ i`, `poor` is `p ɔɹ`). A recording with no speech comes back with status `InitialSilenceTimeout` and no words. Offsets and durations are 100-nanosecond ticks.

### Symbols

`AzureIpaPhonemeMap` maps Azure's en-US IPA phone set to phoneme IDs. Every one of the 40 en-us phonemes has a symbol of its own, so none are missing. Where the two sets don't line up one to one:

- `ɝ` and `ɚ` both map to `ER`, because Phonaria's dictionary writes stressed and unstressed r-colored schwa as `ER`, as CMUdict's `ER0` does.
- `g` and `ɡ` both map to `G`.
- Azure scores these as one sound, and Phonaria writes them as two: `ju` (`Y U`), `ɪɹ` (`IX R`), `ɛɹ` (`E R`), `ʊɹ` (`UX R`), `aɪɹ` (`AI R`), `aʊɹ` (`AU R`), `ɔɹ` (`O R`), `ɑɹ` (`A R`).
- Any other symbol has no ID. `phonemeIdsForAzureSymbol` returns null for it, and it is handled as below rather than dropped.

### Evidence

Azure's phonemes, with the two-sound units split, are lined up against each accepted pronunciation. A pronunciation is left out when fewer than half its sounds line up with the same ID. For each sound:

- **Lined up with nothing**: `missing`.
- **Lined up with a sound that has n-best**: the target score is the target's n-best score; the rivals are the other n-best phonemes, one per ID at its best score, never the target. This also holds where Azure expected a different phoneme, since n-best rates the audio, not the lexicon. A target missing from the list gets the lowest listed score, which is its upper bound.
- **Target-only evidence**: Azure's `AccuracyScore` for the sound with no rivals, so the judge can only say `match` or `unclear`. Used for either sound of a two-sound unit, whose n-best rates the unit as a whole; when Azure returned no n-best; and when an n-best phoneme with no single ID scores at least as high as every named rival, because leaving it out would hand the win to the wrong rival. Where Azure's phoneme isn't the target, its accuracy says nothing about the target, so the sound is `missing` instead.

Each scored sound also gets Azure's `AccuracyScore` as `accuracy` where Azure's phoneme is the target, and each word gets the word's `AccuracyScore`.

Target words are matched to Azure's words ignoring case, punctuation and surrounding quotes, with curly apostrophes read as straight ones. A target word Azure marked `Omission` gets empty evidence marked `omitted`; one Azure didn't return, or a recording Azure didn't recognize, gets empty evidence. Words marked `Insertion` are listed in `insertedWords`. Scores are divided by 100.

### Probe

`bun run --cwd packages/pronunciation probe <file.wav> <word> [--save=response.json]` scores one 16 kHz mono WAV of one word against the live API (paths are relative to the package) and prints the evidence and the judge's verdicts for every sound. It reads `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` from `packages/pronunciation/.env` and takes the word's accepted pronunciations from the curated top-10k dictionary. `--save` writes Azure's raw response, which has no credentials in it, for use as a fixture.

To turn a catalog recording into a WAV: `ffmpeg -i ship.ogg -ar 16000 -ac 1 -c:a pcm_s16le ship.wav`.

## Eval harness

`src/harness` runs a scorer and the judge over labelled recordings of the minimal-pair catalog and reports how often the judge gets each kind of case right. See [#328](https://github.com/rigomart/phonaria/issues/328).

For every minimal pair (A, B), both ways round, it judges every sound in the word, as practice does:

- **Correct**: a recording of A against target A should be `match` on every sound.
- **Swap**: a recording of B against target A should be `swapped` with B's sound where the pair differs, and `match` elsewhere.

`--judged=contrast` judges only the contrast's two sounds instead, through `judgedPhonemeIds` in both the gate and the judge, as the [#328 baseline](../../docs/research/issue-328-azure-pronunciation-baseline.md) did.

Every case goes through the word gate first. A **wrong-word** case, from a clips manifest (below), holds something other than A or B judged against A, and the gate should stop it: an unrelated word, the word with sounds added, a phrase, a nonword, or silence or noise.

Accepted pronunciations come from the curated top-10k dictionary the catalog is validated against.

```bash
bun run --cwd packages/pronunciation harness words
bun run --cwd packages/pronunciation harness run --catalog
bun run --cwd packages/pronunciation harness run --catalog --tts-dir=output/tts/guy --tts-dir=output/tts/aria --voices-dir=<dir>
bun run --cwd packages/pronunciation harness run --catalog --offline
```

The full run on three voices, every sound judged, and the same run judging the contrast sounds only for comparison. They send the same requests, so whichever runs second costs no calls:

```bash
bun run --cwd packages/pronunciation harness run --catalog \
  --tts-dir=output/tts/guy --tts-dir=output/tts/aria --report=every-sound
bun run --cwd packages/pronunciation harness run --catalog \
  --tts-dir=output/tts/guy --tts-dir=output/tts/aria --judged=contrast --report=contrast-only
```

`words` prints the list to record with real voices for [#327](https://github.com/rigomart/phonaria/issues/327): one pair per contrast, 54 words, no word twice.

`run` takes any mix of sources (paths are relative to the package):

- `--catalog`: the Jenny recordings, fetched once from `https://assets.rigos.dev` through `getWordAudioPath()` into `output/audio/jenny`. The default when no source is given.
- `--audio-dir=<dir>`: the Jenny recordings from a local folder of `<word>.ogg` instead.
- `--tts-dir=[name=]<dir>`, repeatable: a folder of `<word>.<ext>`, or an `audio-gen` output folder with them under `audio/`. The source is named `tts:<name>`, or after the nearest folder that isn't `audio`. Two sources with the same name stop the run.
- `--clips=<manifest.json>`, repeatable: recordings labelled one by one, for cases a folder of words can't express. See `loadClips` in `sources.ts` for the format. Each clip names its source, target, partner, what was said and its kind: `correct`, `swap`, `unrelated`, `added-sounds`, `phrase`, `nonword` or `silence`.
- `--voices-dir=<dir>`: real recordings as `<speaker>/<word>.wav`, one source per speaker. An optional `<speaker>/labels.json` maps a word to what it came out as: `{ "ship": "sheep", "thin": "neither" }`. A recording labelled as another word is scored as that word; one labelled `neither` is left out. Unlisted recordings count as said as intended. Words from the `words` list with no recording are listed as missing.

Other options: `--offline` never calls the scorer, `--judged=every|contrast` picks the sounds judged (default `every`), `--contrasts=i-ix,th-s` limits the catalog, `--concurrency=4` sets how many live calls run at once, `--report=<name>` names the output files, and `--max-throttled=100` stops calling Azure after that many HTTP 429s.

Every recording is converted with `ffmpeg` to 16 kHz mono 16-bit PCM WAV, stored by the original file's hash in `output/wav`. Azure's raw answers, the assessment and the recognition together, are cached in `output/cache`, keyed by a hash of the WAV bytes, the request and the scorer settings, never the key. A rerun, or a change to the adapter or the judge, costs no calls. Without `AZURE_SPEECH_KEY` the run is offline. Live calls retry HTTP 429 and 5xx with backoff, honouring `Retry-After` in seconds or as a date, up to a minute.

The report goes to `output/<name>.json` and `output/<name>.md`, overall, per source kind (`tts`, `real`), per source and per contrast:

- **False flag**: correct recordings with a sound judged `swapped`, per case. **Recordings flagged** counts each take once, though a word in several contrasts is several cases, and two takes of a word are two recordings: this is the rate the #328 target is about.
- **Other sound flagged**: correct and pair recordings with a sound besides the contrast one judged `swapped`. Always zero with `--judged=contrast`.
- **Swap named**: swap recordings judged `swapped` with the partner's sound. **Misnamed**: `swapped` with another sound. **Missed**: judged `match`.
- **Unclear**: judged `unclear` with scored evidence.
- **No evidence**: the judge returned null or the sound was `missing`. Cases with no scorer result at all are left out and counted.
- **False reject**: correct and swap recordings the word gate stopped.
- **Wrong word accepted**: wrong-word recordings the gate let through, per kind, and overall leaving out nonwords, which are fair to judge.

It also lists the falsely flagged sounds, as target and heard, the worst contrasts by false flags with the rivals that tied or beat the target, how the judged sound's evidence looked before margins (no rivals, partner listed, who scored highest), and the same evidence judged under a few other margins, for information. `output/` is ignored by Git.

`bun run harness import-investigation <dir>` turns the wrong-word investigation's folder (its `wav/` and `responses/`) into `output/investigation/clips.json` and seeds the cache with its saved Azure answers, so `bun run harness run --clips=output/investigation/clips.json` makes no calls.

The metric arithmetic in `metrics.ts` is pure and tested with a fake scorer. Any `Scorer` can run through `harnessScorerFrom`; the Azure one caches the raw response instead of evidence.

## Evidence log

Learners in minimal-pair practice can opt in to sharing each attempt's evidence and verdicts, never audio (see [#336](https://github.com/rigomart/phonaria/issues/336) and the app README). `src/harness/evidence-log.ts` brings those attempts into the harness:

```bash
bun run --cwd packages/pronunciation harness import-evidence-log [--out=attempts]
bun run --cwd packages/pronunciation harness judge-evidence-log output/evidence-log/attempts.json
```

`import-evidence-log` reads every row through Turso's HTTP API with `EVIDENCE_LOG_DATABASE_URL` and a read-only `EVIDENCE_LOG_READ_TOKEN` from `.env`, writes `output/evidence-log/<name>.json`, and prints a summary. `judge-evidence-log` prints the summary for an existing export, offline. The summary re-runs the word gate and the judge on every attempt, counts gate outcomes and sound verdicts with how often each was followed by a retry, and counts attempts judged differently from what the learner was shown.

An export is `{ format: "phonaria-evidence-log", version: 1, exportedAt, attempts }`, each attempt a `LoggedAttempt`: the row's `id`, `attemptedAt`, `word`, `targetAccent`, the `RecordingEvidence`, the `verdicts` shown (`judgedPhonemeIds`, absent when every sound was judged, plus `gate` and `judgement`), and `next`, `retried` or `moved-on`. `loadEvidenceLog(file)` loads one, and `rejudgeAttempt(attempt, margins)` runs the gate and the judge on it, for the threshold script ([#335](https://github.com/rigomart/phonaria/issues/335)). The rows say nothing about what the learner really said, so they show how margins would judge real attempts, not how accurate they are.

The log keeps a real word only in a one-word transcript, a one-word gate `heard` and a swap's `heardWord`, and only if it is a minimal-pair catalog word. Every other heard word, including every word of a longer transcript and every inserted word, is the placeholder `<other>` (`EVIDENCE_LOG_OTHER_WORD`). Re-judging treats it as an unknown word with no pronunciation, which loses two things the app had. A one-word transcript outside the catalog that sounds like the target (a homophone such as *by* for *buy*) or like the target with one judged sound swapped can no longer pass the gate's pronunciation check, so only the scoring can let it through; and a non-catalog `heardWord` can't be shown. Multi-word transcripts lose nothing, since the gate reads only their length, and the gate never reads inserted words.
