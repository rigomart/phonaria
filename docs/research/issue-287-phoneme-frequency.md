# Sound frequency (issue #287)

A point-in-time record of the numbers behind the Frequency page (`/ipa-chart/frequency`) and the
"Frequency" section of the sound card. `generate-phoneme-frequency.py` writes them to
`packages/phonetics-data/data/en/phoneme-frequency.json`.

Run on 2026-10-10 with wordfreq 3.1.1 over the 10,000 curated words. The output has no timestamp,
so the same inputs and wordfreq version reproduce the file byte for byte.

## Method

Each sound's number is its share of all the sounds in everyday speech:

1. Take the curated top-10k words (`data/en/curated/top-10k.json`) and each word's first
   pronunciation.
2. Weight each word by `wordfreq.word_frequency(word, "en")`: the share of all running words it
   makes up across subtitles, books, Wikipedia and other sources. *The* is 0.0537, about one word
   in 19, so it counts about 4,800 times as much as *tent* (0.0000112).
3. For every sound in the pronunciation, add the word's weight. A sound that appears twice in a
   word, like /t/ in *tent*, counts twice.
4. Divide each sound's total by the sum over all sounds, so the shares add up to 100%, then rank
   them.

Words outside the top 10,000 are left out. Each is rare, so together they shift the shares little.

The first pronunciation is usually the everyday, reduced one, because the curated list keeps
CMUDict's variant order. *The* is the clearest case: its first variant is /ðə/, so it adds /ð/ and
/ə/. Adding the stressed /ðʌ/ and /ði/ variants would split its weight and overstate vowels people
rarely use for it.

## Function words dominate

A handful of very frequent words carry much of the result. Function words such as *the*, *this*,
*that* and *they* make /ð/ the 11th most common sound (3.1%), although only 0.4% of dictionary
words contain it. /ə/ leads: it is in unstressed syllables of most long words and in reduced
function words such as *a*.

| Sound | Share | Rank |
| --- | --- | --- |
| /ə/ | 7.9% | 1 |
| /t/ | 7.4% | 2 |
| /n/ | 7.2% | 3 |
| /ð/ | 3.1% | 11 |
| /θ/ | 0.4% | 38 |
| /ɔɪ/ | 0.09% | 39 |
| /ʒ/ | 0.05% | 40 |

The mockup's first pass weighted words by 1/rank and gave /ə/ 9.1%, /t/ 7.6%, /n/ 7.0% and /ð/ 4.1%.
Real wordfreq weights lower /ə/ and /ð/ the most, lower /t/ slightly and raise /n/ slightly.

## Bands

`FREQUENCY_BANDS` in `apps/phonaria/src/lib/phoneme-frequency.ts` sets the lowest share for each
band. The page colors each bar by band, using one slate hue stepping in lightness.

| Band | Share | Sounds |
| --- | --- | --- |
| Very common | 4% or more | 7 |
| Common | 2% or more | 14 |
| Less common | 0.5% or more | 15 |
| Rare | below 0.5% | 4 |

/ə/, /t/ and /n/ are very common; /ʊ/, /θ/, /ɔɪ/ and /ʒ/ are rare.

## Decisions

- **A page, not chart shading.** The first version tinted the consonant and vowel charts by band.
  It hid the voicing and rounding cues the charts exist to teach, and a grid arranged by place of
  articulation made sounds hard to compare. A sorted list reads better.
- **Speech only.** A second measure, the share of dictionary words containing each sound, counted
  rare words as much as common ones. It ranked /ð/ 39th, which describes English vocabulary but
  not what a learner will hear, so it was dropped.
