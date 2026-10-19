# @phonaria/pronunciation

Hears which sound a learner said. It holds the scoring contract and the judge, and is source-imported with no build step. See [#324](https://github.com/rigomart/phonaria/issues/324) for the plan.

The work is split in two so a scorer can be replaced without touching the judge:

- A **scorer** takes a recording and a `ScoringRequest` (target accent, word, accepted pronunciations as base phoneme IDs) and returns `WordEvidence`: for each accepted pronunciation it could line up, one entry per sound with its time span, the target's score and rival scores. A sound it couldn't line up is reported as `missing`. Audio is a 16 kHz mono 16-bit PCM WAV file as a `Uint8Array`.
- The **judge**, `judgeWord`, is a pure function that turns evidence into a verdict for each judged sound: `match`, `swapped` with the heard phoneme ID, or `unclear`.

```ts
import { judgeWord } from "@phonaria/pronunciation";

const evidence = await scorer.score(wav, {
	targetAccent: "en-us",
	word: "ship",
	acceptedPronunciations: [["SH", "IX", "P"]],
});

judgeWord({ evidence, judgedPhonemeIds: new Set(["IX", "I"]), targetAccent: "en-us" });
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
