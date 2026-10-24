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
import { collectCuratedWords, pickPronunciation, type PronunciationChoice } from "./curated-words";
import { spellingPronunciations } from "./reviewed-pronunciations";
import { probeReasons } from "./top-10k-probes";

export const wordSources = [
	"catalog",
	"spelling",
	"practice",
	"top-1k",
	"top-10k",
	"top-10k-probes",
] as const;
export type WordSource = (typeof wordSources)[number];

/** Curated words go through the rules for syllables and pronunciation, and get their forms. */
export const isCuratedTier = (source: WordSource) =>
	source === "top-1k" || source === "top-10k" || source === "top-10k-probes";

export type WordWithPhonemic = {
	word: string;
	variant: string;
	phonemic: string;
	cmuArpa: string;
	/** Set only for curated-tier words. */
	pronunciationChoice?: PronunciationChoice;
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

/** `saved` words, already in a saved plan, stay in a curated tier that now excludes them. */
export function collectWordsWithPhonemic(
	source: WordSource = "catalog",
	saved?: ReadonlySet<string>,
): WordWithPhonemic[] {
	if (source === "top-10k-probes") {
		const byWord = new Map(
			collectWordsWithPhonemic("top-10k", saved).map((entry) => [entry.word, entry]),
		);
		return [...probeReasons().keys()].map((word) => {
			const entry = byWord.get(word);
			if (!entry) throw new Error(`Probe word "${word}" isn't an unrecorded top-10k word`);
			return entry;
		});
	}
	if (source === "top-1k" || source === "top-10k") {
		return collectCuratedWords(source, { saved }).words.map(({ word, variants }) => {
			const { variant, choice } = pickPronunciation(word, variants);
			return { ...getWordPronunciation(word, [variant]), pronunciationChoice: choice };
		});
	}
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
