# ADR 0003: Keep /ɔ/ and demonstrate it with a voice that keeps it

- Status: Proposed
- Date: 2026-10-23
- Related issues: [#358](https://github.com/rigomart/phonaria/issues/358),
  [#353](https://github.com/rigomart/phonaria/issues/353),
  [#365](https://github.com/rigomart/phonaria/issues/365)

## Context

Phonaria teaches en-US sounds with IPA, and `O` /ɔ/ is one of its English monophthongs. Word
recordings come from the Azure voice Jenny. Listening to the top-1k batch and measuring minimal
pairs showed that Jenny merges /ɔ/ with /ɑ/ even when the IPA asks for /ɔ/: *lost* and /lɑst/,
*law* and /lɑ/ sound the same. Formant distances for 20 cot–caught pairs sit at the noise floor,
before /l/ and nasals too. Jenny also merges /æɹ/ with /ɛɹ/ (*marry*–*merry*). Every other vowel
contrast the app teaches stays apart. Guy and Andrew keep /ɔ/ apart; Aria and Ava merge it.

Both mergers are ordinary American speech. The cot–caught merger is general in the West and
Canada and has been spreading east; most North Americans merge *Mary*, *marry* and *merry*. Major
references disagree on whether to transcribe a separate /ɔ/: Merriam-Webster and American Heritage
keep it, Cambridge's US transcriptions merge it. Sources are in the
[merger research note](../research/us-vowel-mergers.md).

The problem for a learner is not the merger but the mismatch. The /ɔ/ sound page shows *saw*,
*cause* and *talk* as /ɔ/ and plays /ɑ/, which teaches that the symbol sounds like /ɑ/. Fifteen
published words are affected; no minimal-pair contrast uses /ɔ/.

## Decision

- Keep /ɔ/ in the en-US inventory and in transcriptions.
- Any recording that demonstrates /ɔ/ to a learner uses a voice that keeps it apart from /ɑ/,
  currently Guy. That covers every learner-facing word whose IPA has /ɔ/ outside /ɔɪ/ and /ɔɹ/:
  sound-page and spelling examples, minimal-pair words and Practice words. The manifest lists
  these words under `voices`.
- Jenny stays the default voice. Recordings that only play a word, such as dictionary lookups, may
  merge.
- Never build a contrast or exercise that targets /ɔ/ against /ɑ/ with a merging voice.
- The /ɔ/ sound page says that many Americans merge it with /ɑ/ and that both are ordinary American
  speech. The /æ/ and /ɛ/ pages say the same about *marry*–*merry* before /r/.
- Accept marry–merry in recordings. Don't use /æɹ/ words as /æ/ examples.

## Consequences

- The manifest gains per-word voices, and a small number of words play in a male voice beside the
  female default.
- Adding a learner-facing /ɔ/ word means recording it with the second voice. A test should enforce
  this once the Guy recordings are in the manifest.
- When the dictionary lists both an /ɑ/ and an /ɔ/ form, the pronunciation rule currently takes the
  first. That shows *caught* as /kɑt/ beside *taught* /tɔt/. Those picks should prefer /ɔ/ so the
  transcriptions agree with this decision.
- The pronunciation harness keeps scoring Jenny's clips for every catalog word, so its baseline
  stays comparable.
