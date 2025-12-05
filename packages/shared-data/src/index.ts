import cmudictJson from "../data/dict/cmudict.json";
import cmudictStatsJson from "../data/dict/cmudict-stats.json";
import type { CmudictPayload, CmudictStatsPayload } from "./dict/types";

export const cmudictData = cmudictJson as CmudictPayload;
export const cmudictStatsData = cmudictStatsJson as CmudictStatsPayload;

export type { CmudictPayload, CmudictStatsPayload } from "./dict/types";
export {
	CmuArpaRegistry,
	type CmuArpaToken,
	getCmuArpaForPhonemeId,
	getPhonemeIdForCmuArpa,
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
