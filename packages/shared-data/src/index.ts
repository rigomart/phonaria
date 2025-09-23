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
export * from "./types";
export * as phonixUtils from "./utils/index";
export type { VowelFrontnessInfo, VowelHeightInfo } from "./vowel-axis";
export { vowels } from "./vowels";
export { ARPABET_TO_IPA, convertArpabetToIPA } from "./phonetics/arpabet-to-ipa";
export { normalizeCmuWord } from "./phonetics/cmudict";
