/**
 * IPA Dictionary loader for phonetic engine
 * Loads word-to-phoneme mappings from open-dict-data IPA dictionary
 */

export interface DictionaryEntry {
	word: string;
	phonemes: string[];
	rawIpa: string;
}

export interface DictionaryStats {
	totalEntries: number;
	uniqueWords: number;
	averagePhonemesPerWord: number;
	loadTime: number;
	sourceUrl: string;
}

export class DictionaryLoader {
	private dictionaryUrl =
		"https://raw.githubusercontent.com/open-dict-data/ipa-dict/refs/heads/master/data/en_US.txt";
	private entries = new Map<string, DictionaryEntry>();
	private stats: DictionaryStats | null = null;

	/**
	 * Load the IPA dictionary from the remote source
	 */
	async loadDictionary(): Promise<void> {
		const startTime = Date.now();

		try {
			const response = await fetch(this.dictionaryUrl);

			if (!response.ok) {
				throw new Error(`Failed to fetch dictionary: ${response.status} ${response.statusText}`);
			}

			const text = await response.text();
			this.parseDictionary(text);

			this.stats = {
				totalEntries: this.entries.size,
				uniqueWords: this.entries.size,
				averagePhonemesPerWord: this.calculateAveragePhonemes(),
				loadTime: Date.now() - startTime,
				sourceUrl: this.dictionaryUrl,
			};

			console.log(
				`Dictionary loaded: ${this.stats.totalEntries} entries in ${this.stats.loadTime}ms`,
			);
		} catch (error) {
			console.error("Failed to load dictionary:", error);
			throw new Error(
				`Dictionary loading failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Parse the dictionary text format: "word<TAB>/phonemes/"
	 */
	private parseDictionary(text: string): void {
		const lines = text.split("\n");

		for (const line of lines) {
			if (!line.trim()) continue;

			const tabIndex = line.indexOf("\t");
			if (tabIndex === -1) continue;

			const word = line.slice(0, tabIndex).trim();
			const ipaPart = line.slice(tabIndex + 1).trim();

			// Extract phonemes from /phonemes/ format
			const phonemeMatch = ipaPart.match(/^\/(.+)\/$/);
			if (!phonemeMatch || !phonemeMatch[1]) continue;

			const rawIpa = phonemeMatch[1];

			// Split into individual phonemes and clean up
			const phonemes = this.parseIpaString(rawIpa);

			this.entries.set(word.toLowerCase(), {
				word: word.toLowerCase(),
				phonemes,
				rawIpa,
			});
		}
	}

	/**
	 * Parse IPA string into individual phoneme symbols
	 * Handles stress markers and complex phoneme combinations
	 */
	private parseIpaString(ipaString: string): string[] {
		// Remove stress markers for phoneme splitting, but we'll keep them in the raw form
		const withoutStress = ipaString.replace(/[ˈˌ]/g, "");

		// Split on IPA phoneme boundaries - this is a simplified approach
		// A more sophisticated parser would handle diphthongs and affricates
		const phonemes: string[] = [];
		let _current = ""; // Prefix with _ to indicate intentionally unused

		for (let i = 0; i < withoutStress.length; i++) {
			const char = withoutStress[i];
			if (!char) continue; // Skip if somehow undefined

			// IPA characters that can be standalone or part of larger phonemes
			if (char === "t" && i + 1 < withoutStress.length && withoutStress[i + 1] === "ʃ") {
				// Handle affricates like tʃ
				phonemes.push("tʃ");
				i++; // Skip next character
			} else if (char === "d" && i + 1 < withoutStress.length && withoutStress[i + 1] === "ʒ") {
				phonemes.push("dʒ");
				i++;
			} else if (char === "a" && i + 1 < withoutStress.length && withoutStress[i + 1] === "ɪ") {
				// Handle diphthongs
				phonemes.push("aɪ");
				i++;
			} else if (char === "a" && i + 1 < withoutStress.length && withoutStress[i + 1] === "ʊ") {
				phonemes.push("aʊ");
				i++;
			} else if (char === "ɔ" && i + 1 < withoutStress.length && withoutStress[i + 1] === "ɪ") {
				phonemes.push("ɔɪ");
				i++;
			} else if (this.isIpaVowel(char) || this.isIpaConsonant(char)) {
				// Standalone phoneme
				phonemes.push(char);
			} else {
				// For diacritics and other characters - currently unused but kept for future enhancement
				_current += char;
			}
		}

		return phonemes;
	}

	/**
	 * Check if character is an IPA vowel
	 */
	private isIpaVowel(char: string): boolean {
		const vowels = "aeiouæɑɔəɜɪʊʌɛɒ";
		return vowels.includes(char);
	}

	/**
	 * Check if character is an IPA consonant
	 */
	private isIpaConsonant(char: string): boolean {
		const consonants = "bdðfghjklmnŋprstθvwyzʃʒʈʂʐʋɹɻɖɟɡɢʔɱɳɴʙʀⱱ";
		return consonants.includes(char);
	}

	/**
	 * Calculate average phonemes per word for stats
	 */
	private calculateAveragePhonemes(): number {
		if (this.entries.size === 0) return 0;

		let totalPhonemes = 0;
		for (const entry of this.entries.values()) {
			totalPhonemes += entry.phonemes.length;
		}

		return Math.round((totalPhonemes / this.entries.size) * 100) / 100;
	}

	/**
	 * Look up a word in the dictionary
	 */
	lookup(word: string): DictionaryEntry | undefined {
		return this.entries.get(word.toLowerCase());
	}

	/**
	 * Check if a word exists in the dictionary
	 */
	hasWord(word: string): boolean {
		return this.entries.has(word.toLowerCase());
	}

	/**
	 * Get dictionary statistics
	 */
	getStats(): DictionaryStats | null {
		return this.stats;
	}

	/**
	 * Get all dictionary entries (for debugging/analysis)
	 */
	getAllEntries(): Map<string, DictionaryEntry> {
		return new Map(this.entries);
	}

	/**
	 * Get word count
	 */
	getWordCount(): number {
		return this.entries.size;
	}
}
