# Phonaria

Phonaria is a pronunciation toolkit for learners who want to understand and practise the
sound structure of a target language.

Terms are added as decisions resolve them. A concept still under discussion is deliberately
absent rather than guessed at.

## Language

### Product surfaces

**Lab**:
The newer Phonaria product surface and the home for new pronunciation-learning activities.
_Avoid_: Legacy web application, experimental side project

**Legacy web application**:
The earlier Phonaria product surface that Lab is intended to supersede. It is not the target for
new practice activities.
_Avoid_: Lab

### Sounds and accents

**Phoneme ID**:
A custom uppercase identifier that maps to exactly one IPA symbol. IDs are language-agnostic and
extensible — two languages needing phonemically distinct sounds get two IDs rather than one
overridden ID.
_Avoid_: Phoneme code, symbol key

**Target accent**:
The accent whose sounds are being taught. Distinct from locale, which is the language the
interface is displayed in.
_Avoid_: Language, dialect

**Locale**:
The language the interface is displayed in. A learner can study one target accent through the
interface of another language entirely.

**Phoneme inventory**:
The set of phoneme IDs a given language uses, bridging language-agnostic IDs to a language scope.

### Practice activities

**Practice**:
The area of Phonaria containing repeatable learning activities. Different activities may share
session and review concepts without sharing the same learner task.
_Avoid_: Course, curriculum

**Sound-sequence construction**:
A practice activity in which a learner recalls and orders the phonemes of a written word for
the target accent, using IPA symbols as the representation.
_Avoid_: IPA transcription exam, spelling quiz

**Minimal-pair practice**:
A practice activity centred on perceiving or producing the contrast between two similar sounds.
It is distinct from constructing the complete sound sequence of a written word.
_Avoid_: Sound-sequence construction mode

### Sessions and rounds

**Practice session**:
A group of rounds that a learner can revisit before submitting them together for a delayed
review.
_Avoid_: Round, lesson

**Round**:
One written-word prompt and the sound sequence assembled for it within a practice session.
_Avoid_: Session, attempt

**Practice topic**:
A pronunciation pattern or challenge used to compose related rounds and their review, while each
round still asks for the complete sound sequence of its word.
_Avoid_: Focus, minimal-pair mode, difficulty layer

**Topic sound**:
A phoneme a practice topic is teaching. Scoring is blind to topic sounds; a topic derives its own
figures by filtering results to them, which is what keeps scoring topic-agnostic.
_Avoid_: Focus sound, target sound (which means a sound in the accepted pronunciation being
compared against)

**Session generator**:
The topic-aware selection process that creates a new practice session from an approved word pool
and composition rules.
_Avoid_: Fixed session, unrestricted random dictionary draw

### Word selection

**Eligible word**:
A word that qualifies for a practice topic — it satisfies both the topic's own rule and the
shared word-suitability filter. Eligibility is derived at runtime from the pronunciation
dictionary, never stored, so it cannot desync from the source.

**Word-suitability filter**:
The rules every practice topic inherits regardless of the sound it teaches, covering what makes a
word usable at all rather than what makes it relevant to a topic.

**Pool**:
The approved set of words a practice topic draws sessions from.

### Scoring

**Accepted pronunciation**:
Any target-accent sound sequence supplied by Phonaria's pronunciation dictionary for a selected
practice word, excluding difficulty layers the session does not assess. A word may have several,
all equally correct — they are never ranked, because the dictionary carries no data to rank them
with.
_Avoid_: Game-owned transcription, manually copied answer key, the answer, the correct
pronunciation

**Word score**:
The primary session result: the number of rounds whose complete sound sequence matches an accepted
pronunciation.
_Avoid_: Sound accuracy, combined score

**Sound accuracy**:
A secondary measurement of phoneme-level agreement used to recognize partial progress and explain
corrections. It is pooled across a whole session rather than averaged per round, so every sound
carries the same weight.
_Avoid_: Word score, final score

### The learner's tools

**Palette**:
The full set of phoneme keys a learner builds sound sequences from, covering every sound that can
appear in an accepted pronunciation for the target accent.

**Assistance**:
Optional information that helps a learner interpret the available IPA symbols without revealing
the target word's pronunciation, such as a sound cue or example word.
_Avoid_: Answer, correction

**Difficulty layer**:
An added demand placed on an established activity, such as assessing lexical stress or removing
assistance from the sound palette.
_Avoid_: Practice topic, level
