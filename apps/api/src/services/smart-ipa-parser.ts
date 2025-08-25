/**
 * Smart IPA Phoneme Parser
 * Properly segments IPA strings using phoneme inventory from shared-data
 */

import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { consonants, vowels } from "shared-data";

export class SmartIPAParser {
	private allPhonemes: Set<string>;
	private sortedPhonemes: string[]; // Sorted by length (longest first) for matching

	constructor() {
		// Build complete phoneme lookup from shared-data
		const phonemeSymbols = [
			...consonants.map((p: ConsonantPhoneme) => p.symbol),
			...vowels.map((p: VowelPhoneme) => p.symbol),
		];

		this.allPhonemes = new Set(phonemeSymbols);

		// Sort by length descending for longest-match algorithm
		this.sortedPhonemes = Array.from(phonemeSymbols).sort((a, b) => b.length - a.length);

		console.log(
			`Smart IPA Parser initialized with ${this.allPhonemes.size} phonemes:`,
			Array.from(this.allPhonemes).filter((p) => p.length > 1),
		);
	}

	/**
	 * Parse IPA string into proper phoneme array using longest-match algorithm
	 */
	parseIPA(ipaString: string): string[] {
		if (!ipaString) return [];

		// Remove common IPA notation that we want to ignore for now
		const cleaned = this.cleanIPAString(ipaString);

		const phonemes: string[] = [];
		let position = 0;

		while (position < cleaned.length) {
			let matched = false;

			// Try longest matches first (handles multi-character phonemes)
			for (const phoneme of this.sortedPhonemes) {
				if (cleaned.startsWith(phoneme, position)) {
					phonemes.push(phoneme);
					position += phoneme.length;
					matched = true;
					break;
				}
			}

			if (!matched) {
				// Handle unknown character
				const char = cleaned[position];
				if (char.trim()) {
					console.warn(`Unknown IPA character: '${char}' in "${ipaString}"`);
					phonemes.push(char); // Include unknown characters for debugging
				}
				position++;
			}
		}

		return phonemes;
	}

	/**
	 * Clean IPA string by removing/handling notation we don't need for phoneme extraction
	 */
	private cleanIPAString(ipaString: string): string {
		return (
			ipaString
				// Remove primary stress markers (ˈ) and secondary stress (ˌ)
				.replace(/[ˈˌ]/g, "")
				// Remove syllable boundaries (.)
				.replace(/\./g, "")
				// Remove morpheme boundaries (-)
				.replace(/-/g, "")
				// Keep everything else for now
				.trim()
		);
	}

	/**
	 * Validate that all characters in IPA string are known phonemes
	 */
	validateIPA(ipaString: string): { valid: boolean; unknownChars: string[] } {
		const phonemes = this.parseIPA(ipaString);
		const unknownChars: string[] = [];

		for (const phoneme of phonemes) {
			if (!this.allPhonemes.has(phoneme)) {
				unknownChars.push(phoneme);
			}
		}

		return {
			valid: unknownChars.length === 0,
			unknownChars: Array.from(new Set(unknownChars)), // Remove duplicates
		};
	}

	/**
	 * Get statistics about the phoneme inventory
	 */
	getStats(): {
		totalPhonemes: number;
		multiChar: string[];
		singleChar: number;
	} {
		const multiChar = Array.from(this.allPhonemes).filter((p) => p.length > 1);
		const singleChar = this.allPhonemes.size - multiChar.length;

		return {
			totalPhonemes: this.allPhonemes.size,
			multiChar,
			singleChar,
		};
	}
}

// Export singleton instance
export const smartIPAParser = new SmartIPAParser();
