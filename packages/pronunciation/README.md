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
