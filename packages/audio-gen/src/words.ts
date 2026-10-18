import {
	EnglishPhonemeContrasts,
	EnglishPhonemeSpellingPatterns,
	phonemeVariantToCmuArpa,
	phonemeVariantToIpa,
} from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import {
	EnglishPracticeSchwa,
	validatePracticeEntries,
} from "@phonaria/phonetics-data/languages/en/practice-schwa";
import { spellingPronunciations } from "./reviewed-pronunciations";

export type WordSource = "catalog" | "spelling" | "practice";

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

export function collectWordsWithPhonemic(source: WordSource = "catalog"): WordWithPhonemic[] {
	if (source === "practice") {
		validatePracticeEntries(EnglishPracticeSchwa, EnglishCuratedTop10k.words);
		const catalog = new Map(collectWordsWithPhonemic().map((entry) => [entry.word, entry]));
		return EnglishPracticeSchwa.flatMap(({ word, variant }) => {
			const existing = catalog.get(word);
			if (existing && existing.variant !== variant)
				throw new Error(`Practice/catalog pronunciation conflict for "${word}"`);
			return existing ? [] : [getWordPronunciation(word, [variant])];
		}).sort((a, b) => a.word.localeCompare(b.word));
	}
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
