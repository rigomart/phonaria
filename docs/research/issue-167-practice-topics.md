# Curated Practice pools for strut and the r-colored vowel (issue #167)

Approved by the owner on 2026-10-28. Two topics join schwa: **Strut** (/ʌ/,
`AH`, slug `strut`) and **R-colored vowel** (/ɝ/ and /ɚ/, `ER`, slug
`r-colored-vowel`). Their lists are `practice-strut.json` and
`practice-r-colored-vowel.json` in `packages/phonetics-data/data/en/`, exported
with the schwa list from `@phonaria/phonetics-data/languages/en/practice`.

## No new recordings

Every word on both lists was recorded with the top-10k batch (#353), so neither
topic needs an audio-gen run. Each word has exactly one pronunciation in both the
curated top-10k and the full CMU dictionary, so its recording was made from the
pronunciation Practice pins. None of them has a hand-reviewed spelling
pronunciation that could differ. `word-audio.test.ts` fails if any Practice word
loses its recording.

## Selection

Both lists start from the same rules as schwa (#166): letters only, at least three
letters, one stored pronunciation, a recording, and the topic sound in that
pronunciation. Unlike schwa, one-syllable words are in, because both sounds are
stressed vowels.

- **R-colored vowel:** top-5k (0-based rank below 5,000). This gives 452 words.
- **Strut:** top-10k. Top-5k alone gave 204 words, and 17.8% of back-to-back
  sessions shared a word, above the 12% bound.

### Held for sound reasons

**R-colored vowel, 117 words held by rule:** words where `ER` follows a vowel
(*power*, *fire*, *player*, *lower*: the syllable count wavers), or where an
`ER0`/`ER2` comes right before a vowel (*operation*, *original*, *liberal*,
*memory*). Learners often hear those as schwa + r. A stressed `ER1` before a vowel
stays: *worry*, *currently* and *referring* are /ɝ/ in American English. A test
pins the rule.

The schwa list keeps such words (*original*, *variety*), since its sound isn't
the uncertain one. For the same reason, strut keeps *summary*.

Held: accuracy, accurate, acquired, anniversary, arena, arranged, arrangement,
arrangements, arrest, arrested, arrival, arrive, arrived, battery, cameron,
career, centuries, century, characteristics, collaboration, considerable,
consideration, considering, contemporary, corporation, correct, correctly,
corruption, cultural, dangerous, delivery, derived, desire, earlier, easier,
edinburgh, emperor, empire, entire, entirely, etc, factory, favourite, featuring,
federation, fewer, fired, flower, flowers, followers, forever, funeral, gallery,
garage, gathering, generate, generation, generations, higher, hillary, hired,
howard, injuries, injury, inspiration, inspired, interior, iron, layer, liberal,
literary, literature, lower, luxury, manufacturers, manufacturing, maria, marine,
mayor, memories, memory, monitoring, mystery, nuclear, numerous, operated,
operation, operations, operator, original, overall, player, players, power,
powered, powerful, powers, preparation, prior, salary, separated, shower, stewart,
summary, superior, surgery, surrounded, surrounding, temporary, terrorism,
terrorist, tired, tower, treasury, variety, viewers, wondering.

**Strut, weak forms:** but, from, must, some, such, thus. In a sentence these
usually reduce to schwa, so a learner who answers with schwa isn't wrong.

**Schwa's holds carried over:** comfortable (both lists), and on strut button,
buttons, uncomfortable, vulnerable, for the same unstable syllables and syllabic
*n*.

### Editorial cuts

Same categories as schwa.

| Reason | R-colored vowel | Strut |
| --- | --- | --- |
| Names, places, brands, nationalities | albert, anderson, arthur, berlin, carter, christopher, cooper, denver, edward, german, germany, harvard, jersey, liverpool, manchester, miller, netherlands, oscar, oxford, parker, peter, rangers, richard, robert, roger, switzerland, taylor, turkey, turkish, twitter, virginia, walker, walter | brussels, chuck, colombia, columbia, columbus, doug, douglas, dublin, duncan, dutch, hudson, hungary, kentucky, london, montgomery, montreal, qatar, russell, russia, russian, russians, samsung, somerset, starbucks, trump, tucker |
| British spellings and words (the target is en-us) | behaviour, centre, colour, favour, honour, labour, theatre | amongst, colour, coloured, colours, judgement, mum, rubbish |
| Profanity, violence, drugs, sensitive contexts | cancer, killer, murder, murdered, terror, virgin | bloody, bust, busted, butt, cult, cum, cunt, drug, drugs, drunk, dumb, fuck, fucked, fuckin, fucking, fucks, gun, guns, reproduction, reproductive, shotgun, suck, sucked, sucking, sucks |
| Interjections, fragments, archaic | — | huh, papa, sub, ugh, ultra, unto, ups, yup |

## Pools and sessions

| Syllables | R-colored vowel | Strut |
| --- | ---: | ---: |
| 1 | 46 | 122 |
| 2 | 272 | 177 |
| 3 | 105 | 93 |
| 4+ | 29 | 24 |
| Total | 452 | 416 |

R-colored vowel slots: 1, 1–2, 2, 2–3 and 3+ syllables (depths 46, 318, 272,
377, 134). Strut slots: 1, 1, 2, 2–3 and 3+ (depths 122, 122, 177, 270, 117).

Strut has two one-syllable slots for a reason. With the r-colored layout,
*someone* (the only two-syllable word with two struts) was in 5.1% of sessions,
above the 5% bound. The variety tie-breaker favors a word whose pattern of topic
sounds nothing else shares. Strut's clearest examples are one-syllable words
anyway (*cup*, *love*, *blood*, *tongue*).

The seeded 100,000-session simulation now runs for every registered topic:

| Topic | Back-to-back overlap | Busiest word |
| --- | ---: | ---: |
| Schwa | 8.7% | 3.9% |
| Strut | 8.8% | 4.1% (*upcoming*) |
| R-colored vowel | 7.4% | 3.4% (*furthermore*) |

## Owner decisions

- Both lists approved as drafted, including the blanket r-colored vowel holds
  (*player*, *lower* and *fewer* stay out with the rest).
- Names "Strut" and "R-colored vowel", the palette's nicknames for these sounds.
- Teaching order: Schwa, Strut, R-colored vowel. Strut comes second as schwa's
  stressed counterpart.
