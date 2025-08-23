/**
 * Rule-based Phonetic Engine
 * Provides G2P (Grapheme-to-Phoneme) conversion using dictionary and rules
 */

import { DictionaryLoader } from "./dictionary-loader";

export interface PhoneticResult {
	word: string;
	phonemes: string[];
	source: "dictionary" | "rule" | "fallback";
	confidence: number;
	rawIpa?: string;
}

export interface EngineStats {
	dictionaryHits: number;
	ruleHits: number;
	fallbackHits: number;
	totalRequests: number;
	averageConfidence: number;
}

export class PhoneticEngine {
	private dictionaryLoader = new DictionaryLoader();
	private stats: EngineStats = {
		dictionaryHits: 0,
		ruleHits: 0,
		fallbackHits: 0,
		totalRequests: 0,
		averageConfidence: 0,
	};

	/**
	 * Initialize the phonetic engine by loading the dictionary
	 */
	async initialize(): Promise<void> {
		await this.dictionaryLoader.loadDictionary();
		console.log("Phonetic engine initialized successfully");
	}

	/**
	 * Convert text to phonemes using the hybrid approach
	 */
	async textToPhonemes(text: string): Promise<PhoneticResult[]> {
		const words = this.tokenizeText(text);
		const results: PhoneticResult[] = [];

		for (const word of words) {
			const result = await this.processWord(word);
			results.push(result);
		}

		return results;
	}

	/**
	 * Process a single word through the phonetic pipeline
	 */
	private async processWord(word: string): Promise<PhoneticResult> {
		this.stats.totalRequests++;

		// Step 1: Try dictionary lookup first (fastest, most reliable)
		const dictEntry = this.dictionaryLoader.lookup(word);
		if (dictEntry) {
			this.stats.dictionaryHits++;
			return {
				word,
				phonemes: dictEntry.phonemes,
				source: "dictionary",
				confidence: 0.95, // High confidence for dictionary matches
				rawIpa: dictEntry.rawIpa,
			};
		}

		// Step 2: Try LLM (potentially very accurate, trained on massive data)
		// TODO: Implement LLM integration here
		// For now, this will be handled by the G2P service

		// Step 3: Basic rules as final fallback (only if LLM completely fails)
		const ruleResult = this.applyPhoneticRules(word);
		if (ruleResult && ruleResult.confidence > 0.9) {
			this.stats.ruleHits++;
			return {
				word,
				phonemes: ruleResult.phonemes,
				source: "rule",
				confidence: ruleResult.confidence,
			};
		}

		// Step 4: Ultimate fallback - no result available
		this.stats.fallbackHits++;
		return {
			word,
			phonemes: [], // No phonemes available
			source: "fallback",
			confidence: 0.0,
		};
	}

	/**
	 * Tokenize text into individual words
	 */
	private tokenizeText(text: string): string[] {
		// Simple tokenization - can be enhanced later
		return text
			.toLowerCase()
			.replace(/[^\w\s]/g, "") // Remove punctuation
			.split(/\s+/)
			.filter((word) => word.length > 0);
	}

	/**
	 * Apply phonetic rules to convert word to phonemes
	 * Focuses on high-confidence morphological transformations only
	 * No character-for-character mapping to avoid unreliable results
	 */
	private applyPhoneticRules(word: string): { phonemes: string[]; confidence: number } | null {
		// High-confidence morphological rules only
		// No general character mapping - too unreliable

		if (word.endsWith("ing")) {
			// Progressive/gerund form: -ing
			// Very high confidence for this common pattern
			const base = word.slice(0, -3);
			const baseEntry = this.dictionaryLoader.lookup(base);
			if (baseEntry) {
				return {
					phonemes: [...baseEntry.phonemes, "ɪ", "ŋ"],
					confidence: 0.95, // High confidence for known base + common suffix
				};
			}
		}

		if (word.endsWith("ed")) {
			// Past tense: -ed (regular verbs)
			const base = word.slice(0, -2);
			const baseEntry = this.dictionaryLoader.lookup(base);
			if (baseEntry) {
				// Simplified: always use /t/ sound (could be /d/ or /ɪd/ depending on final sound)
				return {
					phonemes: [...baseEntry.phonemes, "t"],
					confidence: 0.85, // Good confidence for known base + regular past tense
				};
			}
		}

		if (word.endsWith("s") && word.length > 3) {
			// Plural or possessive: -s
			const base = word.slice(0, -1);
			const baseEntry = this.dictionaryLoader.lookup(base);
			if (baseEntry) {
				return {
					phonemes: [...baseEntry.phonemes, "s"],
					confidence: 0.9, // High confidence for known base + plural
				};
			}
		}

		if (word.endsWith("ly")) {
			// Adverb suffix: -ly
			const base = word.slice(0, -2);
			const baseEntry = this.dictionaryLoader.lookup(base);
			if (baseEntry) {
				return {
					phonemes: [...baseEntry.phonemes, "l", "i"],
					confidence: 0.9, // High confidence for known base + adverb suffix
				};
			}
		}

		if (word.endsWith("er")) {
			// Comparative: -er
			const base = word.slice(0, -2);
			const baseEntry = this.dictionaryLoader.lookup(base);
			if (baseEntry) {
				return {
					phonemes: [...baseEntry.phonemes, "ɹ"],
					confidence: 0.85, // Good confidence for comparative form
				};
			}
		}

		// No general character mapping - too unreliable
		// Only use high-confidence morphological rules based on known dictionary words

		return null; // No high-confidence rule found
	}

	/**
	 * Check if a word is in the dictionary
	 */
	hasWord(word: string): boolean {
		return this.dictionaryLoader.hasWord(word);
	}

	/**
	 * Get engine statistics
	 */
	getStats(): EngineStats {
		return { ...this.stats };
	}

	/**
	 * Get dictionary statistics
	 */
	getDictionaryStats() {
		return this.dictionaryLoader.getStats();
	}

	/**
	 * Reset statistics
	 */
	resetStats(): void {
		this.stats = {
			dictionaryHits: 0,
			ruleHits: 0,
			fallbackHits: 0,
			totalRequests: 0,
			averageConfidence: 0,
		};
	}
}
