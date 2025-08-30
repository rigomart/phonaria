# G2P Fallback System - Implementation Plan

## Current Status ✅

**Phase 1: CMUdict Integration** - COMPLETE
- Full CMUdict (~134k words) loaded from GitHub
- ARPAbet to IPA conversion with correct symbols (`G` → `ɡ`)
- Clean modular architecture
- Zero empty arrays (100% word coverage)

**Phase 2.1: Basic Fallback** - COMPLETE
- Simple letter-to-IPA mapping for unknown words
- Basic consonant and vowel conversion
- Functional but naive pronunciation generation

---

## Remaining Implementation Phases

### **Phase 2.2: Basic Vowel Mapping Improvements**
**Goal**: Better vowel pronunciation in unknown words
**Priority**: HIGH
**Effort**: 1-2 days

#### Current Issues
```json
{"word": "unicode", "phonemes": ["ʌ","n","ɪ","k","ɔ","d","ɛ"]}
// Issues: final 'e' should be silent, 'i' context-dependent
```

#### Implementation
```typescript
// In fallback-g2p.ts
private improvedVowelMap: Record<string, string> = {
  'a': 'æ',    // cat
  'e': 'ɛ',    // bet (but silent at end)
  'i': 'ɪ',    // bit
  'o': 'ɔ',    // cot  
  'u': 'ʌ'     // cut
};

// Add silent 'e' rule
private isSilentE(word: string, position: number): boolean {
  return position === word.length - 1 && word.endsWith('e');
}
```

#### Expected Results
- `"unicode"` → `["ʌ","n","ɪ","k","oʊ","d"]` (silent final 'e')
- Better vowel quality based on position

---

### **Phase 2.3: Common Endings**
**Goal**: Handle frequent English suffixes accurately
**Priority**: HIGH  
**Effort**: 2-3 days

#### Target Patterns
```typescript
private commonEndings: Record<string, string[]> = {
  'tion': ['ʃ', 'ə', 'n'],     // nation, information
  'sion': ['ʒ', 'ə', 'n'],     // version, decision
  'ed': ['d'],                  // played, moved
  'ing': ['ɪ', 'ŋ'],          // running, playing
  'ly': ['l', 'i'],            // quickly, slowly
  'ness': ['n', 'ə', 's'],     // happiness, darkness
  'ment': ['m', 'ə', 'n', 't'], // government, movement
  'able': ['ə', 'b', 'ə', 'l'], // readable, capable
  'ful': ['f', 'ə', 'l'],      // helpful, beautiful
  'less': ['l', 'ə', 's']      // hopeless, endless
};
```

#### Implementation Strategy
1. **Suffix Detection**: Check word endings for known patterns
2. **Root + Suffix**: Split word into stem + ending
3. **Fallback Chain**: Try ending rules, then basic mapping
4. **Validation**: Test with common English words

#### Expected Results
- `"information"` → `[...stem..., "ʃ", "ə", "n"]`
- `"programming"` → `[...stem..., "ɪ", "ŋ"]`
- Much more natural pronunciation for derived words

---

### **Phase 2.4: Digraphs & Letter Combinations**
**Goal**: Handle two-letter combinations that represent single sounds
**Priority**: HIGH
**Effort**: 2-3 days

#### Target Patterns
```typescript
private digraphs: Array<{pattern: string, ipa: string}> = [
  {pattern: 'ch', ipa: 'tʃ'},  // church, much
  {pattern: 'sh', ipa: 'ʃ'},   // she, wish
  {pattern: 'th', ipa: 'θ'},   // think, path (voiceless)
  {pattern: 'th', ipa: 'ð'},   // this, that (voiced) - needs context
  {pattern: 'ng', ipa: 'ŋ'},   // sing, long
  {pattern: 'ph', ipa: 'f'},   // phone, graph
  {pattern: 'gh', ipa: 'f'},   // laugh, tough (when pronounced)
  {pattern: 'ck', ipa: 'k'},   // back, luck
  {pattern: 'qu', ipa: 'kw'},  // queen, quick
  {pattern: 'wh', ipa: 'w'}    // what, where (simplified)
];
```

#### Implementation Strategy
1. **Pattern Matching**: Process word left-to-right, match longest patterns first
2. **Context Rules**: Handle ambiguous cases (voiced/voiceless 'th')
3. **Priority System**: Digraphs override single letters
4. **Boundary Handling**: Don't break across morpheme boundaries

#### Expected Results
- `"church"` → `["tʃ", "ɜː", "tʃ"]` instead of `["k", "h", "ʌ", "ɹ", "k", "h"]`
- `"philosophy"` → `["f", "ɪ", "l", "ɔ", "s", "ə", "f", "i"]`

---

