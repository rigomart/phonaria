export {
	articulationRegistry,
	consonantArticulationRegistry,
	vowelArticulationRegistry,
} from "./articulation";
export {
	type CategoryConfig,
	type CategoryInfo,
	getCategoryInfo,
	getOrderedCategories,
	PHONEME_CATEGORIES,
} from "./category-config";
export { consonants } from "./consonants";
export { FEATURED_MINIMAL_PAIR_SET_ID, minimalPairSets } from "./minimal-pairs";
export { ARPABET_TO_IPA, convertArpabetToIPA } from "./phonetics/arpabet-to-ipa";
export { normalizeCmuWord } from "./phonetics/cmudict";
export * from "./types";
export {
	type DiphthongEndPosition,
	type DiphthongTrajectory,
	getDiphthongEndPosition,
	getDiphthongTrajectories,
} from "./utils/diphthong";
export * as phonixUtils from "./utils/index";
export type { VowelFrontnessInfo, VowelHeightInfo } from "./vowel-axis";
export { vowels } from "./vowels";
