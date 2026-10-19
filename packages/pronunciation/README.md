# @phonaria/pronunciation

Hears which sound a learner said. It holds the scoring contract and the judge, and is source-imported with no build step. See [#324](https://github.com/rigomart/phonaria/issues/324) for the plan.

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
