# `@phonaria/phonetics-data`

Canonical phoneme metadata for the Phonaria workspace. Everything in this package is structured data: IPA symbols, articulatory feature maps, contrast sets, and spelling patterns that other packages render into UI copy on their own. Do **not** store prose, learner-facing descriptions, or localized strings here—apps import the metadata and generate copy in their respective locales.

## Purpose

- Single source of truth for phoneme symbols and their relationships.
- Typed datasets that can be consumed by `apps/web`, helper scripts, or future tooling without duplication.
- Metadata only. Consumers are responsible for presenting text, translations, or UX copy.

## Exports at a glance

All canonical phonetics datasets use PascalCase `*Registry` names (or `*Catalog` for arrays) to signal their role as source-of-truth data exports from `@phonaria/phonetics-data`. This naming convention makes it visually obvious that these are global data registries, not local constants.

```ts
import {
  // IPA registries (PhonemeId → IPA symbol)
  PhonemeIpaRegistry,
  ConsonantIpaRegistry,
  VowelIpaRegistry,
  MonophthongIpaRegistry,
  DiphthongIpaRegistry,

  // CMU ARPA registries (CMU token → PhonemeId)
  CmuArpaRegistry,

  // Helper functions
  getIpaForPhonemeId,
  getPhonemeIdForCmuArpa,
  getCmuArpaForPhonemeId,
  isVowelPhoneme,
  isConsonantPhoneme,
  getPhonemeCategory,

  // Articulation registries (PhonemeId → articulatory features)
  PhonemeArticulationRegistry,
  ConsonantArticulationRegistry,
  MonophthongVowelArticulationRegistry,
  DiphthongVowelArticulationRegistry,

  // Other registries
  ContrastsByPhonemeIdRegistry,
  PhonemeSpellingPatternRegistry,
  PhonemeAllophoneRegistry,

  // Types
  type ConsonantArticulatoryFeatures,
  type VowelArticulatoryFeatures,
  type PhonemeArticulatoryFeatures,
  type PhonemeSymbolId,
  type PhonemeCategory,
  type VowelType,
  type CmuArpaToken,
  type SpellingPattern,
  type AllophoneExample,
  type PhonemeContrastPair,
} from "@phonaria/phonetics-data";
```

## Module map (`src/phonetics`)

| File | Purpose |
| --- | --- |
| `ipa-registry.ts` | IPA registries mapping `PhonemeSymbolId` → IPA symbol. Includes consonants, monophthongs (with optional `rhoticity`), and diphthongs. Also provides helper functions for category detection and IPA lookup. |
| `cmu-arpa-registry.ts` | CMU ARPA registry mapping CMU ARPABET tokens (with stress digits) → `PhonemeSymbolId`. Includes bidirectional lookup helpers. |
| `phoneme-articulations.ts` | Maps each `PhonemeSymbolId` to its articulatory feature set (manner/place/voicing for consonants; height/backness/roundness for vowels). Also defines `VowelType` (monophthong/diphthong) and supports `rhoticity` on vowels. |
| `phoneme-contrasts.ts` | Minimal-pair style relationships (`ContrastsByPhonemeIdRegistry`) that highlight challenging sound pairs. Each example includes `word` and `phonemic` (IPA). |
| `phoneme-patterns.ts` | Common spelling patterns per phoneme for downstream pattern explorers. Each example includes `word` and `phonemic` (IPA). |
| `phoneme-allophones.ts` | Allophonic variations with context keys for each phoneme. Each example includes `word` and `phonemic` (IPA). |
| `index.ts` | Barrel re-export for all of the above so consumers import from `@phonaria/phonetics-data`. |

## Usage examples

### Get IPA symbol for a phoneme

```ts
import { getIpaForPhonemeId } from "@phonaria/phonetics-data";

const ipa = getIpaForPhonemeId("voiceless-bilabial-plosive"); // "p"
const vowelIpa = getIpaForPhonemeId("close-front-unrounded"); // "i"
```

### Convert CMU ARPA to phoneme ID and IPA

```ts
import { getPhonemeIdForCmuArpa, getIpaForPhonemeId } from "@phonaria/phonetics-data";

const phonemeId = getPhonemeIdForCmuArpa("AH0"); // "mid-central-unrounded" (schwa)
const ipa = getIpaForPhonemeId(phonemeId); // "ə"
```

### Reverse lookup: phoneme ID to CMU ARPA tokens

```ts
import { getCmuArpaForPhonemeId } from "@phonaria/phonetics-data";

const tokens = getCmuArpaForPhonemeId("close-front-unrounded");
// ["IY0", "IY1", "IY2"] - all stress variants
```

### Check phoneme category

```ts
import { isVowelPhoneme, isConsonantPhoneme, getPhonemeCategory } from "@phonaria/phonetics-data";

isVowelPhoneme("close-front-unrounded"); // true
isConsonantPhoneme("voiceless-bilabial-plosive"); // true
getPhonemeCategory("close-front-unrounded"); // "vowel"
```

### Access articulation features

```ts
import { PhonemeArticulationRegistry } from "@phonaria/phonetics-data";

const articulation = PhonemeArticulationRegistry["close-front-unrounded"];
// { category: "vowel", vowelType: "monophthong", features: { ... } }

if (articulation.vowelType === "diphthong") {
  // Handle diphthong-specific rendering
}
```

### Build spelling-pattern cards

