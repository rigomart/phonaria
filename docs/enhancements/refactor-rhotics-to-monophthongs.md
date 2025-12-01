# Refactor Rhotics into Monophthongs

## Overview

Merge the single rhotic vowel (`"open-mid-central-rhotic": "ɝ"`) into the monophthong category by adding an optional `rhoticity` field to `VowelArticulatoryFeatures`. This simplifies the type system from 4 vowel categories (consonant, monophthong, diphthong, rhotic) to 3 while preserving all UI distinctions and educational value.

## User Preferences

- **Clean removal**: Remove all rhotic-specific exports without deprecation
- **Terminology**: Update "rhotic" → "r-colored" in all user-facing text
- **Legend**: Rename legend entry from "Rhotic" to "R-colored"

## Rationale

**Why merge?**
- Only 1 phoneme out of ~40 gets special category treatment
- Rhotics use identical articulatory features as monophthongs (height, backness, roundness, tenseness)
- Code has repetitive `|| phonemeType === "rhotic"` checks throughout
- Linguistically defensible: r-colored vowels are monophthongs with additional coloring

**Why preserve distinction?**
- R-colored vowels are difficult for ESL learners and deserve visual callout
- Dashed border styling provides useful educational signal
- May add more r-colored vowels in future (stressed vs unstressed variants)

## Implementation Strategy

### Core Type Changes

**Add `rhoticity` field to `VowelArticulatoryFeatures`:**

```typescript
// Before
export type VowelArticulatoryFeatures = {
  height: "close" | "near-close" | "close-mid" | "mid" | "open-mid" | "near-open" | "open";
  backness: "front" | "near-front" | "central" | "near-back" | "back";
  roundness: "rounded" | "unrounded";
  tenseness: "tense" | "lax";
};

// After
export type VowelArticulatoryFeatures = {
  height: "close" | "near-close" | "close-mid" | "mid" | "open-mid" | "near-open" | "open";
  backness: "front" | "near-front" | "central" | "near-back" | "back";
  roundness: "rounded" | "unrounded";
  tenseness: "tense" | "lax";
  rhoticity?: "r-colored";
};
```

**Merge registries:**

```typescript
// Before: Separate RhoticIpaRegistry
export const RhoticIpaRegistry = {
  "open-mid-central-rhotic": "ɝ",
} as const;

// After: Merged into MonophthongIpaRegistry
export const MonophthongIpaRegistry = {
  // ... existing monophthongs ...
  "open-mid-central-r-colored": "ɝ",
} as const;
```

**Update VowelType:**

```typescript
// Before
export type VowelType = "monophthong" | "diphthong" | "rhotic";

// After
export type VowelType = "monophthong" | "diphthong";
```

**Update getPhonemeType():**

```typescript
// Before
export function getPhonemeType(phonemeId: PhonemeSymbolId) {
  if (phonemeId in MonophthongIpaRegistry) return "monophthong";
  if (phonemeId in DiphthongIpaRegistry) return "diphthong";
  if (phonemeId in RhoticIpaRegistry) return "rhotic";
  return "consonant";
}

// After
export function getPhonemeType(phonemeId: PhonemeSymbolId) {
  if (phonemeId in MonophthongIpaRegistry) return "monophthong";
  if (phonemeId in DiphthongIpaRegistry) return "diphthong";
  return "consonant";
}
```

## Implementation Order

### Phase 1: Core Data Package (`packages/shared-data`)

**1. Update `ipa-registry.ts`:**
- Remove `RhoticPhonemeIdPattern` type
- Remove `RhoticIpaRegistry` object
- Remove `RhoticSymbolId` and `RhoticSymbolIpa` type exports
- Rename phoneme ID: `"open-mid-central-rhotic"` → `"open-mid-central-r-colored"`
- Move entry from `RhoticIpaRegistry` into `MonophthongIpaRegistry`
- Add `rhoticity?: "r-colored"` field to `VowelArticulatoryFeatures`
- Update `VowelPhonemeIdPattern` union (remove `RhoticPhonemeIdPattern`)
- Update `VowelIpaRegistry` (remove spread of `RhoticIpaRegistry`)
- Update `getPhonemeType()` function (remove rhotic check)
- Update `PhonemeCount` object:
  - Remove `rhotics` property
  - Update `vowels` getter (remove `this.rhotics`)

**2. Update `phoneme-articulations.ts`:**
- Update `VowelType` union: remove `"rhotic"`
- Remove `RhoticVowelArticulation` type
- Remove `RhoticVowelArticulationRegistry` object
- Move r-colored entry into `MonophthongVowelArticulationRegistry`:
  ```typescript
  "open-mid-central-r-colored": {
    category: "vowel",
    vowelType: "monophthong",
    features: {
      height: "open-mid",
      backness: "central",
      roundness: "unrounded",
      tenseness: "tense",
      rhoticity: "r-colored",
    },
  },
  ```
- Update `PhonemeArticulation` union (remove `RhoticVowelArticulation`)
- Update `PhonemeArticulationRegistry` spread (remove `RhoticVowelArticulationRegistry`)

**3. Update `cmu-arpa-registry.ts`:**
- Update CMU ARPA mappings:
  ```typescript
  // Before
  ER0: "open-mid-central-rhotic",
  ER1: "open-mid-central-rhotic",
  ER2: "open-mid-central-rhotic",

  // After
  ER0: "open-mid-central-r-colored",
  ER1: "open-mid-central-r-colored",
  ER2: "open-mid-central-r-colored",
  ```

**4. Update `phoneme-allophones.ts`:**
- Update phoneme ID key:
  ```typescript
  // Before
  "open-mid-central-rhotic": [...]

  // After
  "open-mid-central-r-colored": [...]
  ```
- Update context definitions for "r-colored" terminology

