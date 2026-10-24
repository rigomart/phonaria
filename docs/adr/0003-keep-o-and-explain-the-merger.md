# ADR 0003: Keep /ɔ/ and explain that the recordings merge it

- Status: Proposed
- Date: 2026-10-24
- Related issues: [#358](https://github.com/rigomart/phonaria/issues/358),
  [#353](https://github.com/rigomart/phonaria/issues/353),
  [#365](https://github.com/rigomart/phonaria/issues/365)

## Context

Phonaria teaches en-US sounds with IPA, and `O` /ɔ/ is one of its English monophthongs. Word
recordings come from the Azure voice Jenny. Listening to the top-1k batch and measuring minimal
pairs showed that Jenny merges /ɔ/ with /ɑ/ even when the IPA asks for /ɔ/: *lost* and /lɑst/,
*law* and /lɑ/ sound the same. Formant distances for 20 cot–caught pairs sit at the noise floor,
before /l/ and nasals too. Jenny also merges /æɹ/ with /ɛɹ/ (*marry*–*merry*). Every other vowel
contrast the app teaches stays apart.

Both mergers are ordinary American speech. The cot–caught merger is general in the West and
Canada and has been spreading east; most North Americans merge *Mary*, *marry* and *merry*. Major
references disagree on whether to transcribe a separate /ɔ/: Merriam-Webster and American Heritage
keep it, Cambridge's US transcriptions merge it. Sources are in the
[merger research note](../research/us-vowel-mergers.md).

The problem for a learner is the mismatch: the /ɔ/ details show *saw*, *cause* and *talk* as /ɔ/
and play /ɑ/. A second voice was tried. Guy kept /ɔ/ apart in test pairs, but measured on the 15
published /ɔ/ words he was clearly distinct on only 4 and merged on 7, including *cause* and
*talk*. The dev could not hear a reliable difference either. Other voices were not measured on
real words. Per-word voices (#364) were reverted (#367).

## Decision

- Keep /ɔ/ in the en-US inventory and in transcriptions. Where the dictionary lists both an /ɑ/
  and an /ɔ/ form of a word, show the /ɔ/ form, so transcriptions agree with each other.
- Keep Jenny as the only voice, and accept that its /ɔ/ words sound like /ɑ/.
- Say so where learners meet /ɔ/: the /ɔ/ details explain the cot–caught merger, say both ways are
  ordinary American English, and say the recordings use a voice with the merger. The /æ/ and /ɛ/
  details explain *marry*–*merry* before /ɹ/.
- Never build a contrast or exercise that targets /ɔ/ against /ɑ/, or /æɹ/ against /ɛɹ/. Don't
  use /æɹ/ words as /æ/ examples.

## Consequences

- Learners see /ɔ/ and hear /ɑ/ in those words, with a note that explains why. Learners who keep
  the vowels apart get the symbol right but no audio model for /ɔ/.
- No minimal-pair contrast or Practice topic can teach cot–caught until a recording source that
  keeps /ɔ/ is found and measured on real words.
- The /ɔ/ form preference changes a few dozen top-10k requests, so those clips are retaken; the
  audio barely changes.
