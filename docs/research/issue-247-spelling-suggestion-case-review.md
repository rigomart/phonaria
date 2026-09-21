# Spelling suggestion case review (issue #247)

A point-in-time record of the case review behind the conservative one-edit policy. It
explains which rule was chosen, what it costs, and how to reproduce the numbers.

- **Before**: the policy shipped at `3cc4464`, where `pickObviousNeighbour` offered any
  unique candidate unconditionally.
- **After**: the policy in this change.
- **Data**: the repository's own `cmudict.json` (126,052 words) and `curated/top-10k.json`.

Reproduce both columns, and the sweeps further down, with:

```
bun --cwd apps/lab ./scripts/review-spelling-cases.ts           # the case table
bun --cwd apps/lab ./scripts/review-spelling-cases.ts --sweep   # plus the sweeps
```

The script keeps the `3cc4464` rule frozen as `previousPolicyPick` so the before column
stays reproducible. `apps/lab/scripts/review-spelling-cases.test.ts` keeps the after
column honest.

## The rule

A candidate is offered when **either** kind of evidence supports it:

- **Frequency evidence** — the curated top-10k gives the word a rank, so people demonstrably
  use it. A word with no rank has *no evidence either way*; that is not the same as evidence
  the word is rare, and the `SpellingFrequency` interface now returns `null` rather than a
  sentinel rank so the two cannot be confused.
- **Slip evidence** — the single edit contradicts nothing the learner typed: every letter
  survives in order (they left one out), a doubled keystroke is dropped, or only vowels move.
  Replacing or reordering a consonant is different: it rests on guessing which key they meant,
  and a 126k-word pronunciation dictionary holds a neighbour of that shape for almost any
  input. Note this makes *any* insertion strong, including a consonant the learner omitted.

Candidates that fail both are dropped before anything is ranked. **Uniqueness is settled
after that filter, never before it** — finding exactly one candidate says only that the
search found one word. Survivors are then ranked by the existing 3× frequency lead.

Dropping implausible rivals also *unblocks* good leaders: a candidate with no frequency
evidence used to score just past the curated list and deny a low-ranked leader its lead.

Worth naming plainly: any curated rank counts as frequency evidence, so rank 9,999 qualifies
and rank-absent does not. That is a one-rank cliff at the edge of the list, and for weak slips
it amounts to the curated-10k gate the ticket cautioned against — only strong slips escape it.
That is the price of having a 10k list as the sole frequency evidence; a wider list would move
the cliff rather than remove it.

## Reviewed cases

| Group | Token | Useful correction | Before | After | Verdict |
| --- | --- | --- | --- | --- | --- |
| common typo | `recieve` | receive | receive | receive | correct |
| common typo | `teh` | the | the | the | correct |
| common typo | `receve` | receive | receive | receive | correct |
| common typo | `recceive` | receive | receive | receive | correct |
| common typo | `seperate` | separate | separate | separate | correct |
| common typo | `occured` | occurred | occurred | occurred | correct |
| common typo | `becuase` | because | because | because | correct |
| common typo | `adress` | address | _(silent)_ | _(silent)_ | missed by both |
| common typo | `wnat` | want | _(silent)_ | _(silent)_ | missed by both |
| common typo | `thnik` | think | think | think | correct |
| common typo | `alwasy` | always | always | always | correct |
| common typo | `becomming` | becoming | becoming | becoming | correct |
| obscure neighbour | `reciv` | _(silent)_ | **recio** | _(silent)_ | **fixed** |
| obscure neighbour | `langwidge` | _(silent)_ | **langridge** | _(silent)_ | **fixed** |
| obscure neighbour | `definatly` | _(silent)_ | **defiantly** | _(silent)_ | **fixed** |
| short ambiguous | `frm` | from | from | from | correct |
| short ambiguous | `bg` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| short ambiguous | `cn` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| short ambiguous | `wrk` | work | work | work | correct |
| name | `sanjeev` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| name | `kowalevski` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| name | `rigomart` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| unknown word | `zxqvwoplmj` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| unknown word | `blorptastic` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| unknown word | `flumoxinate` | _(silent)_ | _(silent)_ | _(silent)_ | correctly silent |
| contraction | `dont` | don't | don't | don't | correct |
| contraction | `isnt` | isn't | isn't | isn't | correct |
| contraction | `doesnt` | doesn't | doesn't | doesn't | correct |
| contraction | `wouldnt` | wouldn't | wouldn't | wouldn't | correct |
| uncommon valid | `aardvrk` | aardvark | aardvark | aardvark | correct |
| uncommon valid | `zucchinni` | zucchini | zucchini | zucchini | correct |
| uncommon valid | `rhinocerus` | rhinoceros | rhinoceros | rhinoceros | correct |
| uncommon valid | `asparagas` | asparagus | asparagus | asparagus | correct |
| uncommon valid | `wierdness` | weirdness | weirdness | weirdness | correct |
| dictionary hit | `fone` | — | — | — | not offered |
| dictionary hit | `nite` | — | — | — | not offered |
| dictionary hit | `alot` | — | — | — | not offered |
| dictionary hit | `thier` | — | — | — | not offered |

