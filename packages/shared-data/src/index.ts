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
export { ARPABET_TO_IPA, convertArpabetToIPA } from "./phonetics/arpabet-to-ipa";
export { normalizeCmuWord } from "./phonetics/cmudict";
export * from "./types";
export * as phonixUtils from "./utils/index";
export { vowels } from "./vowels";
