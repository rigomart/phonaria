# G2P Enhancement Implementation Plan

## Problem
Current G2P system downloads 3.7MB CMUdict from GitHub on every cold start (~2-3s), ignores pronunciation variants, and uses poor fallback for unknown words.

## Solution Overview
Four-phase iterative approach maintaining full dictionary coverage while improving accuracy and performance:

1. **Phase 1**: Variant Support + Enhanced Fallback (foundation)
2. **Phase 2**: Frequency-Based Hybrid Architecture (performance) 
3. **Phase 3**: Context-Aware Homograph Disambiguation (intelligence)
4. **Phase 4**: Performance & Polish (optimization)

---

## Phase 1: Variant Support + Enhanced Fallback

### What to Build
Add pronunciation variant support and improve fallback while keeping current GitHub architecture.

### Tasks

#### 1. Update Dictionary Parsing
Modify `src/lib/g2p/cmudict.ts` to support pronunciation variants:
```typescript
class CMUDict {
  private dict = new Map<string, string[][]>(); // Support multiple variants
  
  private parse(content: string): void {
    for (const line of lines) {
      if (line.startsWith(';;;') || !line.trim()) continue;
      
      const parts = line.split('  ');
      const [wordPart, phonemePart] = parts;
      
      // Extract base word from variants (LEAD(1) → LEAD)
      let baseWord = wordPart;
      if (wordPart.includes('(')) {
        baseWord = wordPart.replace(/\(\d+\)$/, '');
      }
      
      const word = baseWord.toUpperCase();
      const phonemes = convertArpabetToIPA(phonemePart.trim().split(/\s+/));
      
      // Store multiple variants per word
      if (!this.dict.has(word)) {
        this.dict.set(word, []);
      }
      this.dict.get(word)!.push(phonemes);
    }
  }
  
  lookup(word: string): string[][] | undefined {
    return this.dict.get(word.toUpperCase()); // Returns array of variants
  }
}
```

#### 2. Update Service Logic
Modify `src/lib/g2p/service.ts` for simple variant selection:
```typescript
function processWord(word: string): string[] {
  const variants = cmudict.lookup(word);
  
  if (variants && variants.length > 0) {
    // Phase 1: Simple - use first variant
    return variants[0];
  } else {
    return enhancedFallback.generate(word);
  }
}
```

#### 3. Enhanced Fallback System
Create `src/lib/g2p/enhanced-fallback.ts` for unknown words:
```typescript
class EnhancedFallback {
  private patterns = {
    // Common patterns
    'th': ['θ'],      // "think" 
    'ch': ['tʃ'],     // "church"
    'sh': ['ʃ'],      // "shop"
    'ph': ['f'],      // "phone", "iPhone"
    'ght': ['t'],     // "night" 
    
    // Vowel patterns
    'ea': ['iː'],     // "read" (basic)
    'ou': ['aʊ'],     // "house"
    'ai': ['eɪ'],     // "rain"
    
    // Silent letters
    'kn': ['n'],      // "know"
    'wr': ['r'],      // "write"
    'mb': ['m'],      // "thumb"
  };
  
  generate(word: string): string[] {
    // Apply English phonotactic rules for brand names, new words, etc.
    // Examples: "iPhone" → ["aɪ", "f", "oʊ", "n"], "Tesla" → ["t", "ɛ", "s", "l", "ə"]
  }
}
```

### Expected Results
- Same cold start (~2-3s) but variant support enabled
- Full CMUdict coverage (125k+ words) maintained
- Better pronunciation for unknown words (brand names, new terms)
- Foundation ready for Phase 2 architecture

### Data Structure After Phase 1
```typescript
// Variant support examples:
dict.get("LEAD") → [
  ["l", "iː", "d"],     // /liːd/ - to guide
  ["l", "ɛ", "d"]       // /led/ - the metal  
]

dict.get("READ") → [
  ["r", "iː", "d"],     // /riːd/ - present
  ["r", "ɛ", "d"]       // /red/ - past
]

dict.get("THE") → [
  ["ð", "ə"]            // Single pronunciation
]
```

---

## Phase 2: Frequency-Based Hybrid Architecture

### What to Build
Implement the final hybrid architecture with embedded dictionary for performance and external service for full coverage.

### Tasks

#### 1. Frequency-Based Embedded Dictionary
Create build script `apps/web/scripts/build-embedded-dict.ts` for optimized JSON dictionary:
```typescript
// Build process:
// 1. Download google-10000-english.txt
// 2. For each word in frequency order:
//    - Check if exists in CMUdict
//    - If found: add with ALL variants
// 3. Force-include remaining homographs
// 4. Generate public/data/embedded-dict.json

// Generated JSON file: public/data/embedded-dict.json
{
  "THE": [["ð", "ə"]],
  "LEAD": [["l", "iː", "d"], ["l", "ɛ", "d"]],
  "READ": [["r", "iː", "d"], ["r", "ɛ", "d"]],
  // ~7k-9k most frequent + homographs
}

// Runtime loading:
const response = await fetch('/data/embedded-dict.json');
const embeddedDict = new Map(Object.entries(await response.json()));
```

#### 2. External Service for Remaining Words
Implement external lookup for ~115k remaining CMUdict words:
```typescript
class ExternalDictService {
  async lookup(word: string): Promise<string[][]> {
    // Lookup remaining CMUdict words via external service
    // Options: CDN, Vercel KV, database API
  }
  
  async batchLookup(words: string[]): Promise<Record<string, string[][]>> {
    // Single API call for multiple words
  }
}
```