### **Phase 2.5: Basic Stress Placement**
**Goal**: Add stress markers to fallback pronunciations  
**Priority**: MEDIUM
**Effort**: 2 days

#### English Stress Rules
```typescript
private getStressPattern(word: string): number[] {
  const syllableCount = this.countSyllables(word);
  
  // Basic English stress patterns
  if (syllableCount === 1) return [1];           // 'cat' → primary stress
  if (syllableCount === 2) return [1, 0];       // 'hello' → first stressed
  if (syllableCount === 3) return [0, 1, 0];    // 'computer' → second stressed
  
  // Default: stress first syllable for longer words
  return [1, ...Array(syllableCount - 1).fill(0)];
}
```

#### Implementation Strategy
1. **Syllable Counting**: Count vowel groups as syllables
2. **Stress Rules**: Apply basic English patterns
3. **Morphological Hints**: Use suffix information for stress placement
4. **Integration**: Inject stress markers into phoneme arrays

#### Expected Results
- Fallback words get realistic stress patterns
- Better prosody for text-to-speech applications

---

### **Phase 2.6: Advanced Patterns & Exceptions**
**Goal**: Handle complex English spelling patterns and irregularities
**Priority**: LOW
**Effort**: 3-5 days

#### Advanced Features
```typescript
// Context-dependent rules
private contextRules: Array<{
  pattern: RegExp,
  before?: string,
  after?: string,
  ipa: string
}> = [
  // 'c' before 'e','i','y' → /s/
  {pattern: /c/, after: '[eiy]', ipa: 's'},
  // 'g' before 'e','i','y' → /dʒ/  
  {pattern: /g/, after: '[eiy]', ipa: 'dʒ'},
  // Silent letters
  {pattern: /k/, before: 'n', ipa: ''},    // knee, know
  {pattern: /b/, after: 'm', ipa: ''},     // lamb, thumb
  {pattern: /l/, after: '[aou]', ipa: ''}, // half, talk, could
];
```

#### Implementation Strategy
1. **Context Analysis**: Check surrounding letters for rule application
2. **Exception Handling**: Common irregular words
3. **Morpheme Awareness**: Don't apply rules across word boundaries
4. **Performance**: Optimize pattern matching

---

## Implementation Priority Order

### **Immediate Next Steps (Recommended)**
1. **Phase 2.2** - Vowel improvements (silent 'e', better vowel selection)
2. **Phase 2.3** - Common endings (biggest impact on real words)
3. **Phase 2.4** - Digraphs (essential for English spelling)

### **Future Enhancements**
4. **Phase 2.5** - Stress placement (better prosody)
5. **Phase 2.6** - Advanced patterns (edge cases)

### **Phase 3 Considerations (Future)**
- Multiple pronunciation variants from CMUdict
- Regional accent support (British vs American)
- Confidence scoring (dictionary vs fallback)
- Performance optimizations (caching, compression)

---

## Testing Strategy

### **Phase-by-Phase Testing**
Each phase should include:
1. **Unit tests** for new patterns
2. **Integration tests** with G2P API
3. **Regression tests** to ensure no breaking changes
4. **Real-world testing** with common English text

### **Test Cases by Phase**
```bash
# Phase 2.2: Vowel improvements
curl -d '{"text": "code ride tube bike"}' # silent 'e' tests

# Phase 2.3: Common endings  
curl -d '{"text": "information running quickly"}' # suffix tests

# Phase 2.4: Digraphs
curl -d '{"text": "church philosophy think"}' # combination tests
```

### **Success Metrics**
- **Accuracy**: Pronunciations match reasonable expectations
- **Coverage**: No edge case crashes or errors
- **Performance**: Response times under 100ms
- **Maintainability**: Easy to add new patterns

---

## File Organization (Current)

```
apps/api/src/lib/
├── cmudict.ts              # Core dictionary management
├── arpabet-mapping.ts      # ARPAbet → IPA conversion  
└── fallback-g2p.ts         # Fallback patterns (growing)
```

## Future File Organization (Phase 2.6+)

```
apps/api/src/lib/
├── cmudict.ts              # Core dictionary
├── arpabet-mapping.ts      # ARPAbet conversions
├── fallback-g2p/
│   ├── index.ts            # Main fallback class
│   ├── basic-mapping.ts    # Phase 2.1 patterns
│   ├── vowel-rules.ts      # Phase 2.2 patterns  
│   ├── endings.ts          # Phase 2.3 patterns
│   ├── digraphs.ts         # Phase 2.4 patterns
│   ├── stress-rules.ts     # Phase 2.5 patterns
│   └── advanced-rules.ts   # Phase 2.6 patterns
└── ipa-utils.ts            # Shared IPA utilities
```

This modular approach will keep the codebase maintainable as the fallback system grows in complexity.