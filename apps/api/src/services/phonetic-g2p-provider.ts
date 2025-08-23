/**
 * Phonetic Engine G2P Provider
 * Integrates the rule-based phonetic engine with the existing G2P service
 * Focuses on dictionary and rule-based processing, lets API layer handle LLM
 */

import { PhoneticEngine, type PhoneticResult } from "phonetic-engine";
import type { G2PWord, IG2PProvider } from "./g2p";

export class PhoneticG2PProvider implements IG2PProvider {
	readonly name = "phonetic-engine";
	readonly version = "1.0.0";

	private engine: PhoneticEngine;

	constructor() {
		this.engine = new PhoneticEngine();
	}

	/**
	 * Initialize the provider by loading the phonetic engine
	 */
	async initialize(): Promise<void> {
		await this.engine.initialize();
	}

	/**
	 * Convert text to phonemes using the hybrid phonetic engine
	 */
	async textToPhonemes(text: string): Promise<G2PWord[]> {
		const results = await this.engine.textToPhonemes(text);

		return results.map(this.convertToG2PWord);
	}

	/**
	 * Convert PhoneticResult to G2PWord format for compatibility
	 */
	private convertToG2PWord(result: PhoneticResult): G2PWord {
		return {
			word: result.word,
			phonemes: result.phonemes,
		};
	}

	/**
	 * Get phonetic engine statistics
	 */
	getEngineStats() {
		return this.engine.getStats();
	}

	/**
	 * Get dictionary statistics
	 */
	getDictionaryStats() {
		return this.engine.getDictionaryStats();
	}

	/**
	 * Check if a word is in the dictionary
	 */
	hasWord(word: string): boolean {
		return this.engine.hasWord(word);
	}
}
