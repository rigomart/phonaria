# Shared Data Package

This package contains shared TypeScript data structures and phoneme definitions for the Phonix project.

## Structure

The package exports phoneme data through TypeScript modules:

- `consonants.ts` - Contains the 24 consonant phonemes with detailed articulation data
- `vowels.ts` - Contains the 16 vowel phonemes (10 monophthongs, 5 diphthongs, 1 rhotic vowel)
- `types.ts` - TypeScript type definitions for phoneme data structures
- `index.ts` - Main export file that combines all data

### Phoneme List (40 Total)

**Consonants (24)**

- **Stops:** /p/, /b/, /t/, /d/, /k/, /ɡ/
- **Affricates:** /tʃ/, /dʒ/
- **Fricatives:** /f/, /v/, /θ/, /ð/, /s/, /z/, /ʃ/, /ʒ/, /h/
- **Nasals:** /m/, /n/, /ŋ/
- **Liquids:** /l/, /ɹ/
- **Glides:** /j/, /w/

**Vowels (16)**

- **Monophthongs (10):**
  - **High:** /i/, /ɪ/, /u/, /ʊ/
  - **Mid:** /ɛ/, /ə/, /ʌ/, /ɔ/
  - **Low:** /æ/, /ɑ/
  - **Rhotic:** /ɝ/ (with /ɚ/ allophone)

- **Diphthongs (5):** /eɪ/, /aɪ/, /ɔɪ/, /aʊ/, /oʊ/

## Data Structure

Each phoneme object includes:

- **Symbol**: IPA phoneme symbol
- **Category**: `consonant` or `vowel`
- **Type**: Specific categorization (e.g., `stop`, `fricative`, `monophthong`, `diphthong`)
- **Articulation**: Detailed phonetic properties
  - For consonants: `place`, `manner`, `voicing`
  - For vowels: `height`, `frontness`, `roundness`, `tenseness`, `rhoticity` (if applicable)
- **Examples**: Array of example words with phonemic transcriptions (no surrounding slashes). Use `getExampleAudioUrl(word)` to derive audio paths.
- **Description**: Human-readable phonetic description
- **Guide**: Pronunciation guidance for learners
- **Allophones**: Contextual variants (where applicable)

## Usage

```typescript
import { consonants, vowels, phonixUtils } from 'shared-data';
import type { ConsonantPhoneme, VowelPhoneme } from 'shared-data';

// Access all consonants
console.log(consonants); // Array of 24 consonant phonemes

// Access all vowels
console.log(vowels); // Array of 16 vowel phonemes

// Find specific phoneme
const pPhoneme = consonants.find(c => c.symbol === 'p');

// Build audio URL on the fly from the example word
const audioUrl = phonixUtils.getExampleAudioUrl('make'); // /audio/examples/make.mp3

// Display with slashes in the UI
const shown = phonixUtils.toPhonemic('bʌt'); // "/bʌt/"
```

## Pedagogical Design Principles

### Example Word Selection

All example words have been carefully chosen to be **practical and high-frequency** for intermediate-advanced ESL learners:

- **Essential communication**: Function words like "the", "and", "with", "can"
- **Daily vocabulary**: Common words like "time", "get", "want", "need", "work"
- **Practical contexts**: Words useful in everyday conversations and situations
- **Cognitive load reduction**: Familiar vocabulary that doesn't distract from phoneme focus

### Transcription Philosophy

The transcription system balances phonetic accuracy with pedagogical effectiveness:

- **`/ɹ/` vs. `/r/`**: We use `/ɹ/` for phonetic accuracy in representing the American English rhotic consonant
- **`/ɡ/` vs. `/g/`**: We use `/ɡ/` (IPA voiced velar stop) rather than `/g/` to maintain IPA standard compliance
- **No stored slashes**: Example transcriptions are stored without slashes (e.g., `bʌt`). The UI can add slashes when rendering.
- **Allophone inclusion**: Only pedagogically significant allophones are included:
  - **Flap /ɾ/**: For /t/ and /d/ in intervocalic positions (e.g., "better")
  - **Glottal stop /ʔ/**: For /t/ before syllabic nasals (e.g., "button")  
  - **Dark L /ɫ/**: For /l/ in syllable-final position (e.g., "will")
  - **Unstressed /ɚ/**: For /ɝ/ in unstressed syllables (e.g., "after")

### ESL Learning Focus

- **Meaning-distinguishing sounds**: Emphasis on phonemes that affect intelligibility
- **American English (General American)**: Consistent accent model for learners
- **Intermediate-Advanced level**: Assumes basic English vocabulary knowledge
- **Pronunciation improvement**: Systematic approach to accent reduction and clarity