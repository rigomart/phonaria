# G2P Enhancement Implementation Plan

## Problem
Current G2P system downloads 3.7MB CMUdict from GitHub on every cold start (~2-3s), ignores pronunciation variants, and uses poor fallback for unknown words.

## Solution Overview
Three-phase approach maintaining full dictionary coverage while improving accuracy and performance:

1. **Phase 1**: Optimize loading + support variants (foundation)
2. **Phase 2**: Add homograph disambiguation (intelligence)  
3. **Phase 3**: Hybrid architecture (performance)

---

## Phase 1: Foundation

### What to Build
Replace GitHub download with pre-processed JSON, support pronunciation variants, improve fallback.

### Tasks

#### 1. Build Script
Create `apps/web/scripts/build-cmudict.ts`:
- Parse `/path/to/cmudict-0.7b` file
- Extract variants: `LEAD` and `LEAD(1)` → multiple pronunciations
- Generate `public/data/cmudict.json`:
```json
{
  "LEAD": [["L", "IY1", "D"], ["L", "EH1", "D"]],
  "READ": [["R", "IY1", "D"], ["R", "EH1", "D"]],
  "WORD": [["W", "ER1", "D"]]
}
```

#### 2. Update Dictionary Loader
Modify `src/lib/g2p/cmudict.ts`:
```typescript
class CMUDict {
  private dict: Map<string, string[][]>; // Support multiple variants
  
  async load() {
    try {
      const response = await fetch('/data/cmudict.json');
      this.dict = new Map(Object.entries(await response.json()));
    } catch {
      // Fall back to current GitHub approach
      await this.loadLegacyDict();
    }
  }
  
  lookup(word: string): string[][] | undefined {
    return this.dict.get(word.toUpperCase());
  }
}
```

#### 3. Update Service Logic
Modify `src/lib/g2p/service.ts`:
```typescript
function processWord(word: string): string[] {
  const variants = cmudict.lookup(word);
  
  if (variants) {
    return variants[0]; // Phase 1: Use first variant
  } else {
    return enhancedFallback.generate(word);
  }
}
```

#### 4. Enhanced Fallback
Create `src/lib/g2p/enhanced-fallback.ts`:
```typescript
class EnhancedFallback {
  private patterns = {
    'th': ['θ'], 'ch': ['tʃ'], 'sh': ['ʃ'], 'ph': ['f']
    // Add more English patterns
  };
  
  generate(word: string): string[] {
    // Apply phonotactic rules instead of letter-by-letter
  }
}
```

### File Structure
```
apps/web/
├── scripts/build-cmudict.ts
├── public/data/cmudict.json (generated)
└── src/lib/g2p/
    ├── cmudict.ts (updated)
    ├── enhanced-fallback.ts (new)
    └── service.ts (updated)
```

### Expected Results
- Cold start: ~500ms (vs 2-3s)
- Coverage: 125k+ words maintained  
- Variants: Can access multiple pronunciations

---

## Phase 2: Homograph Disambiguation

### What to Build
Add context-aware pronunciation selection for words with multiple variants.

### Tasks

#### 1. Context Analysis
Create `src/lib/g2p/context-analyzer.ts`:
```typescript
interface WordContext {
  word: string;
  position: number;
  surrounding: string[]; // [prevWord, nextWord]
  sentence: string;
}

function analyzeContext(word: string, position: number, words: string[]): WordContext {
  return {
    word,
    position,
    surrounding: [words[position-1] || '', words[position+1] || ''],
    sentence: words.join(' ')
  };
}
```

#### 2. Homograph Rules
Create `src/lib/g2p/homograph-rules.ts`:
```typescript
interface HomographRule {
  word: string;
  rules: Array<{
    patterns?: string[];     // ["lead singer", "lead role"]
    variantIndex: number;    // Which pronunciation to use
  }>;
}

const RULES: HomographRule[] = [
  {
    word: "LEAD",
    rules: [
      { patterns: ["lead singer", "will lead"], variantIndex: 0 }, // /liːd/
      { patterns: ["lead pipe", "made of lead"], variantIndex: 1 } // /led/
    ]
  }
  // Add rules for READ, RECORD, etc.
];
```

#### 3. Variant Selection
Create `src/lib/g2p/variant-selector.ts`:
```typescript
function selectBestVariant(word: string, variants: string[][], context: WordContext): string[] {
  const rule = RULES.find(r => r.word === word.toUpperCase());
  if (!rule) return variants[0];
  
  for (const r of rule.rules) {
    if (r.patterns?.some(pattern => context.sentence.includes(pattern))) {
      return variants[r.variantIndex];
    }
  }
  
  return variants[0]; // Default to first
}
```

#### 4. Update Service
Modify `src/lib/g2p/service.ts`:
```typescript
function processWord(word: string, context: WordContext): string[] {
  const variants = cmudict.lookup(word);
  
  if (variants) {
    if (variants.length === 1) {
      return variants[0];
    } else {
      return selectBestVariant(word, variants, context); // NEW
    }
  } else {
    return enhancedFallback.generate(word);
  }
}
```

### Expected Results
- 80%+ accuracy on common homographs
- Same coverage and performance as Phase 1

---

## Phase 3: Performance Optimization

### What to Build
Split dictionary into embedded common words + external rare words for better cold start.

### Tasks

#### 1. Dictionary Splitting
Update build script to generate:
- `src/lib/g2p/embedded-common.json` (5k most frequent words)
- `src/lib/g2p/embedded-homographs.json` (known homographs)
- External service for remaining words

#### 2. Hybrid Lookup
Create `src/lib/g2p/hybrid-dictionary.ts`:
```typescript
class HybridDictionary {
  async lookup(word: string): Promise<string[][]> {
    // Try embedded first
    let result = embeddedCommon.get(word) || embeddedHomographs.get(word);
    if (result) return result;
    
    // External lookup for rare words
    return await externalService.lookup(word);
  }
}
```

#### 3. Batch External Calls
```typescript
async function processText(text: string) {
  const words = tokenize(text);
  const unknownWords = [];
  
  // First pass: embedded lookup
  for (const word of words) {
    const variants = await hybridDict.lookupEmbedded(word);
    if (!variants) unknownWords.push(word);
  }
  
  // Single batch call for unknowns
  if (unknownWords.length > 0) {
    await externalService.batchLookup(unknownWords);
  }
}
```

### Expected Results
- Cold start: <150ms
- 90% coverage from embedded (no network calls)
- Bundle size: ~500KB

---

## Technical Decisions

### Data Format
```json
{
  "WORD": [["phoneme1", "phoneme2"], ["variant1", "variant2"]],
  "metadata": { "version": "0.7b", "totalEntries": 125000 }
}
```

### Build Process
- Generate dictionary **once**, commit to repo
- Only regenerate when updating source dictionary
- Run: `node scripts/build-cmudict.ts`

### Error Handling
- Optimized JSON fails → GitHub fallback
- External service fails → Enhanced rules
- All fails → Letter mapping

### Deployment
- Phase 1-2: Node.js runtime (~2-3MB dictionary)
- Phase 3: Optimize for Vercel Edge if needed

---

## Implementation Notes

### Start with Phase 1
- Modify existing build script to generate flat JSON
- Update cmudict.ts to load from `/data/cmudict.json`  
- Add variant support to service.ts
- Test that cold start improves

### Testing
- Ensure all existing tests pass
- Add variant lookup tests
- Benchmark cold start performance
- Validate homograph accuracy in Phase 2

### External Service (Phase 3)
- TBD: CDN, database, or Vercel KV
- Must support batch lookup
- Include caching and timeout handling