#### 3. Three-Tier Lookup System
Update service to implement complete hierarchy:
```typescript
async function processWord(word: string): string[] {
  // Tier 1: Embedded dictionary (~90% coverage, instant)
  const embedded = embeddedDict.lookup(word);
  if (embedded) {
    return embedded[0]; // Use first variant (Phase 3 will add smart selection)
  }
  
  // Tier 2: External service (~8% coverage, network call)
  const external = await externalService.lookup(word);
  if (external) {
    return external[0];
  }
  
  // Tier 3: Enhanced fallback (~2% coverage, unknown words)
  return enhancedFallback.generate(word);
}
```

### Expected Results
- Cold start: ~100-200ms (embedded dict loads fast)
- Coverage: 90% instant, 8% network call, 2% fallback = 100% total
- Bundle size: ~300-500KB embedded dictionary
- Performance: Major improvement in typical usage

---

## Phase 3: Context-Aware Homograph Disambiguation

### What to Build
Add intelligent pronunciation selection based on context analysis.

### Tasks

#### 1. Context Analysis Framework
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

#### 2. Homograph Rules Database
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
  },
  {
    word: "READ",
    rules: [
      { patterns: ["read books", "will read"], variantIndex: 0 }, // /riːd/
      { patterns: ["read yesterday", "already read"], variantIndex: 1 } // /red/
    ]
  }
  // Add rules for RECORD, etc.
];
```

#### 3. Smart Variant Selection
Create `src/lib/g2p/variant-selector.ts`:
```typescript
function selectBestVariant(word: string, variants: string[][], context: WordContext): string[] {
  const rule = RULES.find(r => r.word === word.toUpperCase());
  if (!rule) return variants[0];
  
  // Try pattern matching
  for (const r of rule.rules) {
    if (r.patterns?.some(pattern => context.sentence.includes(pattern))) {
      return variants[r.variantIndex];
    }
  }
  
  // Default to first variant
  return variants[0];
}
```

#### 4. Update Service for Smart Selection
```typescript
async function processWord(word: string, context: WordContext): string[] {
  const embedded = embeddedDict.lookup(word);
  if (embedded) {
    return embedded.length === 1 ? embedded[0] : selectBestVariant(word, embedded, context);
  }
  
  const external = await externalService.lookup(word);
  if (external) {
    return external.length === 1 ? external[0] : selectBestVariant(word, external, context);
  }
  
  return enhancedFallback.generate(word);
}
```

### Expected Results
- 80%+ accuracy on common homographs (lead, read, record, etc.)
- Maintain Phase 2 performance and coverage
- Context-aware pronunciation selection

---

## Phase 4: Performance & Polish

### What to Build
Optimize system performance and add production-ready features.

### Tasks

#### 1. Advanced Caching
Implement intelligent caching for external lookups:
```typescript
class ExternalDictService {
  private cache = new Map<string, string[][]>();
  private lruCache = new LRUCache(1000);
  
  async lookup(word: string): Promise<string[][]> {
    if (this.cache.has(word)) return this.cache.get(word);
    
    const result = await this.fetchFromService(word);
    this.cache.set(word, result);
    return result;
  }
}
```

#### 2. Performance Monitoring
Add metrics and monitoring:
```typescript
class PerformanceMonitor {
  trackLookupTime(source: 'embedded' | 'external' | 'fallback', duration: number) {}
  trackCacheHitRate() {}
  trackErrorRates() {}
}
```

#### 3. Bundle Optimization
- Compression strategies for embedded dictionary
- Tree-shaking optimizations
- Build-time analysis and reporting

### Expected Results
- Optimized cold start: <100ms
- Production-ready monitoring and metrics
- Refined caching and performance tuning

---

## Technical Decisions

### Data Format

#### Phase 1: In-Memory (GitHub + Parsing)
```typescript
Map<string, string[][]> // Supports multiple variants per word
dict.get("LEAD") → [["l", "iː", "d"], ["l", "ɛ", "d"]]
```

#### Phase 2+: Embedded JSON File
```json
// File: public/data/embedded-dict.json
{
  "THE": [["ð", "ə"]],
  "LEAD": [["l", "iː", "d"], ["l", "ɛ", "d"]],
  "READ": [["r", "iː", "d"], ["r", "ɛ", "d"]],
  "metadata": { "version": "0.7b", "totalWords": 7500 }
}

// Runtime usage:
// const response = await fetch('/data/embedded-dict.json');
// const dict = new Map(Object.entries(await response.json()));
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
- Phase 1: Node.js runtime (GitHub download, full CMUdict)
- Phase 2+: Vercel Edge Runtime compatible (~300-500KB embedded dictionary)
- External service handles remaining words (Phase 2+)
- Node.js runtime as fallback if needed

---

## Implementation Notes

### Start with Phase 1
- Update cmudict.ts parsing to support variants (remove skip logic)
- Change data structure from `Map<string, string[]>` to `Map<string, string[][]>`
- Add enhanced fallback for unknown words  
- Test that variant support works without breaking existing functionality

### Testing
- Ensure all existing tests pass
- Add variant lookup tests
- Test enhanced fallback with brand names
- Validate data structure changes

### Phase Progression
- **Phase 1**: Foundation (variant support + fallback)
- **Phase 2**: Architecture (hybrid embedded/external system)
- **Phase 3**: Intelligence (context-aware disambiguation)  
- **Phase 4**: Polish (performance optimization)
