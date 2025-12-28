# Phoneme-to-Word Search Feature

## Overview

Search for words by selecting phoneme combinations. Reverse lookup: "phonemes → words".

### User Flow
1. User opens page (or pastes URL with `?path=`)
2. User types in autocomplete input to find phonemes (e.g., type "K" or "æ")
3. Selecting a phoneme adds it as a tag, URL updates
4. Results show matching words; click a word to see its full IPA transcription
5. Share URL to replicate the search

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trie keys | Standard ARPABET | Compact (1-3 chars), stress-free, schwa=`AX` |
| UI input | Autocomplete + tags | Keyboard-driven, more intuitive than 40-button grid |
| Autocomplete display | `/æ/ AE` | IPA first, ARPABET second |
| IPA transcription | On-click fetch | Click word → G2P API call → show IPA |
| Empty state | Usage guide | Similar to transcription page |
| URL state | `?path=AX,K` | Shareable, bookmarkable |

---

## File Layout

| File | Location |
|------|----------|
| `cmudict-phoneme-trie.json` | `packages/phonetics-data/data/dict/` |
| `phoneme-trie-to-json.ts` | `packages/helper-scripts/src/` |
| `route.ts` | `apps/web/src/app/api/phoneme-search/` |
| `page.tsx` | `apps/web/src/app/[locale]/phoneme-search/` |

---

## Phase 1: Registry Enhancement

Add standard ARPABET labels to the existing registry.

#### [MODIFY] `cmu-arpa-registry.ts`

Add mapping from `PhonemeSymbolId` → display ARPABET label:

```typescript
export const PhonemeArpabetLabel: Record<PhonemeSymbolId, string> = {
  // Consonants
  "voiceless-bilabial-plosive": "P",
  "voiced-bilabial-plosive": "B",
  "voiceless-alveolar-plosive": "T",
  // ...
  
  // Vowels - note schwa vs strut distinction
  "mid-central-unrounded": "AX",       // schwa /ə/
  "open-mid-back-unrounded": "AH",     // strut /ʌ/
  "r-colored-open-mid-central": "ER",
  // ...all 39 phonemes
};
```

Add helper function:

```typescript
export function getArpabetForPhonemeId(phonemeId: PhonemeSymbolId): string {
  return PhonemeArpabetLabel[phonemeId];
}
```

---

## Phase 2: Data Layer

Generate the phoneme trie with standard ARPABET keys.

#### [NEW] `phoneme-trie-to-json.ts`

Script to generate trie:

1. Load CMU dict
2. For each word's phoneme sequence:
   - CMU token → `PhonemeSymbolId` (via `CmuArpaRegistry`)
   - `PhonemeSymbolId` → standard ARPABET (via `PhonemeArpabetLabel`)
3. Insert into trie with standard ARPABET keys

```typescript
type PhonemeTrieNode = {
  words: string[];
  count: number;
  next: Record<string, PhonemeTrieNode>;
};
```

#### [NEW] `cmudict-phoneme-trie.json`

Generated output (~6-10MB). Keys are standard ARPABET: `K`, `AX`, `AH`, etc.

#### [MODIFY] `package.json` (helper-scripts)

Add script: `"phoneme-trie-to-json": "bun run src/phoneme-trie-to-json.ts"`

#### [MODIFY] `index.ts` (phonetics-data)

Export the new trie data.

---

## Phase 3: Backend API

Create the search endpoint.

#### [NEW] `route.ts`

**Endpoint:** `GET /api/phoneme-search`

| Param | Type | Description |
|-------|------|-------------|
| `path` | `string` | Comma-separated standard ARPABET (e.g., `K,AX,T`) |
| `limit` | `number` | Max words (default: 50) |

**Response:**
```typescript
{
  words: string[];
  totalCount: number;
  nextPhonemes: { 
    arpabet: string;   // "AX"
    ipa: string;       // "ə"
    count: number; 
  }[];
  path: string[];
}
```

---

## Phase 4: Basic Frontend UI

Build the core interactive UI with autocomplete input.

#### [NEW] `page.tsx`

Page layout with:
- Phoneme autocomplete input
- Results section
- Empty state with usage guide

#### [NEW] `phoneme-autocomplete.tsx`

Searchable combobox with tag display:

- **Type to filter:** Matches IPA symbol OR ARPABET code
  - Type "K" → `/k/ K`
  - Type "æ" → `/æ/ AE`
  - Type "AX" → `/ə/ AX`
- **Scroll to browse:** Full ~39 phoneme list visible
- **Each option displays:** `/æ/ AE` (IPA first, ARPABET second)
- **Selection adds tag:** Appears as pill in input
- **Backspace removes:** Last tag

Data source: Iterate `PhonemeIpaRegistry` + `PhonemeArpabetLabel`

#### [NEW] `use-phoneme-search.ts`

Hook with local state and debounced API calls.

#### [NEW] `use-debounce.ts`

Simple debounce utility hook.

#### [NEW] `word-results.tsx`

Displays matching words:
- Shows count: "45 words starting with /k/ /æ/..."
- Click word → fetch G2P → show IPA inline or popover

#### [NEW] `empty-state.tsx`

Usage guide similar to transcription page:
- "Search for words by their sounds"
- "Type phonemes or scroll to browse"
- Example: "Try: K → AE → T to find CAT, CATCH..."

---

## Phase 5: URL State Sync

Add shareable URLs.

#### [MODIFY] `use-phoneme-search.ts`

Replace local state with URL-synced state:

```typescript
const [pathParam, setPathParam] = useQueryState("path", {
  defaultValue: "",
  parse: (v) => v.split(",").filter(Boolean),
  serialize: (p) => p.join(","),
});
```

**Behaviors:**
- Page load with `?path=K,AE,T` → immediate search
- Selecting phonemes updates URL
- Browser back/forward works
- Shareable links

---

## Verification Plan

### Phase 1
- `PhonemeArpabetLabel` has entry for each `PhonemeSymbolId`
- `getArpabetForPhonemeId` returns correct labels

### Phase 2
```bash
bun --cwd packages/helper-scripts phoneme-trie-to-json
# Verify K → AE → T path contains "CAT"
```

### Phase 3
```bash
curl "http://localhost:3000/api/phoneme-search?path=K,AE,T" | jq
```

### Phase 4
- Autocomplete shows all phonemes
- Type "AX" → shows schwa option
- Type "AH" → shows strut option (distinct from schwa)
- Click word → IPA appears

### Phase 5
- Direct URL access shows results immediately
- Browser back/forward works
- Copy URL → paste in new tab → same results

---

## Timeline

| Phase | Effort |
|-------|--------|
| Phase 1: Registry Enhancement | 30 min |
| Phase 2: Data Layer | 2-3 hours |
| Phase 3: Backend API | 1 hour |
| Phase 4: Basic UI | 4-5 hours |
| Phase 5: URL Sync | 1 hour |

**Total: ~8-10 hours**

---

## Future (Out of Scope)

- Phoneme search terms/tags (type "schwa" to find AX)
- Contains search (phoneme sequence anywhere)
- Rhyme finder (reverse trie)
- Audio playback
