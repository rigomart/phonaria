# Azure pronunciation baseline (issue #328)

The iteration 1 gate for [#324](https://github.com/rigomart/phonaria/issues/324): can Azure
Pronunciation Assessment name the sound a learner said instead, while almost never marking a
correct sound wrong?

**Decision: yes. Build iteration 2 on Azure.** Over three Azure TTS voices, 0.9% of correct
recordings were judged `swapped` and 90.7% of swapped recordings were named with the right sound.
Iteration 4 (our own scorer) stays after iteration 2.

Run on 2026-10-19 with the eval harness in `packages/pronunciation/src/harness`, the Azure scorer
from #326 (short-audio REST, IPA, 10 n-best phonemes) and the judge's `LENIENT_MARGINS` (match
0.05, swap 0.2, match floor 0.5). Nothing was tuned.

## Method

For every minimal pair (A, B) in the catalog, both ways round, the harness judges only the sound
where the pair differs, with the contrast's two sounds as the judged set:

- **Correct**: a recording of A against target A should be `match`.
- **Swap**: a recording of B against target A should be `swapped` with B's sound.

27 contrasts, 254 pairs and 400 words give 508 correct and 508 swap cases per voice. The voices:

- **Jenny** (`en-US-JennyNeural`, 10% slower): the catalog recordings the app plays.
- **Guy** (`en-US-GuyNeural`, male) and **Aria** (`en-US-AriaNeural`), at default speed, generated
  with `audio-gen` for this run and not reviewed by ear.

Every clip was converted to 16 kHz mono 16-bit PCM WAV. All three voices are spoken from explicit
IPA tags, so each clip says the dictionary pronunciation.

## Results

| Voice | False flag | Correct unclear | Swap named | Misnamed | Missed | Swap unclear | No evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| All three | 0.9% (14 of 1,524) | 6.6% | 90.7% (1,382 of 1,524) | 0.4% | 1.4% | 7.3% | 0.2% |
| Jenny | 0.8% (4) | 8.3% | 88.8% | 1.0% | 1.4% | 8.7% | 0.4% |
| Guy | 1.8% (9) | 8.3% | 88.2% | 0.0% | 2.4% | 9.4% | 0.0% |
| Aria | 0.2% (1) | 3.3% | 95.1% | 0.2% | 0.6% | 3.9% | 0.2% |

