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

	const phonemes: InternalPhoneme[] = cmuTokens
		.filter((token) => isValidPhonemeToken(token))
		.map((token, index) => {
			const symbolId = extractBasePhonemeId(token);
			const isVowel = getPhonemeCategory(symbolId) === "vowel";

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

	const nucleiIndices = phonemes.map((p, i) => (p.isVowel ? i : -1)).filter((i) => i !== -1);

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

	for (let i = 0; i < nucleiIndices.length; i++) {
		const nucleusIndex = nucleiIndices[i];
		const currentNucleus = phonemes[nucleusIndex];

		let syllableEndIndex: number;

		if (i === nucleiIndices.length - 1) {
			syllableEndIndex = phonemes.length;
		} else {
			const nextNucleusIdx = nucleiIndices[i + 1];
			const intervocalicStart = nucleusIndex + 1;
			const intervocalicEnd = nextNucleusIdx;
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

function findMaximalOnsetSplit(consonants: InternalPhoneme[]): number {
	for (let j = 0; j <= consonants.length; j++) {
		const candidateOnset = consonants.slice(j);
		const candidateTokens = candidateOnset.map((p) => p.cmuToken);

		if (isValidOnset(candidateTokens)) {
			return j;
		}
	}

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
