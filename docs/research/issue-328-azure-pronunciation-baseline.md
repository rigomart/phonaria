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

## Five more voices (#354)

Run on 2026-10-28: does the tuned judge hold on voices it wasn't tuned on? The catalog's 400
words were generated with `audio-gen` at default speed, from the same IPA tags, in five more
prebuilt neural voices: Andrew (`en-US-AndrewNeural`), Brian, Emma, Ava and Davis. As with Guy
and Aria, nobody listened to them before the run. The harness judged every sound with the tuned
thresholds from #335, unchanged. Jenny, Guy and Aria came from the cache and match the tuned
results above. The clips and scores are for testing the judge only; they are not published or used
for training.

**The tuned thresholds don't hold.** Three of the five new voices miss the 2% target:

| Voice | Recordings flagged | False flag | Swap named | Unclear | Stopped by the gate | Target |
| --- | --- | --- | --- | --- | --- | --- |
| Jenny | 0.5% (2 of 400) | 0.6% (3) | 87.6% | 9.0% | 0.5% (5) | met |
| Guy | 1.8% (7) | 1.4% (7) | 86.2% | 8.8% | 1.5% (15) | met |
| Aria | 0.3% (1) | 0.2% (1) | 94.1% | 3.7% | 0.3% (3) | met |
| Andrew | **4.3% (17)** | 3.9% (20) | 67.5% | 7.5% | 18.6% (189) | missed |
| Brian | 1.3% (5) | 1.4% (7) | 62.8% | 10.8% | 21.9% (223) | met |
| Emma | **4.5% (18)** | 4.1% (21) | 66.5% | 12.6% | 15.0% (152) | missed |
| Ava | 1.3% (5) | 1.8% (9) | 88.0% | 6.5% | 2.5% (25) | met |
| Davis | **4.5% (18)** | 6.7% (34) | 77.4% | 12.8% | 3.4% (35) | missed |
| Five new voices | 3.2% (63 of 2,000) | 3.6% (91 of 2,540) | 72.4% | 10.0% | 12.3% (624) | |

False flag counts correct cases, so a recording in several contrasts counts once per contrast.
Stopped by the gate counts correct and swap cases the word gate rejected before judging. On the
contrast sound alone (`--judged=contrast`) the three still miss: Andrew 2.8%, Emma 3.3%, Davis
3.5% recordings flagged, against Brian 1.3% and Ava 1.0%.

### An empty transcript stops short clips

The gate stopped 15–22% of Andrew's, Brian's and Emma's cases, almost all as `not-heard`.
Azure's plain recognition returned `Success` with an empty `Lexical` for 205 of the 2,000 new
clips, while the assessment of the same audio heard the word (*gas*, *peak*, *bin*). The gate reads
an empty transcript as no speech. Each clip gave the same answer every time it was sent, and the
empty answers cluster by length: of the clips converted to 16 kHz WAV at exactly 650, 662.5 and
675 ms, 193 of 207 came back empty, and none of the clips from 687.5 to 750 ms or from 600 to
637.5 ms did. A few more fall near 1.0 s and 1.3 s. Jenny's, Guy's and Aria's clips are almost
all padded to 1.82 s (below), and only one of them came back empty: Jenny's *see*, the two Jenny
cases the gate already stopped as not heard.

So these cases were never judged, which lowers the flag rates of the three voices it hits. Judged
again from the cache, with an empty transcript read as no transcript (the gate then checks word
accuracy alone):

| Voice | Recordings flagged | Swap named | Unclear | Stopped by the gate |
| --- | --- | --- | --- | --- |
| Andrew | **5.3% (21)** | 81.3% | 9.7% | 1.4% (14) |
| Brian | 1.3% (5) | 79.5% | 14.0% | 0.8% (8) |
| Emma | **5.3% (21)** | 76.4% | 15.1% | 1.2% (12) |
| Ava | 1.3% (5) | 89.2% | 6.8% | 0.9% (9) |
| Davis | **4.5% (18)** | 77.8% | 13.1% | 2.8% (28) |

The same three voices miss the target either way. Whether a learner's short recording can get the
same empty transcript is untested, but if it can, a correct word is turned away as not heard. Filed
as #384 and fixed there: the gate now reads a transcript that heard no speech as no transcript
whenever the assessment scored the target, and keeps `not-heard` for digital silence, where the assessment
marks the target omitted. Rerun from the cache, the fixed gate gives the table above exactly.

### What was flagged

The flagged sounds on the five new voices, as target and heard, over correct and pair recordings:

| Voice | Flagged sounds | Most often |
| --- | --- | --- |
| Andrew | 24 | /d/ as /t/ 17, /z/ as /s/ 4, /dʒ/ as /tʃ/ 2, /v/ as /f/ 1 |
| Brian | 9 | /ʌ/ as /ɑ/ 3, /t/ as /d/ 3, /ɑ/ as /ʌ/ 1, /dʒ/ as /tʃ/ 1, /v/ as /b/ 1 |
| Emma | 31 | /d/ as /t/ 15, /v/ as /f/ 4, /z/ as /s/ 3, /s/ as /θ/ 2, five others once |
| Ava | 12 | /ɑ/ as /ʌ/ 6, /ʊ/ as /u/ 4, /ɑ/ as /æ/ 2 |
| Davis | 51 | /æ/ as /ɛ/ 24, /ɑ/ as /ʌ/ 11, /ʊ/ as /u/ 4, /ɑ/ as /æ/ 3, /ʌ/ as /ʊ/ 3, /t/ as /d/ 3, /n/ as /m/ 3 |