```ts
import { PhonemeSpellingPatternRegistry } from "@phonaria/phonetics-data";

const patterns = PhonemeSpellingPatternRegistry[phonemeId]?.patterns ?? [];
const examples = PhonemeSpellingPatternRegistry[phonemeId]?.examples ?? [];
// Each example: { word: "pen", phonemic: "pɛn" }
```

### Access example words

```ts
import {
  PhonemeSpellingPatternRegistry,
  PhonemeAllophoneRegistry,
  ContrastsByPhonemeIdRegistry
} from "@phonaria/phonetics-data";

// Spelling pattern examples
const pattern = PhonemeSpellingPatternRegistry["voiceless-bilabial-plosive"];
pattern?.examples.forEach(ex => {
  console.log(`${ex.word}: ${ex.phonemic}`);
  // "pen: pɛn"
});

// Allophone examples
const allophones = PhonemeAllophoneRegistry["voiceless-alveolar-plosive"];
allophones?.forEach(variant => {
  variant.examples.forEach(ex => {
    console.log(`${ex.word}: ${ex.phonemic}`);
  });
});

// Minimal pair examples
const contrasts = ContrastsByPhonemeIdRegistry["voiceless-bilabial-plosive"];
contrasts?.forEach(contrast => {
  contrast.minimalPairs.forEach(([pair1, pair2]) => {
    console.log(`${pair1.word} vs ${pair2.word}`);
    console.log(`  ${pair1.phonemic} vs ${pair2.phonemic}`);
  });
});
```

> **Note**: CMU ARPA transcriptions are generated dynamically by `helper-scripts` from CMUDict. The default CMUDict JSON lives at `packages/phonetics-data/data/dict/cmudict.json` (generated via `bun --cwd packages/helper-scripts cmudict-to-json`). See the `generate-word-mappings` script for word → CMU ARPA lookups.

## Curated word chunks (`data/curated/`)

Pre-generated word lists for client-side tiered lookup, enabling instant pronunciation lookups without server round-trips.

| File | Words | Description |
| --- | --- | --- |
| `top-1k.json` | 1,000 | Most frequent words, bundled inline (~22 KB) |
| `top-10k.json` | 10,000 | Extended vocabulary, lazy-loaded (~273 KB) |

### Data format

Each file contains metadata and a simple word → CMU ARPABET mapping:

```json
{
  "meta": {
    "version": "1.0.0",
    "tier": "1k",
    "wordCount": 1000,
    "license": "CC-BY-SA-4.0",
    "attribution": "Derived from wordfreq (Robyn Speer, CC-BY-SA 4.0)...",
    "sources": {
      "wordfreq": "https://github.com/rspeer/wordfreq",
      "cmudict": "https://github.com/cmusphinx/cmudict"
    }
  },
  "words": {
    "hello": "HH AH0 L OW1",
    "world": "W ER1 L D"
  }
}
```

IPA conversion, syllabification, and phoneme key generation are handled at runtime using existing TypeScript utilities (`cmuVariantToIpa`, etc.).

### Regenerating curated chunks

```bash
cd packages/helper-scripts
pip install wordfreq  # Python dependency
python generate-curated-chunks.py
```

### Licensing (CC-BY-SA 4.0)

The curated word chunks are derived from:

- **[wordfreq](https://github.com/rspeer/wordfreq)** by Robyn Speer (Apache 2.0 code, CC-BY-SA 4.0 data)
  - Incorporates data from Google Books Ngrams, OpenSubtitles, SUBTLEX (Brysbaert et al.), and Wikipedia
- **[CMUDict](https://github.com/cmusphinx/cmudict)** (Public Domain)

**The generated files are licensed under CC-BY-SA 4.0.** This means:

1. **Attribution required** - You must credit the sources when using or distributing these files
2. **ShareAlike** - Derivative works must use the same CC-BY-SA 4.0 license
3. **Commercial use allowed** - No restrictions on commercial use

**Required attribution** (include in your credits/acknowledgments):

> Word frequency data derived from [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer (CC-BY-SA 4.0), incorporating data from Google Books Ngrams, OpenSubtitles, SUBTLEX (Brysbaert et al.), and Wikipedia. Pronunciations from [CMUDict](https://github.com/cmusphinx/cmudict) (Public Domain).

## Contribution guide

1. **Edit the right module**:
   - New phoneme IPA symbol → `ipa-registry.ts`
   - CMU ARPA mappings → `cmu-arpa-registry.ts`
   - Articulation metadata → `phoneme-articulations.ts`
   - Contrast pairs → `phoneme-contrasts.ts`
   - Spelling patterns → `phoneme-patterns.ts`
   - Allophonic variations → `phoneme-allophones.ts`
2. **Stay data-only**: no prose strings, learner copy, or localization text. Keep values constrained to typed enums/objects so consuming apps can translate separately.
3. **Update types when needed**: extend the relevant type definitions and re-export through `src/index.ts`.
4. **Validate**:
   ```bash
   bun --cwd packages/phonetics-data lint
   bun --cwd packages/phonetics-data check-types
   ```
5. **Coordinate downstream assets**: if a change affects audio generation or web UI expectations, follow the workflows in `packages/helper-scripts` or `apps/web` to regenerate assets.

## Design principles

- **Canonical + immutable**: treat this package as a data store, not a rendering layer.
- **Typed metadata**: every field is described via TypeScript so consumers get compile-time guarantees.
- **No prose**: apps derive copy from their own locale dictionaries to keep translation workflows isolated.
- **Reusability**: datasets must be neutral and flexible enough for multiple surfaces (IPA chart, G2P studio, contrast explorer). 