| | Before | After |
| --- | --- | --- |
| Correct | 21 | 21 |
| Wrong | 3 | **0** |
| Missed | 2 | 2 |
| Correctly silent | 8 | **11** |

`fone`, `nite`, `alot` and `thier` are words CMUDict already knows. They never reach
suggestion at all, so they are listed as dictionary hits rather than as unknown-word
fixtures. Whether the feature should ever question a dictionary hit is issue #251.

### Useful corrections lost

**None in the reviewed set.** Every correction the previous policy got right, this one
still gets right. The two misses (`adress`, `wnat`) are missed by both policies: each has
two candidates of comparable frequency — `address` (1279) against `dress` (1776), and
`what` (45) against `want` (95) — so no 3× lead can be established. Recovering them needs
the ranking work in issue #248, not a looser plausibility rule.

The cost is real but falls outside the reviewed set, on uncommon words. See below.

## Where the policy does cost coverage

Decision support only; not a benchmark. Each sweep corrupts real dictionary words with one
random slip and keeps the cases that actually miss CMUDict, so they reach suggestion.

| Sweep | Measure | Before | After |
| --- | --- | --- | --- |
| Corrupted curated words (3,537) | recovered | 68.2% | **77.9%** |
| | wrong | 5.8% | 5.8% |
| Corrupted beyond-curated words (3,711) | recovered | **76.1%** | 47.5% |
| | wrong | 1.5% | 3.1% |
| Random pronounceable non-words (3,968) | offered anything | 10.7% | **4.8%** |

Read together: the policy recovers *more* common words, offers *less* on input with no
word behind it, and gives up roughly a third of its recovery on words the curated list
has never heard of. That last group is the deliberate trade — `recio` and `langridge` are
exactly that kind of word, and no evidence available today separates them from `aardvark`
beyond the shape of the slip.

### A rule that was considered and rejected

Restricting strong slip evidence to insertions and doubled-letter deletions alone — without
the vowel-for-vowel relaxation — was measured too. It rejected the same bad offers, but also
lost `rhinocerus → rhinoceros`, `asparagas → asparagus` and `wierdness → weirdness`, for
18 correct instead of 21. English vowel letters are the ambiguous part of spelling, so a
vowel-only change keeps the part a learner gets right when they know the word.

## Candidate reuse

Variants were generated three times per missed token: twice in `attachSpellingNeighbours`
(once for the membership query, once per token to filter it) and again in the browser.

- The server now generates each token's variants once and reuses them for both passes.
- The browser no longer regenerates anything. The candidates travel on the word in the
  existing `spellingNeighbours` field, so each token carries its own.

This is outcome-preserving. The browser's candidate set was `variants ∩ (curated ∪ pooled)`
and the server sends `variants(token) ∩ CMUDict`; these are equal because every curated word
is a CMUDict word — guaranteed by `generate-curated-chunks.py`, which skips any word CMUDict
does not have. Checked directly over 2,795 sampled missed tokens: zero differences.

The old browser code pooled every missed token's neighbours into one dictionary, which looks
like a per-token association bug but was not one: intersecting that pool back with a single
token's own variants returned exactly that token's neighbours. Per-token candidates are the
clearer contract, not a behaviour fix.

One consequence worth naming: if the server's neighbour query fails, the browser now has no
candidates and offers nothing, where before it could still search the curated 10k. The
failure is already caught and logged, and degrading to silence is the safe direction.
