import curatedTop1kJson from "../data/curated/top-1k.json";
import curatedTop10kJson from "../data/curated/top-10k.json";
import cmudictJson from "../data/dict/cmudict.json";
import cmudictStatsJson from "../data/dict/cmudict-stats.json";
import type { CmudictPayload, CmudictStatsPayload } from "./dict/types";

export const cmudictData = cmudictJson as CmudictPayload;
export const cmudictStatsData = cmudictStatsJson as CmudictStatsPayload;

/**
 * Curated word data structure for tiered client-side lookup.
 */
export interface CuratedWordData {
	meta: {
		version: string;
		tier: string;
		wordCount: number;
		generatedAt: string;
		license: string;
		attribution: string;
		sources: { wordfreq: string; cmudict: string };
	};
	words: Record<string, string>;
}

/**
 * Top 1,000 most frequent English words with CMU pronunciations.
 * Covers ~80% of everyday usage. Bundled inline (~22KB).
 */
export const curatedTop1k = curatedTop1kJson as CuratedWordData;

/**
 * Top 10,000 most frequent English words with CMU pronunciations.
 * Covers ~95% of learner vocabulary. Lazy-loaded (~273KB).
 */
export const curatedTop10k = curatedTop10kJson as CuratedWordData;

export type { CmudictPayload, CmudictStatsPayload, PhonemeTrieNode } from "./dict/types";
export {
	CmuArpaRegistry,
	type CmuArpaToken,
	type CmuStressLevel,
	cmuVariantToIpa,
	getArpabetForPhonemeId,
	getCmuArpaForPhonemeId,
	getPhonemeIdForCmuArpa,
	isCmuArpaToken,
	PhonemeArpabetLabel,
} from "./phonetics/cmu-arpa-registry";
export type {
	ConsonantArticulatoryFeatures,
	ConsonantPhonemeArticulatoryFeatureKey,
	ConsonantSymbolId,
	ConsonantSymbolIpa,
	DiphthongSymbolIpa,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	PhonemeCategory,
	PhonemeSymbolId,
	PhonemeSymbolIpa,
	VowelArticulatoryFeatures,
	VowelPhonemeArticulatoryFeatureKey,
	VowelSymbolIpa,
} from "./phonetics/ipa-registry";
export {
	ConsonantIpaRegistry,
	DiphthongIpaRegistry,
	getIpaForPhonemeId,
	getPhonemeCategory,
	getPhonemeType,
	MonophthongIpaRegistry,
	PhonemeCount,
	PhonemeIpaRegistry,
	VowelIpaRegistry,
} from "./phonetics/ipa-registry";
export {
	type AllophoneExample,
	type PhonemeAllophone,
	type PhonemeAllophoneContextKey,
	PhonemeAllophoneRegistry,
} from "./phonetics/phoneme-allophones";
export {
	ConsonantArticulationRegistry,
	DiphthongVowelArticulationRegistry,
	FeatureValueByPhonemeRegistry,
	MonophthongVowelArticulationRegistry,
	type PhonemeArticulation,
	PhonemeArticulationRegistry,
	type VowelType,
} from "./phonetics/phoneme-articulations";
export {
	ContrastsByPhonemeIdRegistry,
	type PhonemeContrast,
	type PhonemeContrastPair,
} from "./phonetics/phoneme-contrasts";
export {
	PhonemeSpellingPatternRegistry,
	type SpellingPattern,
} from "./phonetics/phoneme-patterns";
