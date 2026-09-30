# Minimal-pair curation (issue #168)

A point-in-time record of how the pairs in `packages/phonetics-data/src/languages/en/contrasts.ts`
were chosen. `find-minimal-pairs` proposed every candidate from the curated top-10k list; the
pairs were then picked by hand and checked against a blind second opinion from Jev.

Run on 2026-09-29. The catalog holds 254 pairs across 27 contrasts. Its test checks every pair
against the dictionary: both words have one pronunciation, share a stress pattern, and differ
by exactly the two contrasted sounds.

## Selection criteria

1. Both words are common, everyday words a learner probably knows.
2. No names, places, brands, abbreviations, slang, archaic, offensive or sensitive words.
3. Heard alone, the only difference is the two target sounds. That rules out:
   - a vowel before /r/ or /l/ in vowel contrasts, where the following sound changes the vowel;
   - /æ/ before a nasal (men/man, fan/fun), which General American raises;
   - /æ/ before /g/ (bag, beg), which some American accents raise;
   - t or d between vowels, which Americans pronounce the same (metal/medal);
   - function words usually said in a reduced form (had, but, their);
   - words with another common pronunciation or reading (row).
4. Base forms only: no plural or inflected copy of a pair already chosen.
5. A word appears at most once per contrast, and word positions vary where the list allows.

## Second opinion

Jev (`jev-latest` through OpenRouter) judged up to 60 unflagged candidates per contrast, 745
pairs in all, with the criteria above as `include` / `exclude` options. It never saw the hand
picks. The run cost well under one cent.

- Jev gave 236 of the first 262 hand picks an `include` probability of at least 0.6.
- **Dropped where Jev doubted the pick and the doubt held up:**
  - inflected pairs and function words: place/plays, their/dare, said/sad;
  - a vowel before /r/ that varies by speaker: fairy/very;
  - a cot/caught risk: lawn/long;
  - two-syllable or flapped pairs: letter/latter, battle/bottle, leaving/living, marble/marvel;
  - weaker pairs where a contrast had better alternatives: true/drew, built/build, right/ride, leak/league, worth/worse, growth/gross, term/turn, male/nail, left/laughed, reach/rich, climb/crime.
- **Added from pairs Jev rated 0.9 or higher:** pit/bit, pump/bump, kit/kid, bit/bid, bat/bad, cave/gave, sake/shake, batch/bash, lay/ray, teen/tin, leak/lick, might/mate, pine/pain.
- **Kept out despite high Jev ratings:** Jev has no model of these accent effects, so criteria 2–3 decided:
  - /æ/ before a nasal: men/man, pen/pan, ten/tan, fan/fun;
  - vowels before /l/: feel/fill, file/fail, peel/pill;
  - /æ/ before /g/: bag/bug, beg/bag;
  - reduced function words: hat/had, bat/but;
  - abbreviations, names or sensitive words: mean/min, duck/doc, spam/span, mood/nude, got/god.

## Thin contrasts

The top-10k list cannot supply more than a few clean pairs for these:

| Contrast | Pairs |
| --- | --- |
| ch-j, w-v | 3 |
| dh-d, n-ng | 4 |
| dh-z, y-j, u-ux, ux-ah | 2 |

The u-ux pairs (pool/pull, fool/full) both put the vowel before /l/, where many American speakers merge /u/ and /ʊ/. Going deeper needs words from beyond the top-10k, which the catalog test does not allow today.
