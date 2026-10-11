# Letter-to-sound matcher (issue #283)

Measured on 2026-10-10. `matchLettersToSounds` in
`packages/phonetics-data/src/languages/en/letter-sounds.ts` splits an English spelling into
letter groups for one pronunciation: *knight* with /naɪt/ becomes kn → /n/, igh → /aɪ/, t → /t/.
It returns `null` when no split accounts for every letter and every sound. The Transcription
morph in #284 animates the words it can split and shows the rest as they appear today.

## How it works

**A hand-written table, not one learned from CMUdict.** About 100 letter groups each list the
sounds they can spell, most common first. The en-us teaching patterns were the starting point.
The rest came from running the coverage script and reading the failures and a random sample of
splits. I chose this over an expectation-maximization aligner for three reasons:

- The groups have to be teaching units. *ough*, *igh*, *kn* and *wr* are what a learner should
  see. An aligner learns whatever chunks are statistically convenient and tends toward one- or
  two-letter groups, so *ough* would come out as *ou* plus a silent *gh*.
- The table ships in the app bundle. A few hundred short strings are cheap. Learned
  probabilities for every chunk pair are not, and nobody can review them.
- A wrong split is easy to fix by hand: reorder or remove one entry and rerun the report.

**Search.** A dynamic-programming pass over (letters used, sounds used) finds the cheapest
split. Each group costs 1, plus 0.1 for each step down its entry's list, so common readings win
and fewer, longer groups beat many short ones. That is why *kn* beats a silent *k*, and *ough*
beats *ou* plus a silent *gh*. The table lists a few groups as silent: a final *e*, *h* and
*gh*. Any other letter can be silent at a cost of 3, which is how *island* and *Wednesday*
split. Apostrophes and hyphens are free silent groups. Joining the groups always gives back the
original spelling, including case.

**Left out.** Split spellings (*a-e* in *make*) are not modelled. The final *e* is a silent
group, and the vowel letter carries the long sound. A group spells at most two sounds (*x* →
/ks/, *le* → /əl/, *o* → /wʌ/ in *one*).

Some entries were removed because they swallowed letters that should be separate groups. *le*
as /l/ turned *holes* into *ho-le-s*. *sc* as /sk/ turned *scare* into *sc-are*. *ng* as /ndʒ/
turned *passenger* into *passe-ng-er*.

## Coverage

Reproduce with `bun run --cwd packages/helper-scripts letter-sound-coverage`. The script runs
the matcher over `packages/phonetics-data/data/en/curated/top-10k.json`. It writes a failure
table to `packages/helper-scripts/output/letter-sound-coverage.md`, grouped by the letters and
first sound left after the furthest point the matcher reached.

| Measure | Split |
| --- | ---: |
| Top 10k, first pronunciation | 9,868 / 10,000 (98.7%) |
| Top 1k, first pronunciation | 976 / 1,000 (97.6%) |
| Top 10k, any pronunciation | 9,879 / 10,000 (98.8%) |

A split is clean when every letter and every sound belongs to exactly one group, in order. A
unit test checks the same top-10k figure against a floor of 98%. It also checks that every
split rebuilds the spelling and the pronunciation.

### What fails

Of the 132 failures, 107 are abbreviations and single letters that CMUdict spells out as
letter names: *tv* /tiˈvi/, *bbc*, *usa*, *http*, *s*. They account for 23 of the 24 top-1k
failures. They have no letter-to-sound split to show, so falling back is the right result for
them.

The other 25 are real words:

- **Contractions with an unwritten vowel (4):** *would've*, *could've*, *should've*, *it'd*.
- **Names and loanwords (11):** *Edinburgh*, *Glasgow*, *Beijing*, *Southampton*, *Reuters*,
  *McDonald('s)*, *McCain*, *genre*, *entrepreneur(s)*.
- **Irregular spellings (8):** *February*, *colonel*, *choir*, *sergeant*, *eighth*, *Welsh*
  (/wɛltʃ/ in CMUdict), *kilometers*, *kilometres*.
- **CMUdict's /jəwə/ for *u* (2):** *genuine*, *genuinely*.

Leaving out abbreviations, the matcher splits 9,868 of 9,893 words (99.7%).

### Clean is not always ideal

166 splits (1.7%) use a silent letter that the table does not list as silent. Most are true
silent letters: *l* in *walk* and *would*, *t* in *listen*, *w* in *two* and *answer*, *b* in
*doubt*. Some reflect CMUdict dropping a vowel, such as the *a* in *basically* and the *o* in
*laboratory*. A few are acceptable but not how a teacher would group them, such as the *c* in
*except* (x → /ks/, silent c). The report doesn't flag these. Spot-checking the sample is the
way to find more.

## Proposed coverage target for #282

Keep at least 98% of the top 10k by first pronunciation, which the unit test now enforces.
Below that, the morph starts skipping words learners commonly type. Unsplittable words fall
back to today's rendering, so the target is a quality bar, not a requirement for #284 to work.

"Unusual for that spelling" is still open in #282. The table's order is one way to define it:
a group read with its first listed sound is typical, and a group read with a later one is
unusual. Exposing the rank on `LetterGroup` would let #284 use it without another table.