**5. Update `phoneme-patterns.ts`:**
- Update phoneme ID key:
  ```typescript
  // Before
  "open-mid-central-rhotic": {...}

  // After
  "open-mid-central-r-colored": {...}
  ```

**6. Update `index.ts`:**
- Remove exports:
  - `RhoticSymbolIpa`
  - `RhoticIpaRegistry`
  - `RhoticVowelArticulationRegistry`
- Keep exports:
  - `VowelType` (now has only 2 variants)
  - All other exports remain unchanged

**7. Update `README.md`:**
- Remove documentation for `RhoticIpaRegistry` and `RhoticVowelArticulationRegistry`
- Update examples to reference the new phoneme ID
- Update vowel type documentation

### Phase 2: Build Verification

**8. Run type checking:**
```bash
bun check-types
```
This will reveal all locations in the web app that need updates due to type changes.

### Phase 3: Web App Components (`apps/web`)

**9. Update `phoneme-header.tsx`:**
```typescript
// Before
const phonemeType = getPhonemeType(phonemeId);
const showAudioControls =
  phonemeType === "consonant" || phonemeType === "monophthong" || phonemeType === "rhotic";

// After
const phonemeType = getPhonemeType(phonemeId);
const showAudioControls = phonemeType === "consonant" || phonemeType === "monophthong";
```

**10. Update `phoneme-articulation.tsx`:**
```typescript
// Before (line 94 and 136)
if (articulation.vowelType === "monophthong" || articulation.vowelType === "rhotic")

// After
if (articulation.vowelType === "monophthong")
```

**11. Update `phoneme-vowel-chart.tsx`:**
```typescript
// Before (line 16, 23)
{ vowelType: "monophthong" | "rhotic" }

// After
{ vowelType: "monophthong" }

// Before (line 48)
const isRhotic = props.vowelType === "rhotic";

// After
const isRhotic = props.features.rhoticity === "r-colored";
```

**12. Update `vowel-chart-data.ts`:**
```typescript
// Before (line 13, 22)
{ vowelType: "monophthong" | "rhotic" }

// After
{ vowelType: "monophthong" }

// Before: Separate mapRhotics() function
function mapRhotics() {
  return Object.entries(RhoticVowelArticulationRegistry).map(...)
}
export const staticVowelEntries = [...mapMonophthongs(), ...mapRhotics()];

// After: Merged into mapMonophthongs()
function mapMonophthongs() {
  return Object.entries(MonophthongVowelArticulationRegistry).map(...)
}
export const staticVowelEntries = mapMonophthongs();
```

**13. Update `vowel-chart.tsx`:**
```typescript
// Before (line 82)
const isRhotic = marker.entry.vowelType === "rhotic";

// After
const isRhotic = marker.entry.features.rhoticity === "r-colored";
```

**14. Update `phoneme-details.ts`:**
```typescript
// Before
"open-mid-central-rhotic": {
  label: "Open-mid central rhotic tense vowel",
  ...
}

// After
"open-mid-central-r-colored": {
  label: "Open-mid central r-colored vowel",
  ...
}
```
- Update context definitions from "rhotic" → "r-colored"
- Update allophone descriptions to use "r-colored" terminology

**15. Update `locales/en/index.ts`:**
```typescript
// Before
rhotic: "Rhotic"

// After
"r-colored": "R-colored"
```

**16. Update audio file reference:**
- Rename or create symlink: `/public/audio/phonemes/open-mid-central-rhotic.ogg` → `open-mid-central-r-colored.ogg`
- Or update audio path resolution to handle the ID change

### Phase 4: Tests

**17. Update test files:**
- `phoneme-details.test.ts`: Update to use new phoneme ID
- Any g2p tests: Update expectations for r-colored vowel handling
- Verify `PhonemeCount` assertions

**18. Run all tests:**
```bash
bun test
```

### Phase 5: Documentation

**19. Update README files:**
- `packages/shared-data/README.md`: Update phoneme type documentation
- `apps/web/README.md`: Update phoneme count and category descriptions
- `AGENTS.md`: Update references to rhotic category
- Any docs mentioning vowel types or phoneme counts

**20. Update any migration guides or changelog entries**

## Verification Checklist

After implementation, verify:

- [ ] `bun check-types` passes with no errors
- [ ] `bun lint` passes
- [ ] `bun test` passes all tests
- [ ] Vowel chart displays r-colored vowel with dashed border
- [ ] Vowel chart legend shows "R-colored" entry
- [ ] Phoneme detail dialog shows correct label: "Open-mid central r-colored vowel"
- [ ] Audio controls appear for r-colored vowel
- [ ] CMU ARPA mappings (ER0/ER1/ER2) resolve correctly in G2P transcription
- [ ] No build warnings or TypeScript errors
- [ ] All phoneme count calculations are correct

## Rollback Plan

If issues arise:
1. Revert changes to `packages/shared-data/src/phonetics/ipa-registry.ts`
2. Revert changes to `packages/shared-data/src/phonetics/phoneme-articulations.ts`
3. Run `bun install` to restore type integrity
4. The modular changes make partial rollback easy

## Migration Risks

1. **Audio file paths**: Phoneme ID change affects audio file lookup
2. **External consumers**: Any code importing rhotic-specific types will break (clean removal strategy)
3. **CMU ARPA mappings**: Must be updated atomically with registry changes
4. **Test data**: Any hardcoded phoneme IDs in tests must be updated

## Future Enhancements

After this refactoring, consider:
- Adding unstressed r-colored vowel as separate phoneme with `rhoticity: "r-colored"`
- Extending `rhoticity` field to support degrees: `"fully-rhotic" | "lightly-rhotic"`
- Using the pattern for other vowel features (nasalization, length, etc.)
