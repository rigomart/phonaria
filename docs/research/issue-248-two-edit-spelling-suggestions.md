# Bounded two-edit spelling suggestions (issue #248)

A point-in-time record of the retrieval choice, the ranking policy, and what both cost. It
follows `issue-247-spelling-suggestion-case-review.md`, which recorded the one-edit
confidence policy this change is measured against.

- **Baseline**: the one-edit policy shipped at `46a82cf` (issue #247).
- **Data**: the repository's own `cmudict.json` (126,052 words) and `curated/top-10k.json`.
- **Timings**: one developer machine, for comparing the options against each other. Not
  production latency figures.

Reproduce everything below with:

```
bun --cwd apps/lab ./scripts/review-spelling-cases.ts            # the case tables
bun --cwd apps/lab ./scripts/review-spelling-cases.ts --sweep     # the sweeps
bun --cwd apps/lab ./scripts/review-spelling-cases.ts --tune      # the threshold sweeps
bun --cwd apps/lab ./scripts/measure-spelling-search.ts           # work, size and latency
```

The corpus lives in `apps/lab/scripts/spelling-corpus.ts`, and `review-spelling-cases.test.ts`
keeps the recorded outcome honest.

The sweeps call the shipped `pickPlausibleNeighbour` with swept `SuggestionWeights` rather than
a copy of the policy, so every number below was produced by the code that ships. That is why
the weights are exported at all: a threshold table measured against a second implementation is
worth nothing. The one-edit baseline is the same function with `maxEdits: 1` and both discounts
at 1, which is exactly the policy shipped at `46a82cf`.

## Retrieval: where the second edit comes from

A nine-letter token has ~530 one-edit variants and ~133,000 second-order ones. Enumerating
the query twice over and asking the database is therefore off the table, so the three viable
shapes were measured against each other.

| | A. scan the curated 10k | B. scan a full-dictionary index | C. ask the database |
| --- | --- | --- | --- |
| Where it runs | browser | browser | Turso |
| Asset to ship | **none** — already loaded for ranks | 360 KiB gzipped (1,045 KiB raw) | none |
| Index build | 2.4 ms, once per session | 14.3 ms, once per session | 4.2M rows to build and store |
| Scan, worst token | **0.19 ms** | 2.47 ms (13–20x slower) | one round trip |
| Whole request (12 scans) | **2.1 ms warm, 4.6 ms cold** | ~30 ms warm | 12 round trips, or one against a deletes index |
| Response size added | **0 bytes** | 0 bytes | ~45 keys per token, plus the answer |
| Extra offers bought | — | **0** | 0 |

**A is what ships.** The decisive number is the last row. Two edits are only read when the
curated list ranks the word — see the policy below — and the curated list is the only
frequency evidence the app has. Over the corpus tokens, option B finds 199 candidates option A
misses and **not one of them carries a curated rank**, so the policy could not offer any of
them however cheap the search became. The holdout case `brocolli` is the concrete instance:
option B finds `broccoli`, the curated list does not rank it, and the offer is still not made.
Option B would buy a 360 KiB asset and a 13–20x slower scan for nothing.

Option C is worse still. The naive form needs ~1,237 membership queries of 400 keys for five
representative tokens. The affordable form is a deletes index (SymSpell), which answers in one
round trip but costs 4,227,677 rows — 34 per word — to build, store and index in Turso, and
reaches exactly the words option B reaches, which the policy cannot offer either.

**No database index was added**, and the server side of retrieval is unchanged: one query per
request, 2–4 membership chunks for a long token, and a response that is byte-identical to
before (worst measured token: 161 bytes of neighbours).

This choice is worth revisiting only if a wider frequency source arrives. The limit is not the
search — it is having nothing to say about how common a word outside the top 10k is.

## Bounds

Per token and per request, so neither one token nor one paragraph can run away:

| Bound | Value | Why |
| --- | --- | --- |
| `MIN_LENGTH_FOR_TWO_EDITS` | 6 | Below it almost every short word is within two edits of almost every other, so `bg` and `cn` would pull in rivals rather than evidence. |
| Per-token work | structural | Only lengths inside the budget are visited, and a letter-presence mask rules out most of each bucket. The curated list is a fixed 10k asset, pinned by a test, so the scan cannot grow behind the bound. |
| `MAX_EXPANDED_TOKENS_PER_REQUEST` | 12 | A paragraph of nonsense does not become one scan per word. Earlier tokens win the budget, so the order never depends on the data. |

Measured ceiling with all of them saturated: 2.1 ms warm, 4.6 ms cold, 0 added bytes.
`classifyEdits` costs ~257 ns per call.

### A per-token candidate cap was tried and removed

The first version of this change capped each token's search at 32 results. Code review
questioned it, and the measurements agreed: it was the wrong kind of bound.

By the time it could truncate, the scan has already paid for every candidate it found, so the
cap saved nothing — removing it left the worst per-token scan at 0.19 ms and the whole-request
ceiling at 2.1 ms, both unchanged. What it did do was give the *search* a say in the decision.
The policy abstains when rivals sit too close together, and it can only do that for rivals it
is shown; discarding the rest in length-then-insertion order would let an arbitrary subset
settle the offer. The truncation was not rare either: tokens missing an early consonant reach
well past it — `saring` has 67 curated neighbours, `earing` 60, `seaking` 41.

Over 35,267 two-slip corruptions the pool averaged 2.18 candidates, with a 99.9th percentile of
29, so the cap bound on 0.071% of tokens. Re-running the whole corpus and every sweep with it
removed changed **no recorded number** — tuning 25/0/0 and holdout 18/1/4 either way, and all
five sweep rows identical. So it was never hiding a cost; it was an unnecessary way to be
wrong, and the search now returns everything it finds.

## The ranking policy

Every candidate — from the server's one-edit dictionary search or the curated scan — is read
the same way: find the most charitable edit script of at most two edits, then judge it.

An edit is **strong** when it contradicts nothing the learner typed: a letter supplied that
they left out, a doubled keystroke dropped, or a move between vowel letters, vowels being the
ambiguous part of English spelling. Replacing or reordering a consonant is **weak** — it rests
on guessing which key they meant, and a 126k-word dictionary holds a neighbour of that shape
for almost any input.

**The absolute gate**, applied before any candidate meets any other:

| Reading | Needs | Because |
| --- | --- | --- |
| one strong edit | nothing | `aardvrk → aardvark` stands on the slip alone. |
| one weak edit | a curated rank | The slip guesses; the word has to be demonstrably common. |
| two strong edits | a curated rank | `acomodate → accommodate`. |
| two edits, either weak | never offered | Not slip recovery but a search for anything nearby, and something is always nearby. |

**The separation rule**, unchanged from #247: the leader must score three times the runner-up,
or nothing is offered. Uniqueness is settled *after* the gate, never before — one surviving
candidate means only that the search found one word.

```
score = patternWeight × editWeight / (rank + 1)
        patternWeight: 1 strong, 0.25 weak
        editWeight:    1 for one edit, 0.1 for two
        rank:          curated rank, or 10,000 when unranked
```

### Where the two new weights came from

`WEAK_PATTERN_WEIGHT = 0.25`. It is what separates `adress → address` from `adress → dress`:
a letter left out against a letter dropped. Ranks alone cannot — 1,279 against 1,776 is nowhere
near a 3x lead. On the tuning split, 0.25 is where the correct count rises to 22 and one-slip
wrongness is lowest (1.8%, against 2.8% undiscounted).

`TWO_EDIT_WEIGHT = 0.1`. This is the knob the wider search made necessary, and the one place
this change nearly broke the feature. A two-edit neighbour of a common word is often itself a
common word: `recieve` is one edit from `receive` and two from `received`. At 0.5, `received`
denied `receive` its lead and **`recieve`, `receve` and `recceive` all went silent** — the
ticket's warning about "more misleading competitors", arriving exactly as predicted. A tenth
means a two-edit reading wins only when it is roughly thirty times more common than the
one-edit reading it would displace. The tuning split is flat from 0.15 down to 0.05; a tenth
is the round value inside that range.

### A tighter absolute floor was measured and rejected

The first draft capped weak readings at a better rank than the list's end, on the theory that
"in the top 10k" is a weak floor. The tuning sweeps said otherwise (measured while the caps
were still parameters; they were removed once the numbers came in):

| weak-reading rank cap | tuning correct/wrong | one slip recovered / wrong |
| --- | --- | --- |
| 1,000 | 22 / 0 | 46.0% / 2.8% |
| 2,500 | 22 / 0 | 50.7% / 2.6% |
| 5,000 | 22 / 0 | 62.4% / 2.6% |
| 10,000 (curated membership) | 22 / 0 | **83.3% / 1.8%** |

A tighter cap costs recovery *and raises* the wrong-offer rate, because dropping a correct
leader can leave a wrong rival standing alone and unopposed. The same held for the two-edit cap
(28.4% recovered at 10,000 against 6.0% at 1,000, with wrongness flat). So the absolute floor
is curated membership itself, and the policy carries no numeric rank cap. This also answers the
"one-rank cliff" that #247 recorded as a known cost: the cliff is still there, but nothing
tighter was found to be worth its price.

## Corpus outcome

64 cases in 12 error categories. **Tuning** cases are what the thresholds were chosen against;
every #247 case is tuning, because the one-edit policy was fitted to them. **Holdout** cases
were written before any constant here was picked and read only afterwards.

A case records every correction a learner could reasonably have meant, not one blessed answer.
Where intent genuinely cannot be settled, silence is recorded as an *abstention* rather than a
miss — so no case forces an interpretation to improve a score.

| verdict | tuning: baseline → change | holdout: baseline → change |
| --- | --- | --- |
| correct | 21 → **25** | 18 → 18 |
| wrong | 0 → 0 | 2 → **1** |
| missed | 4 → **0** | 3 → 4 |
| abstained | 1 → 1 | 0 → 0 |
| correctly silent | 10 → 10 | 5 → 5 |
| not offered (dictionary hit) | 4 → 4 | 7 → 7 |

By error category, across both splits:

Every verdict is printed, including `not offered`, so each row adds up to its case count — the
script throws if it ever does not. Eleven cases are words CMUDict already knows, spread across
several categories, and those never reach suggestion at all.

| category | cases | correct | wrong | missed | abstained | silent | not offered |
| --- | --- | --- | --- | --- | --- | --- | --- |
| transposition | 8 | 7 → 7 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 1 → 1 |
| omitted letter | 10 | 7 → **8** | 0 → 0 | 1 → **0** | 0 → 0 | 0 → 0 | 2 → 2 |
| doubled letter | 5 | 5 → 5 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| vowel confusion | 6 | 4 → 4 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 2 → 2 |
| consonant confusion | 1 | 1 → 1 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| two slips | 6 | 0 → **3** | 1 → **0** | 5 → 3 | 0 → 0 | 0 → 0 | 0 → 0 |
| short ambiguous | 8 | 5 → 5 | 0 → 0 | 0 → 0 | 1 → 1 | 2 → 2 | 0 → 0 |
| contraction | 4 | 4 → 4 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| uncommon valid | 7 | 6 → 6 | 0 → 0 | 1 → 1 | 0 → 0 | 0 → 0 | 0 → 0 |
| name | 6 | 0 → 0 | 1 → 1 | 0 → 0 | 0 → 0 | 3 → 3 | 2 → 2 |
| intentional unknown | 10 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 10 → 10 | 0 → 0 |
| dictionary hit | 4 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 4 → 4 |

**No correction the one-edit policy got right was lost.** That is asserted in the test, not
just observed.

### The two named acceptance cases

`acomodate → accommodate` works, and it is worth seeing why it is not a lucky ranking: the
curated scan finds exactly one candidate, two supplied letters and nothing contradicted, ranked
6,777. The offer rests entirely on the absolute gate.

`definatly` is the ambiguous one the ticket asked to be assessed rather than assumed.
`defiantly` is **one** edit away; `definitely` is **two**. The nearer word loses because its
edit reorders a consonant and nothing vouches for it, while the further one contradicts nothing
and is ranked 1,152. Offering `defiantly` would require the learner to have made a second,
different slip on a rarer word. Recorded as `intended: definitely`; `defiantly` is not in the
acceptable set, and the reasoning is in the case note rather than in a threshold.

### What is still missed, and why

Every miss is a ranking outcome, not a search gap. Checked individually:

| token | wanted | what happened |
| --- | --- | --- |
| `probly` | probably | `problem` (rank 381, two strong edits) against `probably` (rank 415, two strong edits). Scores within 10%; nothing settles it, so the policy abstains. |
| `succesfull` | successful | `successful` (1,226) leads `successfully` (3,311) by 2.7x against a 3x rule. A near miss on separation, left alone rather than have the lead ratio tuned to one holdout case. |
| `rember` | remember | `member` — a weak one-edit reading of a common word (666) — outscores `remember` (407, two strong edits) 1.5x, so neither wins. The baseline **offered `member`**, which a learner would have to undo; silence is the better failure. |
| `brocolli` | broccoli | `broccoli` is outside the curated 10k, so a two-edit reading has no frequency evidence. This is the coverage limit of the retrieval choice, and option B would not fix it. |
| `adress`, `wnat` | — | Both recovered or correctly abstained now. `adress → address` is new; `wnat` stays an abstention between `want` and `what`. |

One wrong offer survives, on the holdout split: `marquetta → marquette`, a vowel-for-vowel slip
onto a curated-ranked place name. The one-edit baseline makes the same offer, so it is not a
cost of this change. Names remain the weakest category.

## Sweeps

Decision support, not a benchmark. Each trial corrupts a real dictionary word with one or two
random slips and keeps the cases that actually miss CMUDict, so they reach suggestion. Seeded,
so the numbers reproduce.

| sweep | trials | recovered | wrong |
| --- | --- | --- | --- |
| curated words, one slip | 3,736 | 86.3% → **87.1%** | 2.6% → **1.6%** |
| curated words, two slips | 3,466 | 8.3% → **28.4%** | 6.8% → 6.7% |
| beyond-curated words, one slip | 3,705 | 46.6% → 46.6% | 3.4% → **2.9%** |
| beyond-curated words, two slips | 3,509 | 2.2% → 2.2% | 5.5% → 6.0% |
| random pronounceable non-words | 4,000 | — | offered 1.7% → 1.8% |

Read together: two-slip recovery on common words more than triples, one-slip recovery and
wrongness both improve slightly, and the rate of saying anything at all about input with no
word behind it is unchanged.

The one regression is the last sweep row: doubly-corrupted rare words draw 0.5 percentage
points more wrong offers, because such a token can now land two edits from a *common* word and
be offered it. That is the price of the second edit, it is small, and it falls on input that is
already two slips away from a word the curated list has never heard of.

## What this change did not do

- No new Turso table, index or query. Server retrieval is untouched.
- No phonetic matching, and no split/join edits — issues #250 and #251.
- No multiple-choice UI. The feature still makes one advisory phrase-level offer, and the
  ambiguous cases above abstain rather than present rivals. That is issue #249, and `probly`,
  `wnat`, `ther` and `wether` are the cases waiting for it.
- No change to transcription acceptance, formatting, stale-request handling, or the
  optional-failure behaviour from #246.
- The **Spelling suggestion** definition in `CONTEXT.md` was updated: it now reads "up to two
  slips", states which readings need frequency evidence, and records that being the *nearest*
  word is not evidence either — the `definatly` case in prose.
