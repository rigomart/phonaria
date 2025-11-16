# shared-data

Canonical phoneme metadata for the Phonaria workspace. Everything in this package is structured data: IPA symbols, articulatory feature maps, contrast sets, and spelling patterns that other packages render into UI copy on their own. Do **not** store prose, learner-facing descriptions, or localized strings here—apps import the metadata and generate copy in their respective locales.

## Purpose

- Single source of truth for phoneme symbols and their relationships.
- Typed datasets that can be consumed by `apps/web`, helper scripts, or future tooling without duplication.
- Metadata only. Consumers are responsible for presenting text, translations, or UX copy.

## Exports at a glance

All canonical phonetics datasets use PascalCase `*Registry` names (or `*Catalog` for arrays) to signal their role as source-of-truth data exports from `shared-data`. This naming convention makes it visually obvious that these are global data registries, not local constants.

```ts
import {
  PhonemeSymbolRegistry,
  ConsonantSymbolRegistry,
  VowelSymbolRegistry,
  PhonemeArticulationRegistry,
  ConsonantArticulationRegistry,
  MonophthongVowelArticulationRegistry,
  DiphthongVowelArticulationRegistry,
  RhoticVowelArticulationRegistry,
  ContrastsByPhonemeIdRegistry,
  PhonemeSpellingPatternRegistry,
  type ConsonantArticulatoryFeatures,
  type VowelArticulatoryFeatures,
  type PhonemeArticulatoryFeatures,
  type PhonemeSymbolId,
} from "shared-data";
```

## Module map (`src/phonetics`)

| File | Purpose |
| --- | --- |
| `symbols-registry.ts` | Typed registries of every consonant, vowel, diphthong, and rhotic symbol plus helper type exports. |
| `phoneme-articulations.ts` | Maps each `PhonemeSymbolId` to its articulatory feature set (manner/place/voicing or height/backness/etc.). |
| `phoneme-contrasts.ts` | Minimal-pair style relationships (`ContrastsByPhonemeIdRegistry`) that highlight challenging sound pairs. |
| `phoneme-patterns.ts` | Common spelling patterns per phoneme for downstream pattern explorers. |
| `index.ts` | Barrel re-export for all of the above so consumers import from `shared-data`. |

## Usage examples

Render IPA info in the web app:

```ts
import { PhonemeSymbolRegistry, PhonemeArticulationRegistry } from "shared-data";

const ipa = PhonemeSymbolRegistry[phonemeId].ipa;
const articulation = PhonemeArticulationRegistry[phonemeId];
```

Build spelling-pattern cards:

```ts
import { PhonemeSpellingPatternRegistry } from "shared-data";

const patterns = PhonemeSpellingPatternRegistry[phonemeId]?.patterns ?? [];
```

## Contribution guide

1. **Edit the right module**:  
   - New phoneme symbol → `symbols-registry.ts`  
   - Articulation metadata → `phoneme-articulations.ts`  
   - Contrast pairs → `phoneme-contrasts.ts`  
   - Spelling patterns → `phoneme-patterns.ts`
2. **Stay data-only**: no prose strings, learner copy, or localization text. Keep values constrained to typed enums/objects so consuming apps can translate separately.
3. **Update types when needed**: extend the relevant type definitions and re-export through `src/index.ts`.
4. **Validate**:
   ```bash
   pnpm -C packages/shared-data lint
   pnpm -C packages/shared-data check-types
   ```
5. **Coordinate downstream assets**: if a change affects audio generation or web UI expectations, follow the workflows in `packages/helper-scripts` or `apps/web` to regenerate assets.

## Design principles

- **Canonical + immutable**: treat this package as a data store, not a rendering layer.
- **Typed metadata**: every field is described via TypeScript so consumers get compile-time guarantees.
- **No prose**: apps derive copy from their own locale dictionaries to keep translation workflows isolated.
- **Reusability**: datasets must be neutral and flexible enough for multiple surfaces (IPA chart, G2P studio, contrast explorer). 
