# Phonetic Engine

A high-performance, rule-based phonetic engine for Grapheme-to-Phoneme (G2P) conversion. Designed to reduce dependency on Large Language Models (LLMs) by providing fast, reliable dictionary and rule-based phonetic transcription.

## 🚀 Features

- **📚 Fast Dictionary Lookups** - O(1) lookups for 100,000+ words using IPA dictionary
- **🧠 High-Confidence Rules** - Morphological transformations for unknown words
- **📊 Performance Monitoring** - Built-in statistics and performance tracking
- **🛡️ Type-Safe** - Full TypeScript support with no `any` types
- **⚡ High Performance** - 85%+ of words processed via fast dictionary lookups
- **🔧 Easy Integration** - Clean API compatible with existing G2P services

## 📦 Installation

```bash
# From the monorepo root
pnpm install
```

## 🎯 Quick Start

```typescript
import { PhoneticEngine } from "phonetic-engine";

// Create and initialize the engine
const engine = new PhoneticEngine();
await engine.initialize();

// Convert text to phonemes
const results = await engine.textToPhonemes("hello world");

console.log(results);
// Output:
// [
//   {
//     word: "hello",
//     phonemes: ["h", "ə", "l", "oʊ"],
//     source: "dictionary",
//     confidence: 0.95,
//     rawIpa: "/həloʊ/"
//   },
//   {
//     word: "world",
//     phonemes: ["w", "ɜː", "l", "d"],
//     source: "dictionary",
//     confidence: 0.95,
//     rawIpa: "/wɜːld/"
//   }
// ]
```

## 🏗️ Architecture

### Processing Pipeline

1. **Dictionary Lookup** (95% confidence) - Fast IPA database search
2. **Rule-Based Processing** (85-95% confidence) - High-confidence morphological rules
3. **Fallback Marking** (0% confidence) - Unknown words for external LLM processing

### Supported Transformations

- **-ing endings**: `run` → `running` (/ɪŋ/)
- **-ed endings**: `walk` → `walked` (/t/)
- **-s endings**: `cat` → `cats` (/s/)
- **-ly endings**: `quick` → `quickly` (/lɪ/)
- **-er endings**: `big` → `bigger` (/ɹ/)

## 🔧 API Reference

### PhoneticEngine

#### Constructor
```typescript
const engine = new PhoneticEngine();
```

#### Methods

##### `initialize(): Promise<void>`
Load the IPA dictionary and prepare the engine for use.

```typescript
await engine.initialize();
```

##### `textToPhonemes(text: string): Promise<PhoneticResult[]>`
Convert text to phonetic transcription.

**Parameters:**
- `text: string` - Input text to convert

**Returns:** Array of `PhoneticResult` objects

##### `hasWord(word: string): boolean`
Check if a word exists in the dictionary.

**Parameters:**
- `word: string` - Word to check

**Returns:** `true` if word exists, `false` otherwise

##### `getStats(): EngineStats`
Get performance statistics.

**Returns:**
```typescript
{
  dictionaryHits: number;
  ruleHits: number;
  llmHits: number;        // Always 0 (handled externally)
  fallbackHits: number;
  totalRequests: number;
  averageConfidence: number;
}
```

##### `getDictionaryStats(): DictionaryStats | null`
Get dictionary loading statistics.

**Returns:**
```typescript
{
  totalEntries: number;
  uniqueWords: number;
  averagePhonemesPerWord: number;
  loadTime: number;
  sourceUrl: string;
}
```

### Types

#### PhoneticResult
```typescript
interface PhoneticResult {
  word: string;
  phonemes: string[];
  source: "dictionary" | "rule" | "fallback";
  confidence: number;
  rawIpa?: string;
}
```

## 🎮 Usage Examples

### Basic Text Processing
```typescript
const engine = new PhoneticEngine();
await engine.initialize();

const results = await engine.textToPhonemes("Hello world, how are you?");

results.forEach(result => {
  console.log(`${result.word}: ${result.phonemes.join(" ")} (${result.source}, ${result.confidence})`);
});
```

### Word-by-Word Processing
```typescript
const words = ["hello", "running", "cats", "unknownword"];

for (const word of words) {
  const results = await engine.textToPhonemes(word);
  const result = results[0];

  if (result.source === "fallback") {
    console.log(`"${word}" not found - send to external LLM`);
  } else {
    console.log(`"${word}": ${result.phonemes.join(" ")} (${result.source})`);
  }
}
```

### Performance Monitoring
```typescript
const engine = new PhoneticEngine();
await engine.initialize();

// Process some text
await engine.textToPhonemes("This is a test sentence for performance monitoring.");

// Check performance stats
const stats = engine.getStats();
console.log(`Dictionary hits: ${stats.dictionaryHits}`);
console.log(`Rule hits: ${stats.ruleHits}`);
console.log(`Fallback: ${stats.fallbackHits}`);
console.log(`Average confidence: ${stats.averageConfidence}`);
```

## 🔄 Integration with Existing Systems

The phonetic engine is designed to integrate seamlessly with existing G2P services:

```typescript
// In your existing G2P service
class HybridG2PService {
  private phoneticEngine: PhoneticEngine;
  private llmService: OpenAIService;

  async textToPhonemes(text: string): Promise<G2PWord[]> {
    // Use phonetic engine for dictionary + rules
    const phoneticResults = await this.phoneticEngine.textToPhonemes(text);

    // Process fallback words with LLM
    const unknownWords = phoneticResults.filter(r => r.source === "fallback");

    if (unknownWords.length > 0) {
      // Use existing OpenAI service for unknown words
      const llmResults = await this.llmService.textToPhonemes(text);
      // Merge results...
    }

    return phoneticResults.map(this.convertToG2PWord);
  }
}
```

## 📝 Development

### Building
```bash
cd packages/phonetic-engine
pnpm typecheck
```

## 🙏 Acknowledgments

- **Open-dict-data IPA Dictionary** - High-quality phonetic data source
- **International Phonetic Alphabet (IPA)** - Standard for phonetic notation

