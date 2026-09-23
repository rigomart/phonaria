# Jev experiments

A point-in-time record of trying Jev, TypeSafe's typed-decision model, against Phonaria's
Transcription and Practice. Run on 2026-09-23 through OpenRouter (`jev-latest`). Every
number below comes from the scripts on this branch; all test sentences and labels were
written by hand for the experiment, so treat the results as signal, not benchmarks.

## What Jev is

Jev takes text plus typed questions and returns typed answers with probabilities: `choice`
(pick one of up to 255 options), `noul` (yes/no probability), or `score` (2-10 levels). It
never generates text. One `POST /v1/systemone` call can ask several questions about one
state. Pricing is about $0.04 per million input tokens with output free; observed round
trips were 340-650 ms through OpenRouter with 12-34 requests in flight. It is text only:
no audio.

- API reference: https://docs.typesafe.ai/api
- OpenRouter: `https://openrouter.ai/api/v1/systemone`, same body shape, `OPENROUTER_API_KEY`

## Reproduce

```
bun --cwd apps/lab ./scripts/try-jev.ts [--only spelling|heteronyms] [--verbose]
bun --cwd apps/lab ./scripts/try-jev-ideas.ts [--only weak-forms|sound-finder|word-pool]
```

The key goes in the gitignored `apps/lab/.env.local` (Bun loads it from the working directory).

## Results

### Spelling suggestions after dictionary misses

Jev chooses among the one-slip dictionary neighbours the server already finds, plus a
`none` option, given the sentence. Picks under 0.7 confidence count as silence.

| | right | wrong | missed |
| --- | --- | --- | --- |
| current rule (`spelling-suggestion.ts`) | 30/34 | 0 | 4 |
| Jev | 34/34 | 0 | 0 |

The rule misses `adress`, `wnat`, `bg`, and `cn` because it cannot see the sentence. Jev
stayed silent on the obscure neighbours from issue #247 (`recio`, `langridge`, `defiantly`)
and held a surname under the threshold (`kowalevski` at 0.39).

### Heteronyms

The app shows CMUDict variant 0, which is effectively alphabetical. 24 sentences, same
question, options described three ways:

| options described as | right | picks at confidence >= 0.7 |
| --- | --- | --- |
| app default (variant 0) | 12/24 | n/a |
| bare IPA | 19/24 | 7, 6 right |
| part of speech only | 21/24 | 24, 21 right |
| part of speech + short meaning | 24/24 | 24, 24 right |

Part of speech alone fails exactly where two readings share one (`lead` the metal vs taking
the lead, `tear` from the eye vs in a shirt, `bass` the instrument vs the fish), and those
failures were confident (0.75-0.99). The meanings were written alongside the test sentences,
so 24/24 is optimistic; a fair rerun needs independently sourced glosses.

Tagging scope: 8,445 CMUDict words have more than one variant, 1,738 of them in the curated
top 10k. Most are free variation, not heteronyms, so tags need a "same meaning" class that
keeps Jev out of the decision. Wiktionary groups pronunciations by etymology and part of
speech, and the app already parses Wiktionary for definitions. g2p_en's `homographs.en` is
smaller and carries part of speech only.

### Weak and strong forms of function words

Groups come from CMUDict stress alone (a primary-stressed variant is strong).

| | right | picks at confidence >= 0.7 |
| --- | --- | --- |
| app default (variant 0) | 11/22 | n/a |
| Jev | 18/22 | 16, 14 right |

Every weak case was right at 0.94-0.99. The misses were all strong forms: clause-final
words (`give it to?`, `button for?`, `where they are`) and demonstrative `that one`. A
deterministic phrase-final rule covers the first group; the second is a part-of-speech tag.
The app currently shows `I can swim` as /kæn/ and `want to go` as /tu/.

### Sound finder (plain words to phoneme)

A learner's description is matched against all 40 English phonemes, with options built only
from `EnglishPhonemeSpellingPatterns`; query example words were kept out of that data.

24/30 right, 28/30 in the top two, 19 of 20 confident picks right. Every miss is a
misleading spelling (`g in gem`, `c in ice`, `gh in laugh`, `ed in stopped`, `s in usually`):
Jev answers with the letter's usual sound. Descriptive and Spanish queries worked ("the long
e", "the lazy vowel", "la v de very").

### Practice word pool screen

Two `noul` questions per word (ordinary word? sensitive?) over the seven blocklisted words
and 400 of the 3,373 schwa-pool words.

- All blocklisted words scored below 0.4 on "ordinary".
- About 10% of the sample is proper nouns the pool currently serves: `obama`, `argentina`,
  `google`, `linux`, `michigan`, `megan`, and so on, nearly all below 0.2.
- False positives sit between 0.35 and 0.5 (`jurisdiction`, `valentine`, `russian`, `beta`).
- Only `sexually` (0.58) was flagged as sensitive.

A full pass over the 10k list would cost roughly $0.15.

## Where it fits

Offline uses need no runtime dependency and send no learner text to a third party, so they
come first.

1. **Practice word-pool screen (offline).** Generate a reviewed exclusion list once and ship
   it as data. Fixes a real problem the hand blocklist cannot keep up with.
2. **Pronunciation tags (offline) + runtime choice.** Tag variants with part of speech and
   a short meaning, then let Jev pick per sentence. Enables correct heteronyms and a
   natural-speech view of weak forms in Transcription.
3. **Spelling suggestions (runtime).** Only on dictionary misses that have candidates,
   with the current rule as the fallback.
4. **Sound finder (runtime).** Pair with a deterministic step for "the X in WORD" queries
   (look the word up and align) and use Jev for descriptive ones.

Not a fit: grading speech (text only), writing explanations or example sentences (no text
generation), scoring Practice answers (exact sequence comparison is better in code), and
anything adaptive (out of scope for Phonaria).
