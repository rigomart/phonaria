import {
	EnglishPhonemeContrasts,
	phonemeVariantToCmuArpa,
	phonemeVariantToIpa,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";

export type WordWithPhonemic = {
	word: string;
	variant: string;
	phonemic: string;
	cmuArpa: string;
};

export function getWordPronunciation(
	word: string,
	variants: readonly string[] | undefined,
): WordWithPhonemic {
	if (!variants?.length) throw new Error(`No pronunciation for "${word}"`);
	const pronunciations = new Set(variants.map(phonemeVariantToCmuArpa));
	if (pronunciations.size !== 1) {
		throw new Error(`Ambiguous pronunciation or stress for "${word}": ${variants.join(" | ")}`);
	}
	return {
		word,
		variant: variants[0],
		phonemic: phonemeVariantToIpa(variants[0]),
		cmuArpa: [...pronunciations][0],
	};
}

/** Read the catalog and its validated dictionary directly, avoiding stale local mappings. */
export function collectWordsWithPhonemic(): WordWithPhonemic[] {
	const words = new Set(
		EnglishPhonemeContrasts.flatMap(({ minimalPairs }) =>
			minimalPairs.flatMap(({ words }) => words),
		),
	);
	return [...words]
		.sort()
		.map((word) => getWordPronunciation(word, EnglishCuratedTop10k.words[word]));
}
