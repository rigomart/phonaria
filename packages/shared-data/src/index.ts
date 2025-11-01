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
export {
	type Allophone,
	type AllophoneContext,
	getAllophones,
	phonemeAllophones,
} from "./phonetics/phoneme-allophones";
export { getAssets, type PhonemeAssetUrls, phonemeAssets } from "./phonetics/phoneme-assets";
export {
	allPhonemesCore,
	consonantPhonemesCore,
	getPhonemeByArpaCore,
	getPhonemeByIdCore,
	getPhonemeByIpaCore,
	type PhonemeCore,
	vowelPhonemesCore,
} from "./phonetics/phoneme-core";
export {
	getSpellingPatterns,
	type PhonemeSpellingPattern,
	phonemeSpellingPatterns,
} from "./phonetics/phoneme-patterns";
export {
	type FullPhoneme,
	getAllFullPhonemes,
	getFullPhoneme,
} from "./phonetics/phoneme-utils";
export {
	allPhonemes,
	type ConsonantPhoneme,
	consonantPhonemes,
	getPhonemeByArpa,
	getPhonemeById,
	getPhonemeByIpa,
	isConsonant,
	isVowel,
	type Phoneme,
	type PhonemeId,
	type PhonemeManner,
	type PhonemePlace,
	type PhonemeVoicing,
	type VowelFrontness,
	type VowelHeight,
	type VowelPhoneme,
	type VowelRoundness,
	type VowelTenseness,
	vowelPhonemes,
} from "./phonetics/phonemes";
export * from "./types";
export * as phonariaUtils from "./utils/index";
export { vowels } from "./vowels";
