import {
	EnglishPhonemeContrasts,
	EnglishPhonemeSpellingPatterns,
	phonemeVariantToCmuArpa,
	phonemeVariantToIpa,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { spellingPronunciations } from "./reviewed-pronunciations";

export type WordSource = "catalog" | "spelling";

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

/** Spelling uses reviewed choices; catalog uses the curated dictionary. */
export function collectWordsWithPhonemic(source: WordSource = "catalog"): WordWithPhonemic[] {
	const words = new Set(
		source === "spelling"
			? Object.values(EnglishPhonemeSpellingPatterns).flatMap(({ examples }) =>
					examples.map(({ spelled }) => spelled.replace(/[[\]]/g, "")),
				)
			: EnglishPhonemeContrasts.flatMap(({ minimalPairs }) =>
					minimalPairs.flatMap(({ words }) => words),
				),
	);
	return [...words].sort().map((word) => {
		const reviewed = source === "spelling" ? spellingPronunciations[word] : undefined;
		return getWordPronunciation(
			word,
			reviewed ? [reviewed.variant] : EnglishCuratedTop10k.words[word],
		);
	});
}