Real voices: none yet. [#327](https://github.com/rigomart/phonaria/issues/327) records them for
the check before production (see below).

Every false flag was a vowel. The 18 consonant contrasts gave no false flags in 1,014 correct
cases:

| Contrasts | False flag | Correct unclear | Swap named | Swap unclear | Missed |
| --- | --- | --- | --- | --- | --- |
| Consonants (18) | 0.0% (0 of 1,014) | 3.9% | 94.4% | 5.5% | 0.0% |
| Vowels (9) | 2.7% (14 of 510) | 12.0% | 83.3% | 11.0% | 4.3% |

## Worst contrasts

By false-flag rate over the three voices:

| Contrast | False flag | Correct unclear | Swap named | What beat the target |
| --- | --- | --- | --- | --- |
| u-ux (/u/–/ʊ/) | 16.7% (2 of 12) | 25.0% | 58.3% | /ʊ/ or /u/ |
| e-ae (/ɛ/–/æ/) | 7.6% (5 of 66) | 6.1% | 81.8% | /æ/ 7 times |
| ou-au (/oʊ/–/aʊ/) | 6.7% (2 of 30) | 13.3% | 73.3% | /ʌ/, /oʊ/, /aʊ/ |
| ae-a (/æ/–/ɑ/) | 5.6% (3 of 54) | 9.3% | 85.2% | /ʌ/ 5 times |
| ah-a (/ʌ/–/ɑ/) | 3.3% (2 of 60) | 21.7% | 71.7% | /ʌ/, /æ/, /ɑ/ |
| i-ix (/i/–/ɪ/) | 0.0% | 27.8% | 73.3% | /ɛ/ 18 times |
| b-v | 0.0% | 16.7% | 77.8% | /ð/ 4 times |
| th-s | 0.0% | 10.6% | 90.9% | /f/ 2 times |

Why:

- **Front and low vowels blur.** Azure often scores /ɛ/ as /æ/ (Guy's *bet*, *pet* and *wreck*;
  Jenny's *trek*) and /ɑ/ as /ʌ/ (Jenny's *hot*, which counts in both ae-a and ah-a). The same blur
  makes swaps misnamed: Jenny's *cop* against *cap* came back as /ʌ/, not /ɑ/.
- **/u/–/ʊ/ is thin.** The catalog has two pairs, and *fool* was heard as /ʊ/ in two of three
  voices. With 12 correct cases, one recording moves the rate by 8 points.
- **/ɪ/ loses to /ɛ/.** For correct /ɪ/, /ɛ/ tied or beat the target 18 times. /ɛ/ isn't a
  contrast partner of /ɪ/, so the judge says `unclear` rather than `swapped`: that rule kept these
  out of the false flags. It also leaves 26.7% of i-ix swaps unclear, because *sit* said against
  *seat* is heard as /ɛ/ as often as /ɪ/.
- **/θ/ and the labials draw fricative neighbours.** On correct /θ/, /f/ scores within 0.05 of
  the target (*math*, *path*, *think*, *death*), the low n-best for /θ/ that #324 warned about. /ð/
  ties or beats both /b/ and /v/ (*van*, *vet*, *bet*). Neither is a partner, so these are
  `unclear`, not false flags.
- **Neighbouring sounds and r-coloured units did not decide anything here.** See below.

Some of these may be the TTS voice and not Azure. Nobody listened to Guy's and Aria's clips.

## What n-best returns

From all 2,724 responses (8,556 scored phonemes):

- Every phoneme came back with exactly 10 n-best entries. The top entry scored 100 in 99.5% of
  them; the other 40 topped out between 91 and 99.
- **Ties at 100** are rare: 1.3% of phonemes. On the judged sound, the target tied its best rival
  in 1.8% of correct recordings.
- **Neighbouring sounds are always listed but rarely compete.** A sound next to the judged one
  appears in the top four 62% of the time, at a median score of 17. It reaches 50 in 7.9% of lists
  and 100 in 0.1%. The second-best entry averages 35.
- **The evidence is clear-cut on the judged sound.** On correct recordings the target scored above
  every rival in 93.8% of cases, by 0.5 or more in 77%. On swaps a rival won in 97.8%, and the
  partner won by 0.5 or more in 85.6%.
- **R-coloured units** (`ɑɹ`, `ɛɹ` and the others, which the adapter scores as target-only) made up
  1% of phonemes and never fell on a judged sound in this catalog. They will matter once every
  sound is judged (#333).
- **Some responses carry no assessment.** 5 of 2,724 (0.18%) came back HTTP 200 with no phoneme
  scores: four had the word but no phonemes, one was a bare `{"Offset":0,"Duration":0}`. Three
  re-sent by hand all came back fully assessed, so it is transient. The judge sees no evidence and
  the harness counts it; the Worker route (#329) should retry once when a word has no phonemes.

The same audio scored twice gives the same numbers (#326), so the cached responses are a fixed
baseline.

## Other margins

Judged again from the cached responses. For information only; tuning is #335.

| Margins | False flag | Swap named | Unclear |
| --- | --- | --- | --- |
| swap 0.1 | 0.9% | 91.5% | 6.6% |
| **swap 0.2 (current)** | **0.9%** | **90.7%** | **7.0%** |
| swap 0.35 | 0.7% | 87.3% | 8.8% |
| swap 0.5 | 0.4% | 84.6% | 10.3% |
| match 0, swap 0.2 | 0.9% | 90.7% | 5.0% |

Raising the swap margin buys little: false flags sit mostly at large gaps (Guy's *coach* scored
/oʊ/ 0.10 against /aʊ/ 1.0). Going from 0.2 to 0.5 removes 8 false flags and loses 93 swaps
named, about 12 for each.

## The false-flag target

**At most 2% of correct recordings judged `swapped`, on each voice, with every sound in the word
judged.** This is the target for the rest of #324: #333 must meet it on the harness, and #335
tunes towards it.

It holds today on every voice for the contrast sound alone (Jenny 0.8%, Guy 1.8%, Aria 0.2%).
Judging every sound adds more chances to flag a correct word. The vowel contrasts above are where
the margin will go first. Swap named is not a target, but it should stay above 80%; the current
judge gives 90.7%.

## TTS flatters Azure

These numbers are an upper bound. The three voices are Azure's own TTS, clean and studio-even,
spoken from exact IPA, and scored by the same company's models. Real learners have accents,
noisy rooms and laptop microphones, and they produce sounds between the two in a pair. Expect
more unclear verdicts and more false flags.

So the real-voice run is a required check, not a formality. Before `FLAG_SPEECH` is turned on in
production, after the feature has been tried on staging, the #327 recordings must meet the same
target: at most 2% false flags with every sound judged. The harness runs them with
`--voices-dir=<dir>`, laid out as `<speaker>/<word>.wav` with an optional `labels.json`; see the
package README.

## Reproducing

Generate each extra voice from `packages/audio-gen` (Aria the same way, with
`en-US-AriaNeural` and `output/tts/aria`), then run the harness from the repo root:

```bash
AZURE_SPEECH_VOICE=en-US-GuyNeural bun --env-file=../pronunciation/.env src/generate.ts \
  --rate=0 --out="$PWD/../pronunciation/output/tts/guy"
bun run --cwd packages/pronunciation harness run --catalog \
  --tts-dir=output/tts/guy --tts-dir=output/tts/aria --report=baseline
```

The run made 2,724 assessment requests (about 83 minutes of audio) four at a time, plus 3
re-sent by hand. Azure returned no throttling and no errors. The two extra voices took 800
synthesis requests. Reports and the response cache are in the ignored
`packages/pronunciation/output/`, so a rerun or a judge change costs no calls.

## Every sound judged (#333)

Run on 2026-10-20, offline from a fresh cache, with the same margins. Since #345 the scorer sends
`EnableMiscue` and a plain recognition with each assessment, so the cache was rebuilt with 2,724
live requests (30 failed and were re-sent). Judged the old way, on the contrast sound only, the new
answers barely move: false flag 0.9%, swap named 89.8%. No evidence rose from 0.2% to 0.5%
(Aria 1.1%): more words came back with no phonemes.

The judge now rates every sound in the word against its own contrast partners. The en-us variants
in `EnglishPhonemeAllophones` count as `match`: the flap for /t/ and /d/ between vowels, and /p/ and
/k/ after a word-initial /s/ heard as /b/ and /ɡ/. A recording counts as flagged when any of its
sounds is judged `swapped`, once per take:

| Voice | Recordings flagged, contrast sound | Recordings flagged, every sound | Swap named, every sound |
| --- | --- | --- | --- |
| Jenny | 0.8% (3 of 400) | 1.0% (4) | 88.4% |
| Guy | 2.3% (9) | **4.0% (16)** | 86.6% |
| Aria | 0.3% (1) | 0.3% (1) | 94.7% |

**Guy misses the 2% target with the single margins.** Of the 41 falsely flagged sounds across the
three voices, 34 are Guy's, and they are the vowel blur described above, now on sounds outside the
contrast: /ɛ/ heard as /æ/ 16 times (*bet*, *pet*, *met*, *vet*), /æ/ as /ɑ/ 4 and as /ʌ/ 3, /i/
as /ɪ/ 4. A single swap margin of 0.5 brings Guy to 1.4% but swap named down to 80.3%. Margins per
sound are #335's job.

Two choices to know about:

- **Accepted variants that equal a contrast partner.** The flap is heard as /d/ for /t/ (and as
  /t/ for /d/), and /p k/ after /s/ as /b ɡ/. Those are partners in t-d, p-b and k-g. English
  doesn't contrast them in those positions, and a test checks that no catalog pair differs on such
  a sound.
- **/p k/ after /s/ only at the start of a word.** No English word starts with /sb/ or /sɡ/, but
  inside a word they occur: *discussed* and *disgust*, *disperse* and *disburse*. In the curated
  top-10k, 152 words start with s+p or s+k and 199 have one inside the word; 8 words have /sb/ or
  /sɡ/ inside (*disgusting*, *baseball*, *thanksgiving*), and no pair differs only by p-b or k-g
  after /s/, so a dictionary exception list would be empty and still miss *disgust*. Without
  syllables or stress there is no finer context to use. Narrowing the rule changed no verdict on
  the catalog.
- **The flap is accepted before a stressed vowel too** (*adopt*), where speakers don't flap,
  because the judged pronunciations carry no stress. This can only miss a mistake, never invent one.

The word gate now lets a single partner swap through on any sound, so *chip* for *ship* reaches
the judge. A low sound leaves the word to the judge only when a
contrast partner or an allowed variant scores highest there; a partner that merely beats the target
while another sound wins doesn't count, or *ships* for *ship* would pass on a /b/ just above the
/p/. False rejects on the catalog went from 22 cases to 23. Two are gone, Guy's *met* against *net*
("matt") and *pet* against *bet* ("pat"), where /æ/ tops the vowel. Three recordings are new, each
transcribed as another word with a vowel that isn't a partner on top: Guy's *sit* ("set") and
*boat* ("but", /ʌ/ top, already rejected in contrasts that don't judge the vowel), and Jenny's
*chick* against *cheek* ("check", /ɛ/ top).

## Margins per sound (#335)

Run on 2026-10-20, offline from the #333 cache, every sound judged, on the judge with the review fixes above. `harness tune` picks a swap
margin for each target sound and writes `packages/pronunciation/src/azure/judge-thresholds.json`,
which the judge uses when it is given no margins. The same cache gives the same file byte for
byte, and `harness tune --check` fails when the committed file is out of date.

The rule:

- **Only swap margins move, and only up**, from 0.2 in steps of 0.05. No sound is judged less
  leniently than before. The match margin and floor stay at 0.05 and 0.5: with a swap margin above
  zero they only decide between `match` and `unclear`, never a flag or a named swap.
- **Each sound** said correctly at least 50 times gets the smallest swap margin that keeps its
  false flags at or under 2%, over the three voices and on each voice where it was said 50 times.
  Said correctly means every sound of a correct recording and every sound but the contrast one of
  a pair recording.
- **Then each voice**: while one has more than 2% of its recordings flagged, the sound that clears
  the most of them for each swap it stops naming moves up to the first margin that clears any. If
  no single sound clears one, every flagged sound of one flagged recording moves together. That
  never happened on this run.

| Voice | Recordings flagged before | After | Swap named before | After |
| --- | --- | --- | --- | --- |
| Jenny | 1.0% (4 of 400) | 0.5% (2) | 88.4% | 87.6% |
| Guy | 4.0% (16) | **1.8% (7)** | 86.6% | 86.2% |
| Aria | 0.3% (1) | 0.3% (1) | 94.7% | 94.1% |
| All three | 1.8% (21 of 1,200) | 0.8% (10) | 89.9% (1,370 of 1,524) | 89.3% (1,361) |

**Every voice now meets the target with every sound judged.** It costs 9 named swaps out of
1,524; they become close calls, and unclear goes from 6.5% to 7.2%. On the contrast sound alone
the tuned judge gives Jenny 0.5%, Guy 1.3% and Aria 0.3% recordings flagged, swap named 89.2%.

Four sounds moved, all vowels:

| Sound | Swap margin | False flags before | After | Swaps named |
| --- | --- | --- | --- | --- |
| /ɛ/ (E) | 0.55 | 12 of 250 (Guy 11) | 0 | 32 to 29 of 33 |
| /æ/ (AE) | 0.45 | 7 of 313 (all Guy) | 2 (Guy) | 79 to 73 of 102 |
| /aɪ/ (AI) | 0.45 | 2 of 163 (both Jenny) | 0 | 51 of 51, unchanged |
| /i/ (I) | 0.7 | 3 of 267 (all Guy) | 0 | 28 of 42, unchanged |

The /i/ margin looks large, but every swap it names (*sit* said for *seat*) wins by at least 0.7,
so the step cost nothing here. Still flagged: Guy's /æ/ as /ɑ/, /n/ as /ŋ/ and /s/ as /z/ twice
each and /ʌ/, /oʊ/ and /aʊ/ once, Jenny's /ɑ/ once, and /u/ once each on Jenny and Aria. Each of
those sounds is at or under 2% over the three voices, and on each voice that said it 50 times,
except /aʊ/.

Kept at the default, said correctly fewer than 50 times: /aʊ/ (47, with Guy's one flag, 2.1%),
/ə/ (24), /ð/ (15), /h/ (39), /dʒ/ (15), /ʊ/ (21) and /j/ (18). At 50, a single flag is the
whole 2% target, so fewer cases can't tell a margin from one odd recording. A minimum of 40 shows
what happens otherwise: /aʊ/ goes to 1.0 and /oʊ/ to 0.95 to clear one Guy flag each, and 17 more
swaps go unnamed.

### Leave one voice out

Tuned on two voices, measured on the third:

| Left out | Moved on the other two | Recordings flagged before | After | Swap named before | After |
| --- | --- | --- | --- | --- | --- |
| Jenny | /æ/ 0.45, /ɛ/ 0.55, /i/ 0.7 | 1.0% (4) | 0.8% (3) | 88.4% | 87.6% |
| Guy | /aɪ/ 0.45 | 4.0% (16) | **4.0% (16)** | 86.6% | 86.6% |
| Aria | all four | 0.3% (1) | 0.3% (1) | 94.7% | 94.1% |

**The margins that matter come from Guy alone.** Jenny and Aria barely flag, so tuned on them the
script moves only /aɪ/, and Guy stays at 4.0%. The in-sample 1.8% shows the margins fit Guy's
vowel blur; it doesn't show they hold for a voice that blurs other sounds. The real-voice run
(#327) is the test that counts, and the script should be rerun with those recordings added
(`harness tune` takes sources as `harness run` does).

To reproduce, from the repo root:

```bash
bun run --cwd packages/pronunciation harness tune --check
bun run --cwd packages/pronunciation harness run --catalog \
  --tts-dir=output/tts/guy --tts-dir=output/tts/aria --offline --report=tuned
bun run --cwd packages/pronunciation harness run --catalog \
  --tts-dir=output/tts/guy --tts-dir=output/tts/aria --offline --margins=lenient --report=lenient
```
