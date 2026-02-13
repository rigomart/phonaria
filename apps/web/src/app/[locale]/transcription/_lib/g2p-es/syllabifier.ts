import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { isValidOnset } from "./phonotactics";
import type { SpanishPhoneme, SpanishSyllable } from "./types";

const SPANISH_VOWEL_IDS: ReadonlySet<PhonemeSymbolId> = new Set(["I", "EE", "AA", "OO", "U"]);
const HIGH_VOWEL_IDS: ReadonlySet<PhonemeSymbolId> = new Set(["I", "U"]);

function isVowel(p: SpanishPhoneme): boolean {
	return SPANISH_VOWEL_IDS.has(p.phonemeId);
}

function isHighVowel(p: SpanishPhoneme): boolean {
	return HIGH_VOWEL_IDS.has(p.phonemeId);
}

/**
 * Syllabify a sequence of Spanish phonemes.
 *
 * Algorithm:
 * 1. Identify nuclei (vowel phonemes)
 * 2. Handle diphthongs: adjacent high vowel + non-high vowel form one nucleus,
 *    UNLESS the high vowel carried an accent mark (hiatus = separate syllables)
 * 3. Split consonants between nuclei using Maximum Onset Principle with valid Spanish onsets
 * 4. Return syllables with stress "none" (stress assigned later)
 */
export function syllabifySpanish(
	phonemes: SpanishPhoneme[],
	accentedVowelIndex: number | null,
): SpanishSyllable[] {
	if (phonemes.length === 0) return [];

	// Step 1: Group phonemes into vowel nuclei and consonant clusters
	// Build an array of nucleus positions (indices into phonemes array)
	const nuclei: { start: number; end: number }[] = [];
	let i = 0;

	while (i < phonemes.length) {
		if (isVowel(phonemes[i])) {
			const nucleusStart = i;
			let nucleusEnd = i;

			// Check for diphthongs/triphthongs
			while (nucleusEnd + 1 < phonemes.length && isVowel(phonemes[nucleusEnd + 1])) {
				const current = phonemes[nucleusEnd];
				const next = phonemes[nucleusEnd + 1];

				// Two adjacent vowels form a diphthong if at least one is high
				// UNLESS the high vowel carries the accent (hiatus)
				const currentIsHigh = isHighVowel(current);
				const nextIsHigh = isHighVowel(next);

				if (!currentIsHigh && !nextIsHigh) {
					// Two non-high vowels: always hiatus
					break;
				}

				// Check if the high vowel carries the accent -> hiatus
				if (currentIsHigh && accentedVowelIndex === nucleusEnd) {
					break;
				}
				if (nextIsHigh && accentedVowelIndex === nucleusEnd + 1) {
					break;
				}

				nucleusEnd++;
			}

			nuclei.push({ start: nucleusStart, end: nucleusEnd });
			i = nucleusEnd + 1;
		} else {
			i++;
		}
	}

	if (nuclei.length === 0) {
		// No vowels (rare): return single syllable with all phonemes
		return [{ phonemes: [...phonemes], stress: "none" }];
	}

	// Step 2: Build syllables by distributing consonants
	const syllables: SpanishSyllable[] = [];

	for (let n = 0; n < nuclei.length; n++) {
		const nucleus = nuclei[n];
		const prevNucleus = n > 0 ? nuclei[n - 1] : null;
		const nextNucleus = n < nuclei.length - 1 ? nuclei[n + 1] : null;

		const syllablePhonemes: SpanishPhoneme[] = [];

		// Add onset consonants (consonants between previous nucleus and this nucleus)
		if (n === 0) {
			// First syllable: all leading consonants
			for (let j = 0; j < nucleus.start; j++) {
				syllablePhonemes.push(phonemes[j]);
			}
		} else if (prevNucleus) {
			// Consonants between previous nucleus end and this nucleus start
			const consonantStart = prevNucleus.end + 1;
			const consonantEnd = nucleus.start;
			const consonants = phonemes.slice(consonantStart, consonantEnd);

			// Maximum Onset Principle: give as many consonants as possible to the onset
			// of this syllable, constrained by valid Spanish onsets
			const onsetStart = findOnsetSplit(consonants);
			for (let j = onsetStart; j < consonants.length; j++) {
				syllablePhonemes.push(consonants[j]);
			}
		}

		// Add nucleus vowels
		for (let j = nucleus.start; j <= nucleus.end; j++) {
			syllablePhonemes.push(phonemes[j]);
		}

		// Add coda consonants (only for the last syllable)
		if (!nextNucleus) {
			for (let j = nucleus.end + 1; j < phonemes.length; j++) {
				syllablePhonemes.push(phonemes[j]);
			}
		} else {
			// Coda consonants for non-last syllables: consonants assigned to coda
			// are handled by the next syllable's onset calculation
			const consonantStart = nucleus.end + 1;
			const consonantEnd = nextNucleus.start;
			const consonants = phonemes.slice(consonantStart, consonantEnd);
			const onsetSplit = findOnsetSplit(consonants);

			// Everything before the onset split belongs to this syllable's coda
			for (let j = 0; j < onsetSplit; j++) {
				syllablePhonemes.push(consonants[j]);
			}
		}

		syllables.push({ phonemes: syllablePhonemes, stress: "none" });
	}

	return syllables;
}

/**
 * Find the split point in a consonant cluster for Maximum Onset Principle.
 * Returns the index where the onset of the next syllable begins.
 */
function findOnsetSplit(consonants: SpanishPhoneme[]): number {
	if (consonants.length === 0) return 0;
	if (consonants.length === 1) return 0; // Single consonant -> onset of next syllable

	// Try to give as many consonants as possible to the onset
	// Check from the full cluster down to a single consonant
	for (let onsetStart = 0; onsetStart < consonants.length; onsetStart++) {
		const onsetIds = consonants.slice(onsetStart).map((c) => c.phonemeId);
		if (isValidOnset(onsetIds)) {
			return onsetStart;
		}
	}

	// Fallback: only last consonant goes to onset
	return consonants.length - 1;
}
