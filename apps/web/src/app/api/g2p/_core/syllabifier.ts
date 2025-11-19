import { getSymbolIdForCmuToken, PhonemeSymbolRegistry } from "shared-data";
import type { G2PPhoneme } from "../_schemas/g2p-api.schema";
import { isValidOnset } from "./phonotactics";

export type SyllableStress = "primary" | "secondary" | "none";

export interface Syllable {
	phonemes: G2PPhoneme[];
	stress: SyllableStress;
}

interface InternalPhoneme {
	cmuToken: string;
	isVowel: boolean;
	stress: SyllableStress;
	originalIndex: number;
}

export function syllabify(cmuTokens: string[]): Syllable[] {
	if (cmuTokens.length === 0) return [];

	// 1. Map to internal representation
	const phonemes: InternalPhoneme[] = cmuTokens.map((token, index) => {
		const symbolId = getSymbolIdForCmuToken(token);
		const symbol = symbolId ? PhonemeSymbolRegistry[symbolId] : undefined;
		const isVowel = symbol?.category.startsWith("vowel") ?? false;

		// Extract stress from CMU token (e.g., "AH0", "AH1", "AH2")
		let stress: SyllableStress = "none";
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
	// Treat the whole thing as one syllable with no stress
	if (nucleiIndices.length === 0) {
		return [
			{
				phonemes: mapToG2PPhonemes(phonemes),
				stress: "none",
			},
		];
	}

	const syllables: Syllable[] = [];
	let currentStart = 0;

	// 3. Iterate through Nuclei to form syllables
	for (let i = 0; i < nucleiIndices.length; i++) {
		const nucleusIndex = nucleiIndices[i];

		// Determine Onset for the CURRENT syllable
		// The region to search for onset is between the previous syllable's end (currentStart) and the nucleus
		// But wait, MOP works by maximizing onset from the consonants PRECEDING the nucleus.
		// The consonants between previous nucleus and current nucleus need to be split between coda of prev and onset of current.

		// If this is the first syllable, everything from 0 to nucleus is the onset (and nucleus itself)
		if (i === 0) {
			// No previous syllable to steal coda from.
			// Just take everything from 0 to nucleus.
			// But we need to define the boundary for the NEXT syllable.
			// Actually, let's define the boundary between current nucleus and NEXT nucleus.
		}

		// Let's refine the loop structure.
		// We determine the boundary between Nucleus[i] and Nucleus[i+1].
		// The consonants between them are `intervocalicConsonants`.
		// We scan `intervocalicConsonants` from right to left to find the longest valid onset for Nucleus[i+1].
		// The rest belong to Nucleus[i] as coda.

		const currentNucleus = phonemes[nucleusIndex];
		const syllableStress = currentNucleus.stress;

		let syllableEndIndex: number; // Exclusive

		if (i === nucleiIndices.length - 1) {
			// Last syllable: takes everything until the end
			syllableEndIndex = phonemes.length;
		} else {
			const nextNucleusIdx = nucleiIndices[i + 1];
			const intervocalicStart = nucleusIndex + 1;
			const intervocalicEnd = nextNucleusIdx; // Exclusive
			const intervocalicConsonants = phonemes.slice(intervocalicStart, intervocalicEnd);

			// Maximize Onset for the NEXT syllable
			// Actually, we want to find the split point such that suffix is valid onset.
			// Scan from left (start of consonants) to right? No, MOP says maximize onset.
			// So we want the longest suffix of intervocalicConsonants that is a valid onset.

			let bestSplitIndex = intervocalicConsonants.length; // Default: all to coda of current (if none valid)
			// But single consonants are always valid onsets usually.
			// Let's try all suffixes.
			// "V C C V" -> consonants "C C". Suffixes: "C C", "C", "".
			// Check "C C": valid? yes -> split at 0.
			// Check "C": valid? yes.
			// We want the LONGEST valid onset. So we check longest first.

			for (let j = 0; j <= intervocalicConsonants.length; j++) {
				const candidateOnset = intervocalicConsonants.slice(j);
				const candidateTokens = candidateOnset.map((p) => p.cmuToken);
				// If empty, it's valid (zero onset), but we prefer non-empty if possible?
				// No, if empty, it means all consonants went to coda.
				// If we have "V C V", consonants "C". Suffix "C" valid? Yes. Split at 0. Onset is "C".
				// If we have "V C C V", consonants "C1 C2".
				// Try "C1 C2". Valid? If yes, split at 0.
				// If no, try "C2". Valid? If yes, split at 1. Coda gets C1.
				// If no, split at 2. Coda gets C1 C2.

				if (isValidOnset(candidateTokens)) {
					bestSplitIndex = j;
					break; // Found the longest because we started from j=0 (longest suffix)
				}
			}

			// If no valid onset found (unlikely for English unless weird cluster),
			// usually the single consonant before vowel is always valid.
			// If we fall through, bestSplitIndex is length (empty onset).

			syllableEndIndex = intervocalicStart + bestSplitIndex;
		}

		const syllablePhonemes = phonemes.slice(currentStart, syllableEndIndex);
		syllables.push({
			phonemes: mapToG2PPhonemes(syllablePhonemes),
			stress: syllableStress,
		});

		currentStart = syllableEndIndex;
	}

	return syllables;
}

function mapToG2PPhonemes(internalPhonemes: InternalPhoneme[]): G2PPhoneme[] {
	return internalPhonemes.map((p) => {
		const symbolId = getSymbolIdForCmuToken(p.cmuToken);
		if (symbolId) {
			const symbol = PhonemeSymbolRegistry[symbolId];
			return {
				ipa: symbol.ipa,
				phonemeId: symbolId,
				cmuToken: p.cmuToken,
			};
		}
		return {
			phonemeId: null,
			cmuToken: p.cmuToken,
		};
	});
}
