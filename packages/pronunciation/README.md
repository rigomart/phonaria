# @phonaria/pronunciation

Hears which sound a learner said. It holds the scoring contract, the judge and the scorers, and is source-imported with no build step. See [#324](https://github.com/rigomart/phonaria/issues/324) for the plan.

The work is split in two so a scorer can be replaced without touching the judge:

- A **scorer** takes a recording and a `ScoringRequest` (the target accent and the words said, each with its accepted pronunciations as base phoneme IDs) and returns `RecordingEvidence`, one `WordEvidence` per word. For each accepted pronunciation it could line up, a word's evidence has one entry per sound with its time span, the target's score and rival scores. A sound it couldn't line up is reported as `missing`. Audio is a 16 kHz mono 16-bit PCM WAV file as a `Uint8Array`.
- The **judge**, `judgeWord`, is a pure function that turns one word's evidence into a verdict for each judged sound: `match`, `swapped` with the heard phoneme ID, or `unclear`.

Practice starts with single words, sent as a list of one. Requests and evidence are lists so phrases can follow without changing the contract; judging across words (skipped words, weak forms, sounds that change at word boundaries) comes with them.

```ts
import { judgeWord } from "@phonaria/pronunciation";

const recording = await scorer.score(wav, {
	targetAccent: "en-us",
	words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
});

judgeWord({ evidence: recording.words[0], judgedPhonemeIds: new Set(["IX", "I"]), targetAccent: "en-us" });
// { pronunciationIndex: 0, sounds: [{ position: 1, phonemeId: "IX", verdict: { type: "swapped", heard: "I" } }] }
```

## Scores

Every scorer normalizes its scores to 0..1, higher meaning the audio fits that phoneme better. Scores from different scorers aren't comparable, so the judge's rules are fixed and only its margins are tuned per scorer.

## Judge rules

- `match` when the target beats the best rival by the match margin, or, when the scorer reported no rivals, when the target score reaches the match floor.
- `swapped` only when the winning rival is a contrast partner of the target sound (from the contrast catalog in `@phonaria/phonetics-data`) and beats the target by the swap margin.
- `unclear` otherwise: a near tie, a winner that isn't a contrast partner, or a sound the scorer couldn't line up.

Only sounds in `judgedPhonemeIds` get a verdict, one per occurrence. With several accepted pronunciations, the judge uses the one with the highest mean target score, counting missing sounds as zero. `judgeWord` returns `null` when the scorer lined up none of them.

`LENIENT_MARGINS` is the default. It starts lenient because marking a correct sound wrong costs more trust than missing a mistake.

## Alignment

`alignPhonemes` lines up expected phoneme IDs with the ones a scorer reports, by edit distance. A vowel never lines up with a consonant. An expected sound only lines up with a reported one when every cheapest alignment pairs them: Azure's single `b` in *probably* (`p ɹ ɑ b l i` against `P R A B AX B L I`) could be either `B`, so neither gets it and both come out `missing`, rather than one being judged on the other's audio. Scorers use it to line up their own idea of a word with each accepted pronunciation.

## Azure scorer

`createAzureScorer({ key, region })` returns a `Scorer` backed by Azure Pronunciation Assessment. It uses `fetch` only, with no Speech SDK and no Node APIs, so a Worker and a Bun script can share it. The caller passes the key and region; the scorer never reads the environment. It supports `en-us` only and throws for other accents.

```ts
import { createAzureScorer } from "@phonaria/pronunciation";

const scorer = createAzureScorer({ key: env.AZURE_SPEECH_KEY, region: env.AZURE_SPEECH_REGION });
const recording = await scorer.score(wav, request);
```

It is two steps, both exported: `requestAzureAssessment` posts the WAV and returns Azure's raw response, and `azureEvidenceFromResponse` turns a response into evidence. Tests run the second on saved responses in `src/azure/fixtures`, with no key or network.

### The request

It posts the WAV to `https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed` with `Content-Type: audio/wav; codecs=audio/pcm; samplerate=16000`. The `Pronunciation-Assessment` header is base64 of this UTF-8 JSON:

```json
{
	"ReferenceText": "ship",
	"GradingSystem": "HundredMark",
	"Granularity": "Phoneme",
	"Dimension": "Comprehensive",
	"PhonemeAlphabet": "IPA",
	"NBestPhonemeCount": 10
}
```

The reference text is the target words joined by spaces. Miscue detection is left off, so Azure returns exactly the reference words.

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

Target words are matched to Azure's words ignoring case, punctuation and surrounding quotes, with curly apostrophes read as straight ones. A target word Azure didn't return or marked `Omission`, or a recording Azure didn't recognize, gets empty evidence. Scores are divided by 100.

### Probe

`bun run --cwd packages/pronunciation probe <file.wav> <word> [--save=response.json]` scores one 16 kHz mono WAV of one word against the live API (paths are relative to the package) and prints the evidence and the judge's verdicts for every sound. It reads `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` from `packages/pronunciation/.env` and takes the word's accepted pronunciations from the curated top-10k dictionary. `--save` writes Azure's raw response, which has no credentials in it, for use as a fixture.

To turn a catalog recording into a WAV: `ffmpeg -i ship.ogg -ar 16000 -ac 1 -c:a pcm_s16le ship.wav`.

## Eval harness

`src/harness` runs a scorer and the judge over labelled recordings of the minimal-pair catalog and reports how often the judge gets each kind of case right. See [#328](https://github.com/rigomart/phonaria/issues/328).

For every minimal pair (A, B), both ways round, it judges only the sound where the pair differs, with the contrast's two sounds as `judgedPhonemeIds`:

- **Correct**: a recording of A against target A should be `match`.
- **Swap**: a recording of B against target A should be `swapped` with B's sound.

Accepted pronunciations come from the curated top-10k dictionary the catalog is validated against.

```bash
bun run --cwd packages/pronunciation harness words
bun run --cwd packages/pronunciation harness run --catalog
bun run --cwd packages/pronunciation harness run --catalog --tts-dir=output/tts/guy --tts-dir=output/tts/aria --voices-dir=<dir>
bun run --cwd packages/pronunciation harness run --catalog --offline
```

`words` prints the list to record with real voices for [#327](https://github.com/rigomart/phonaria/issues/327): one pair per contrast, 54 words, no word twice.

`run` takes any mix of sources (paths are relative to the package):

- `--catalog`: the Jenny recordings, fetched once from `https://assets.rigos.dev` through `getWordAudioPath()` into `output/audio/jenny`. The default when no source is given.
- `--audio-dir=<dir>`: the Jenny recordings from a local folder of `<word>.ogg` instead.
- `--tts-dir=[name=]<dir>`, repeatable: a folder of `<word>.<ext>`, or an `audio-gen` output folder with them under `audio/`. The source is named `tts:<name>`, or after the nearest folder that isn't `audio`. Two sources with the same name stop the run.
- `--voices-dir=<dir>`: real recordings as `<speaker>/<word>.wav`, one source per speaker. An optional `<speaker>/labels.json` maps a word to what it came out as: `{ "ship": "sheep", "thin": "neither" }`. A recording labelled as another word is scored as that word; one labelled `neither` is left out. Unlisted recordings count as said as intended. Words from the `words` list with no recording are listed as missing.

Other options: `--offline` never calls the scorer, `--contrasts=i-ix,th-s` limits the catalog, `--concurrency=4` sets how many live calls run at once, `--report=<name>` names the output files, and `--max-throttled=100` stops calling Azure after that many HTTP 429s.

Every recording is converted with `ffmpeg` to 16 kHz mono 16-bit PCM WAV, stored by the original file's hash in `output/wav`. Azure's raw responses are cached in `output/cache`, keyed by a hash of the WAV bytes, the request and the scorer settings, never the key. A rerun, or a change to the adapter or the judge, costs no calls. Without `AZURE_SPEECH_KEY` the run is offline. Live calls retry HTTP 429 and 5xx with backoff, honouring `Retry-After` in seconds or as a date, up to a minute.

The report goes to `output/<name>.json` and `output/<name>.md`, overall, per source kind (`tts`, `real`), per source and per contrast:

- **False flag**: correct recordings judged `swapped`.
- **Swap named**: swap recordings judged `swapped` with the partner's sound. **Misnamed**: `swapped` with another sound. **Missed**: judged `match`.
- **Unclear**: judged `unclear` with scored evidence.
- **No evidence**: the judge returned null or the sound was `missing`. Cases with no scorer result at all are left out and counted.

It also lists the worst contrasts by false flags with the rivals that tied or beat the target, how the judged sound's evidence looked before margins (no rivals, partner listed, who scored highest), and the same evidence judged under a few other margins, for information. `output/` is ignored by Git.

The metric arithmetic in `metrics.ts` is pure and tested with a fake scorer. Any `Scorer` can run through `harnessScorerFrom`; the Azure one caches the raw response instead of evidence.
