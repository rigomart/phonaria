/**
 * Hybrid Dictionary-based G2P Service
 * Uses embedded core dictionary for instant startup + remote extended dictionary for full coverage
 * Now with smart IPA phoneme parsing!
 */

import { smartIPAParser } from "./smart-ipa-parser.js";

// Embedded core dictionary data (10 words + examples to demonstrate smart parsing)
const CORE_DICTIONARY_DATA = `hello	/həˈloʊ/
world	/wɝld/
the	/ðə/, /ði/
and	/ænd/, /ənd/
you	/ju/
that	/ðæt/
choice	/tʃɔɪs/
judge	/dʒʌdʒ/
night	/naɪt/
about	/əˈbaʊt/`;

export class HybridDictionaryG2P {
	private coreDict = new Map<string, string[]>();
	private extendedDict = new Map<string, string[]>();
	private coreLoaded = false;
	private extendedLoaded = false;
	private extendedLoading = false;

	constructor() {
		// Load core dictionary immediately (synchronous)
		this.loadCoreDict();

		// Don't load extended dictionary in constructor (Cloudflare Workers restriction)
		// It will be loaded lazily on first request
	}

	/**
	 * Load core dictionary synchronously from embedded data
	 */
	private loadCoreDict(): void {
		try {
			const lines = CORE_DICTIONARY_DATA.split("\n");

			for (const line of lines) {
				if (!line.trim()) continue;

				const [word, ipaString] = line.split("\t");
				if (!word || !ipaString) continue;

				// Take first pronunciation variant
				const firstPronunciation = ipaString.split(",")[0].trim();
				const cleanIPA = firstPronunciation.replace(/^\/|\/$/g, "");
				const phonemes = this.extractBasicPhonemes(cleanIPA);

				this.coreDict.set(word.toLowerCase(), phonemes);
			}

			this.coreLoaded = true;
			console.log(`Core dictionary loaded: ${this.coreDict.size} entries`);
		} catch (error) {
			console.error("Failed to load core dictionary:", error);
		}
	}

	/**
	 * Load extended dictionary asynchronously from remote source
	 */
	private async loadExtendedDict(): Promise<void> {
		if (this.extendedLoading || this.extendedLoaded) return;

		this.extendedLoading = true;

		try {
			console.log("Loading extended dictionary from remote...");

			const response = await fetch(
				"https://raw.githubusercontent.com/open-dict-data/ipa-dict/refs/heads/master/data/en_US.txt",
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch dictionary: ${response.status}`);
			}

			const text = await response.text();
			this.parseExtendedDictionary(text);

			this.extendedLoaded = true;
			console.log(`Extended dictionary loaded: ${this.extendedDict.size} entries`);
		} catch (error) {
			console.error("Failed to load extended dictionary:", error);
		} finally {
			this.extendedLoading = false;
		}
	}

	/**
	 * Parse extended dictionary data
	 */
	private parseExtendedDictionary(text: string): void {
		const lines = text.split("\n");

		for (const line of lines) {
			if (!line.trim()) continue;

			const parts = line.split("\t");
			if (parts.length !== 2) continue;

			const [word, ipaString] = parts;
			if (!word || !ipaString) continue;

			// Take first pronunciation variant
			const firstPronunciation = ipaString.split(",")[0].trim();
			const cleanIPA = firstPronunciation.replace(/^\/|\/$/g, "");
			const phonemes = this.extractBasicPhonemes(cleanIPA);

			this.extendedDict.set(word.toLowerCase(), phonemes);
		}
	}

	/**
	 * Extract phonemes from IPA string using smart parsing
	 * Properly handles complex phonemes like 'tʃ', 'dʒ', 'eɪ', etc.
	 */
	private extractBasicPhonemes(ipaString: string): string[] {
		return smartIPAParser.parseIPA(ipaString);
	}

	/**
	 * Main transcription method with hybrid lookup
	 */
	async transcribe(text: string): Promise<{ words: Array<{ word: string; phonemes: string[] }> }> {
		if (!text?.trim()) {
			return { words: [] };
		}

		// Try to load extended dictionary on first request (if not already loading/loaded)
		if (!this.extendedLoaded && !this.extendedLoading) {
			this.loadExtendedDict().catch((error) => {
				console.warn("Extended dictionary failed to load:", error);
			});
		}

		const words = this.tokenizeText(text);

		const transcribedWords = words.map((word) => ({
			word: word,
			phonemes: this.lookupWord(word),
		}));

		return { words: transcribedWords };
	}

	/**
	 * Tokenize input text
	 */
	private tokenizeText(text: string): string[] {
		return text
			.split(/(\s+|[^\w\s'-])/)
			.filter((token) => token.trim().length > 0 && /\w/.test(token));
	}

	/**
	 * Lookup word with hybrid strategy:
	 * 1. Try extended dictionary first (most complete)
	 * 2. Fall back to core dictionary (always available)
	 * 3. Return empty array if not found
	 */
	private lookupWord(word: string): string[] {
		const cleanWord = word.toLowerCase().replace(/[^\w'-]/g, "");

		// Try extended dictionary first (if loaded)
		if (this.extendedLoaded) {
			const extendedResult = this.extendedDict.get(cleanWord);
			if (extendedResult) {
				return extendedResult;
			}
		}

		// Fall back to core dictionary
		const coreResult = this.coreDict.get(cleanWord);
		if (coreResult) {
			return coreResult;
		}

		// Not found in either dictionary
		return [];
	}

	/**
	 * Get service statistics
	 */
	getStats(): {
		coreEntries: number;
		extendedEntries: number;
		coreLoaded: boolean;
		extendedLoaded: boolean;
		isHealthy: boolean;
	} {
		return {
			coreEntries: this.coreDict.size,
			extendedEntries: this.extendedDict.size,
			coreLoaded: this.coreLoaded,
			extendedLoaded: this.extendedLoaded,
			isHealthy: this.coreLoaded, // Service is healthy if core dictionary is loaded
		};
	}
}
