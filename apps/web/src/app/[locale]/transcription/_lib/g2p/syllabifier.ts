import {
	type CmuStressLevel,
	extractBasePhonemeId,
	getIpaForPhonemeId,
	getPhonemeCategory,
	isValidPhonemeToken,
} from "@phonaria/phonetics-data";
import type { G2PPhoneme, G2PSyllable } from "./model";
import { isValidOnset } from "./phonotactics";

interface InternalPhoneme {
	cmuToken: string;
	isVowel: boolean;
	stress: CmuStressLevel;
	originalIndex: number;
}

export function syllabify(cmuTokens: string[]): G2PSyllable[] {
	if (cmuTokens.length === 0) return [];

	// 1. Map to internal representation (filter invalid tokens first)
	const phonemes: InternalPhoneme[] = cmuTokens
		.filter((token) => isValidPhonemeToken(token))
		.map((token, index) => {
			const symbolId = extractBasePhonemeId(token);
			const isVowel = getPhonemeCategory(symbolId) === "vowel";

			// Extract stress from token (e.g., "AX0", "AU1", "O2")
			let stress: CmuStressLevel = "none";
			if (isVowel) {
				if (token.endsWith("1")) stress = "primary";
				else if (token.endsWith("2")) stress = "secondary";
			}

			return {
				cmuToken: token,
				isVowel,
				stress,
				originalIndex: index,
			};
		});

	// 2. Identify Nuclei
	const nucleiIndices = phonemes.map((p, i) => (p.isVowel ? i : -1)).filter((i) => i !== -1);

	// Handle case with no vowels (e.g., "hmm", "psst" or abbreviations)
	if (nucleiIndices.length === 0) {
		return [
			{
				phonemes: mapToG2PPhonemes(phonemes),
				stress: "none",
			},
		];
	}

	const syllables: G2PSyllable[] = [];
	let currentStart = 0;

	// 3. Iterate through Nuclei to form syllables
	for (let i = 0; i < nucleiIndices.length; i++) {
		const nucleusIndex = nucleiIndices[i];
		const currentNucleus = phonemes[nucleusIndex];

		let syllableEndIndex: number; // Exclusive

		if (i === nucleiIndices.length - 1) {
			// Last syllable: takes everything until the end
			syllableEndIndex = phonemes.length;
		} else {
			const nextNucleusIdx = nucleiIndices[i + 1];
			const intervocalicStart = nucleusIndex + 1;
			const intervocalicEnd = nextNucleusIdx; // Exclusive
			const intervocalicConsonants = phonemes.slice(intervocalicStart, intervocalicEnd);

			const bestSplitIndex = findMaximalOnsetSplit(intervocalicConsonants);
			syllableEndIndex = intervocalicStart + bestSplitIndex;
		}

		const syllablePhonemes = phonemes.slice(currentStart, syllableEndIndex);
		syllables.push({
			phonemes: mapToG2PPhonemes(syllablePhonemes),
			stress: currentNucleus.stress,
		});

		currentStart = syllableEndIndex;
	}

	return syllables;
}

/**
 * Finds the split point in a sequence of intervocalic consonants that maximizes
 * the onset of the following syllable, according to the Maximum Onset Principle.
 *
 * @param consonants - The sequence of consonants between two nuclei.
 * @returns The index relative to the start of `consonants` where the split should occur.
 *          Everything before this index belongs to the previous syllable's coda.
 *          Everything at and after this index belongs to the next syllable's onset.
 */
function findMaximalOnsetSplit(consonants: InternalPhoneme[]): number {
	// Default: all consonants go to the coda of the preceding syllable (split at end)
	// unless we find a valid onset suffix.
	// However, typically single consonants are always valid onsets.
	// We scan from left to right for the longest valid suffix?
	// MOP says: maximize onset. So we want the longest suffix that is a valid onset.

	// Check suffixes from longest (start at 0) to shortest (start at length-1).
	for (let j = 0; j <= consonants.length; j++) {
		const candidateOnset = consonants.slice(j);
		const candidateTokens = candidateOnset.map((p) => p.cmuToken);

		if (isValidOnset(candidateTokens)) {
			return j;
		}
	}

	// Fallback: if no valid onset found, everything goes to coda.
	return consonants.length;
}

function mapToG2PPhonemes(internalPhonemes: InternalPhoneme[]): G2PPhoneme[] {
	return internalPhonemes.map((p) => {
		const symbolId = extractBasePhonemeId(p.cmuToken);
		const ipa = getIpaForPhonemeId(symbolId);
		return {
			ipa,
			phonemeId: symbolId,
			cmuToken: p.cmuToken,
		};
	});
}
