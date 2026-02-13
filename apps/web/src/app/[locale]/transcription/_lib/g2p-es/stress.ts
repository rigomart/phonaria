import type { SpanishSyllable } from "./types";

/**
 * Assign stress to Spanish syllables using the tracked accented vowel index.
 *
 * Rules (in priority order):
 * 1. If word has an accent mark -> primary stress on the syllable containing that vowel
 * 2. If word ends in vowel, "n", or "s" -> penultimate syllable stressed
 * 3. Otherwise -> ultimate (last) syllable stressed
 * 4. Single-syllable words get primary stress
 */
export function assignSpanishStressWithAccentIndex(
	syllables: SpanishSyllable[],
	originalWord: string,
	accentedVowelIndex: number | null,
): SpanishSyllable[] {
	if (syllables.length === 0) return syllables;

	if (syllables.length === 1) {
		return [{ ...syllables[0], stress: "primary" }];
	}

	let stressIndex: number;

	if (accentedVowelIndex !== null) {
		stressIndex = findSyllableForPhonemeIndex(syllables, accentedVowelIndex);
	} else {
		const lastChar = originalWord[originalWord.length - 1];
		const endsInVowelNOrS = "aeiou".includes(lastChar) || lastChar === "n" || lastChar === "s";

		if (endsInVowelNOrS) {
			stressIndex = syllables.length - 2; // penultimate
		} else {
			stressIndex = syllables.length - 1; // ultimate
		}
	}

	return syllables.map((syl, idx) => ({
		...syl,
		stress: idx === stressIndex ? "primary" : "none",
	}));
}

/**
 * Map a phoneme index (from the flat phoneme array) to the syllable that contains it.
 */
function findSyllableForPhonemeIndex(syllables: SpanishSyllable[], phonemeIndex: number): number {
	let count = 0;
	for (let s = 0; s < syllables.length; s++) {
		count += syllables[s].phonemes.length;
		if (phonemeIndex < count) {
			return s;
		}
	}
	return syllables.length - 1;
}
