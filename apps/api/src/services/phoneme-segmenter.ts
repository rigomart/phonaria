/**
 * Phoneme Segmentation Service
 * Accurately segments IPA strings into individual phonemes using linguistic rules
 */

import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { consonants, vowels } from "shared-data";

export class PhonemeSegmenter {
	private phonemeInventory: Set<string>;
	private sortedPhonemes: string[];
	private affricates: Set<string>;
	private diphthongs: Set<string>;

	constructor() {
		// Build comprehensive phoneme inventory from shared-data
		const allPhonemes: string[] = [];

		// Add consonants
		consonants.forEach((consonant: ConsonantPhoneme) => {
			allPhonemes.push(consonant.symbol);
		});

		// Add vowels
		vowels.forEach((vowel: VowelPhoneme) => {
			allPhonemes.push(vowel.symbol);
			// Also add allophone variants if they exist
			if (vowel.allophones) {
				vowel.allophones.forEach((allophone) => {
					allPhonemes.push(allophone.variant);
				});
			}
		});

		// Add stress markers and other IPA symbols
		allPhonemes.push("ˈ"); // Primary stress
		allPhonemes.push("ˌ"); // Secondary stress
		allPhonemes.push("ː"); // Length marker
		allPhonemes.push("."); // Syllable boundary
		allPhonemes.push("ˑ"); // Half-long

		// Additional r-colored vowels and variants
		allPhonemes.push("ɚ"); // Unstressed r-colored schwa
		allPhonemes.push("ɝ"); // R-colored vowel
		allPhonemes.push("ɹ"); // American r
		allPhonemes.push("ɫ"); // Dark l

		// Create inventory and sorted list
		this.phonemeInventory = new Set(allPhonemes);
		// Sort by length (longest first) for greedy matching
		this.sortedPhonemes = Array.from(this.phonemeInventory).sort((a, b) => b.length - a.length);

		// Identify affricates and diphthongs for special handling
		this.affricates = new Set(["tʃ", "dʒ"]);
		this.diphthongs = new Set(["eɪ", "aɪ", "ɔɪ", "aʊ", "oʊ"]);
	}

	/**
	 * Segment an IPA string into individual phonemes
	 * Uses linguistic rules to avoid false positives
	 */
	segment(ipaString: string): string[] {
		if (!ipaString) return [];

		const phonemes: string[] = [];
		let position = 0;

		while (position < ipaString.length) {
			let matched = false;

			// Check for stress markers at morpheme boundaries
			// If we see a stress marker after 't' and before 'ʃ', they're separate
			if (position > 0 && position < ipaString.length - 1) {
				const prevChar = ipaString[position - 1];
				const currChar = ipaString[position];
				const nextChar = ipaString[position + 1];

				// Skip combining t+ʃ or d+ʒ if there's a stress marker between them
				if (
					(prevChar === "t" && nextChar === "ʃ" && (currChar === "ˈ" || currChar === "ˌ")) ||
					(prevChar === "d" && nextChar === "ʒ" && (currChar === "ˈ" || currChar === "ˌ"))
				) {
					phonemes.push(currChar);
					position++;
					matched = true;
				}
			}

			if (!matched) {
				// Try to match longest phoneme first (greedy matching)
				for (const phoneme of this.sortedPhonemes) {
					if (ipaString.startsWith(phoneme, position)) {
						// Special handling for potential false positives
						if (this.shouldSegmentAsAffricate(ipaString, position, phoneme)) {
							phonemes.push(phoneme);
							position += phoneme.length;
							matched = true;
							break;
						} else if (!this.affricates.has(phoneme)) {
							// Regular phoneme, not an affricate
							phonemes.push(phoneme);
							position += phoneme.length;
							matched = true;
							break;
						}
					}
				}
			}

			// If no phoneme matched, handle as unknown character
			if (!matched) {
				const char = ipaString[position];
				// Only include non-whitespace unknowns
				if (char.trim()) {
					console.warn(`Unknown IPA character: '${char}' in string "${ipaString}"`);
					phonemes.push(char);
				}
				position++;
			}
		}

		return phonemes;
	}

	/**
	 * Determine if a potential affricate should be segmented as one phoneme
	 * Uses linguistic rules to avoid false positives at morpheme boundaries
	 */
	private shouldSegmentAsAffricate(ipaString: string, position: number, phoneme: string): boolean {
		// Only apply special rules to affricates
		if (!this.affricates.has(phoneme)) {
			return true;
		}

		// Check if there's a stress marker immediately before the potential affricate
		// This would indicate a morpheme boundary (like in "nightˈshift")
		if (position > 0 && (ipaString[position - 1] === "ˈ" || ipaString[position - 1] === "ˌ")) {
			// Don't combine if this looks like a boundary
			if (phoneme === "tʃ" && position > 1 && ipaString[position - 2] === "t") {
				return false; // This is likely "t" + stress + "ʃ", not "tʃ"
			}
			if (phoneme === "dʒ" && position > 1 && ipaString[position - 2] === "d") {
				return false; // This is likely "d" + stress + "ʒ", not "dʒ"
			}
		}

		// Check for compound word patterns
		// If we're at position where "t" ends one morpheme and "ʃ" starts another
		if (phoneme === "tʃ") {
			// Look for patterns like "ght" before potential "tʃ"
			if (position >= 3) {
				const preceding = ipaString.substring(position - 3, position);
				// Common endings that might precede a false "tʃ" at boundary
				if (preceding.endsWith("aɪt") || preceding.endsWith("ɪt") || preceding.endsWith("ət")) {
					// Check if there's a stress marker within the potential affricate
					const affricateCandidate = ipaString.substring(position, position + 2);
					if (affricateCandidate.includes("ˈ") || affricateCandidate.includes("ˌ")) {
						return false;
					}
				}
			}
		}

		// Default: treat as a true affricate
		return true;
	}

	/**
	 * Get statistics about the phoneme inventory
	 */
	getStats() {
		return {
			totalPhonemes: this.phonemeInventory.size,
			affricates: Array.from(this.affricates),
			diphthongs: Array.from(this.diphthongs),
		};
	}
}

// Export singleton instance
export const phonemeSegmenter = new PhonemeSegmenter();