Two kinds of error, neither of them what the margins were tuned on:

- **Final voiced consonants heard as voiceless, on Andrew and Emma.** Every one of Andrew's
  flagged sounds is a word-final /d z dʒ v/ heard as /t s tʃ f/ (*bad*, *feed*, *ones*, *ridge*,
  *prove*), and so are most of Emma's, besides /v/ as /f/ at the start of *view*, *vault* and
  *verse*. The three tuned voices had a few consonant flags (Guy's /n/ as /ŋ/ and /s/ as /z/),
  never this many. The tuned margins only raise /æ/, /aɪ/, /ɛ/ and /i/, so these sounds are judged at
  the default swap margin of 0.2. Azure's own transcript names the voiceless word for 15 of Andrew's
  17 flagged recordings ("bat", "feet", "once"), which hints that the voice said it. The sort
  below confirms it for most of them.
- **Low and front vowels blurring, on Davis and Ava.** Davis has Guy's blur, more of it: /æ/ as
  /ɛ/ (*bat*, *bath*, *flash*, *sat*) and /ɑ/ as /ʌ/ (*lock*, *stock*, *rob*). The tuned /æ/ margin
  of 0.45 isn't enough: five of its seven /æ/ flags win by more than 0.5. Ava and Davis also flag /ʊ/ as /u/ on
  *full* and *pull*, a sound kept at the default for having too few cases.

Brian and Ava flag little. The judge's misses there are mostly swaps left unclear, not flags.

### Worst contrasts

On the five new voices, by false-flag rate, every sound judged. A correct recording flagged on any
of its sounds counts in every contrast it belongs to:

| Contrast | False flag | Swap named | What was flagged |
| --- | --- | --- | --- |
| u-ux (/u/–/ʊ/) | 20.0% (4 of 20) | 25.0% | /ʊ/ as /u/ (*full*, *pull*) |
| ch-j (/tʃ/–/dʒ/) | 13.3% (4 of 30) | 56.7% | final /dʒ/ as /tʃ/ (*ridge*, *surge*) |
| ae-a (/æ/–/ɑ/) | 10.0% (9 of 90) | 58.9% | /ɑ/ as /ʌ/, /æ/ as /ɛ/ |
| ah-a (/ʌ/–/ɑ/) | 10.0% (10 of 100) | 53.0% | /ɑ/ as /ʌ/, /ʌ/ as /ɑ/ |
| e-ae (/ɛ/–/æ/) | 9.1% (10 of 110) | 37.3% | /æ/ as /ɛ/, final /d/ as /t/ |
| s-z | 7.3% (8 of 110) | 56.4% | final /z/ as /s/ |
| ae-ah (/æ/–/ʌ/) | 5.7% (8 of 140) | 68.6% | final /d/ as /t/, /æ/ as /ɛ/ |
| t-d | 5.3% (8 of 150) | 64.7% | final /d/ as /t/, /æ/ as /ɛ/ |

Swap named is low partly because the gate stopped the cases (above). With the empty transcript
read as no transcript, e-ae still names only 42.7% of swaps on the new voices.

### Clip durations

Azure pads a short clip to at least 1.8265 s, but not always. Guy, Aria and Davis are padded on
90–100% of clips and Ava on 86%. Andrew, Brian and Emma are padded on only 6–12%, and their other
clips run 0.51–0.93 s. The newer voices also speak faster: from the first to the last loud frame,
the median word lasts 280–320 ms on Andrew, Brian and Emma, 420–490 ms on Davis, Ava and Guy, and
550 ms on Aria. Nothing is cut off: every unpadded clip of Andrew, Brian and Emma keeps at least 50 ms
of silence before the word and 290 ms after it, and Ava's at least 120 ms and 200 ms. Within each voice, padded and unpadded clips are flagged at about
the same rate. The length matters only through the empty transcripts above. One clip is broken:
Brian's *add* is near silent (peak −36 dBFS), and the gate stopped it as not heard.

No voice looks like it ignored the IPA tags. Each voice's transcript differed from the word as often
as Guy's did, mostly homophones (*buy* as "bye", *son* as "sun").

### The false flags, sorted

Each flagged sound was sorted as a voice error (the voice said the heard sound) or a judge error (it
said the target). Listening didn't settle it: to a non-native ear the flagged clip and the partner
word in the same voice sounded the same on nearly every row. So the sort uses three checks, none of
them Azure:

- **Acoustics** (Praat, through `praat-parselmouth`): for final voicing, the length of the vowel
  before the consonant and voicing in the closure; for vowels, F1 and F2 at the midpoint. Each is
  compared with the same voice's unflagged catalog words, never absolute norms, and with the partner
  word in that voice when the catalog has it.
- **A second recognizer:** Whisper `large-v3`, run locally on each flagged clip, giving its plain
  transcript and a forced-decoding score for the target against the partner word. Prompting it
  with the two candidates was dropped, because the order of the prompt decided the answer.
- **A control:** the same words from Jenny and Aria, who were not flagged on them, through
  Whisper. They come out as the target on 67 of 73 and 73 of 75 clips. So when a flagged voice comes
  out as the partner, that is the voice and not Whisper preferring the commoner word (*once* over
  *ones*). The exceptions are *cop* (Whisper hears "cup" in all three voices), *prove*, *lose*,
  *grows* and *sat*.

A row is a voice error when the acoustics say so and Whisper doesn't hear the target, or when
Whisper hears the partner, the controls hear the target and the acoustics don't strongly say
otherwise. It is a judge error when the acoustics place the sound with the target and Whisper hears
the target. Anything else stays unclear. The 75 rows (73 clips; two are flagged on two sounds, and pair
recordings judged against several words are merged) come out as 33 voice errors, 18 judge errors and 24 unclear:

| Voice | Voice error | Judge error | Unclear | Counted recordings left as judge errors | Real false-flag rate |
| --- | --- | --- | --- | --- | --- |
| Andrew | 10 | 6 | 5 | 5 of 17 (4 more unclear) | 1.3–2.3% |
| Brian | 2 | 1 | 2 | 1 of 5 (2 unclear) | 0.3–0.8% |
| Emma | 13 | 2 | 9 | 1 of 18 (5 unclear) | 0.3–1.5% |
| Ava | 2 | 1 | 2 | 1 of 5 (2 unclear) | 0.3–0.8% |
| Davis | 6 | 8 | 6 | 6 of 18 (6 unclear) | 1.5–3.0% |

The rate is the share of the voice's 400 correct recordings that the harness counted as flagged and
the sort left as judge errors, without and with the unclear ones.

- **Andrew and Emma say many final voiced consonants voiceless.** Whisper hears *ones* as "once",
  *phase* as "face", *ride* as "right" and *vault* as "fold", while Jenny and Aria come out as the
  target. These voices barely lengthen a vowel before a voiced consonant: Andrew's /æ/ lasts 189 ms
  before /d/ against 181 ms before /t/, and the median ratio across his pairs is 1.17, against 1.41
  for Ava and 1.47 for Davis. That is the main cue in English, so the flags there are mostly fair.
  Andrew's *ridge* and *surge* stay unclear: the acoustics put them with /dʒ/, Whisper hears "rich"
  and "search".
- **Ava's and Davis's *full* and *pull*** measure the same as *fool* and *pool*: voice errors.
- **Davis's /æ/ is the judge's problem.** His flagged /æ/ sits on his own /æ/ (his unflagged *pat*
  and flagged *bat* have the same vowel, 604/1731 and 599/1742 Hz), but his front vowels sit a step
  higher than the other male voices': his /æ/ has a lower F1 than Andrew's and Brian's /ɛ/. The
  contrast holds within his speech, and Azure, which doesn't adjust for the speaker, hears /ɛ/.
  Whisper agrees with Azure on *sat* and *bath*, so those stay unclear, while *back* and *flash*
  are judge errors. His /ɑ/ flags split.

Per-row verdicts and evidence are in `packages/pronunciation/output/issue-354/combined.json`,
built by `combine.ts` from `acoustic.json`, `whisper.json` and `whisper-control.json` in the same
folder.

### Retuning

Once the voice errors are set aside, Brian, Emma and Ava are well under the 2% target, and Andrew
is at or just over it. The voiced endings mostly say the voice and not the judge. Davis is the one
real miss, at 1.5–3.0%, and margins won't fix it: a single swap margin of 0.5 for every sound still
leaves him at 4.9% of cases flagged, while swap named falls to 69.9%. His vowels need judging
relative to the speaker's own vowel space, which a fixed margin per sound can't do. Retuning, or
normalizing for the speaker, is out of scope here and is for a follow-up issue with these numbers.
Real voices (#327) remain the check that decides production.

### Cost and reproducing

The run sent 4,540 new requests (89 minutes of audio, each sent twice, for assessment and plain
recognition), four at a time, with no throttling. 75 timed out during a slow stretch and were
re-sent by running the same command again. Generating the five voices took 2,000 synthesis
requests. Reports and the response cache are in the ignored `packages/pronunciation/output/`, so a
rerun costs no calls:

```bash
bun run --cwd packages/pronunciation harness run --catalog \
  --tts-dir=output/tts/guy --tts-dir=output/tts/aria --tts-dir=output/tts/andrew \
  --tts-dir=output/tts/brian --tts-dir=output/tts/emma --tts-dir=output/tts/ava \
  --tts-dir=output/tts/davis --report=issue-354-eight-voices
```

Add `--judged=contrast` for the contrast-sound figures.
