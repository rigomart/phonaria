# Shared Data

This package defines the canonical phoneme catalog, articulation metadata, and helper utilities consumed by both the web application and helper scripts.

## Exports at a glance

```ts
import {
  consonants,
  vowels,
  articulationRegistry,
  consonantArticulationRegistry,
  vowelArticulationRegistry,
  PHONEME_CATEGORIES,
  getCategoryInfo,
  phonariaUtils,
  type ConsonantPhoneme,
  type VowelPhoneme,
} from "shared-data";
```

### Core modules

| Module | Purpose |
| --- | --- |
| `src/consonants.ts` | 24 consonant phonemes (with pedagogical allophones where useful). |
| `src/vowels.ts` | 16 vowel phonemes (10 monophthongs, 5 diphthongs, 1 rhotic vowel). |
| `src/articulation.ts` | Registries describing articulation places, manners, and vowel dimensions. |
| `src/category-config.ts` | Category groupings and helpers for chart organization. |
| `src/utils/` | Utility helpers: audio path builders, IPA formatting, slug helpers, etc. |
| `src/types.ts` | Strongly-typed interfaces for phonemes, articulation metadata, and example words. |
| `src/index.ts` | Barrel that exposes the modules above to consumers. |

## Phoneme structure

Every phoneme entry shares a common schema:

```ts
interface BasePhoneme {
  symbol: string;              // IPA symbol, no slashes
  category: "consonant" | "vowel";
  type: string;                // e.g. "stop", "monophthong"
  description: string;         // pedagogical summary
  guide: string;               // learner-facing production tips
  examples: ExampleWord[];     // see below
  allophones?: Allophone[];    // optional contextual variants
}

interface ExampleWord {
  word: string;                // orthographic form (lowercase)
  ipa: string;                 // transcription without surrounding slashes
}
```

Utilities such as `phonariaUtils.getExampleAudioUrl(word)` and `phonariaUtils.toPhonemic(ipa)` keep formatting consistent between packages.

## Adding or updating phonemes

1. Update the relevant source file (`consonants.ts`, `vowels.ts`, or articulation registries).
2. Ensure examples are high-frequency, learner-friendly words and store IPA transcriptions without surrounding slashes.
3. When introducing new metadata fields, extend the interfaces in `types.ts` and re-export them via `src/index.ts`.
4. Run package checks:
   ```bash
   pnpm -C packages/shared-data lint
   pnpm -C packages/shared-data check-types
   ```
5. If example words change, regenerate ElevenLabs audio so the frontend stays in sync.

## Design principles

- **Pedagogical focus** – Content targets intermediate-to-advanced ESL learners aiming for General American intelligibility.
- **Consistent IPA** – `/ɹ/` and `/ɡ/` are used for accuracy; slashes are added at render time, not stored in data.
- **Meaningful allophones** – Only contextually important variants are included (e.g., flap /ɾ/, glottal stop /ʔ/, dark /ɫ/).
- **Reusability** – Utilities and registries are structured for cross-package consumption (web UI, helper scripts, future tooling).
