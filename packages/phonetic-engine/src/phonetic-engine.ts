/**
 * Rule-based Phonetic Engine
 * Provides G2P (Grapheme-to-Phoneme) conversion using dictionary and rules
 */

import { DictionaryLoader } from "./dictionary-loader";
import type { PhoneticResult } from "./llm-provider";

export type { PhoneticResult } from "./llm-provider";

export interface EngineStats {
	dictionaryHits: number;
	ruleHits: number;
	llmHits: number;
	fallbackHits: number;
	totalRequests: number;
	averageConfidence: number;
}

export class PhoneticEngine {
	private dictionaryLoader = new DictionaryLoader();
	private stats: EngineStats = {
		dictionaryHits: 0,
		ruleHits: 0,
		llmHits: 0,
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
	 * Convert text to phonemes using dictionary and rule-based approach
	 * Returns results for known words, marks unknown words as fallback
	 */
	async textToPhonemes(text: string): Promise<PhoneticResult[]> {
		const words = this.tokenizeText(text);
		const results: PhoneticResult[] = [];

		for (const word of words) {
			this.stats.totalRequests++;

			// Try dictionary lookup first
			const dictEntry = this.dictionaryLoader.lookup(word);
			if (dictEntry) {
				this.stats.dictionaryHits++;
				results.push({
					word,
					phonemes: dictEntry.phonemes,
					source: "dictionary",
					confidence: 0.95,
					rawIpa: dictEntry.rawIpa,
				});
				continue;
			}

			// Try rule-based processing for unknown words
			const ruleResult = this.applyPhoneticRules(word);
			if (ruleResult && ruleResult.confidence > 0.9) {
				this.stats.ruleHits++;
				results.push({
					word,
					phonemes: ruleResult.phonemes,
					source: "rule",
					confidence: ruleResult.confidence,
				});
				continue;
			}

			// Mark as fallback for LLM processing
			this.stats.fallbackHits++;
			results.push({
				word,
				phonemes: [],
				source: "fallback",
				confidence: 0.0,
			});
		}

		return results;
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
			llmHits: 0,
			fallbackHits: 0,
			totalRequests: 0,
			averageConfidence: 0,
		};
	}
}
