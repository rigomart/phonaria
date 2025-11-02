export { ARPABET_TO_IPA, convertArpabetToIPA } from "./arpabet-to-ipa";
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
export { normalizeCmuWord } from "./cmudict";
export { consonants } from "./consonants";
export {
	type Allophone,
	type AllophoneContext,
	getAllophones,
	phonemeAllophones,
} from "./phonetics/phoneme-allophones";
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
export {
	convertCmuArpaToPhonemeId,
	convertCmuArpaToStandardArpa,
} from "./phonetics/symbols/cmu-mapper";
export {
	allPhonemeSymbols,
	consonantPhonemeSymbols,
	diphthongPhonemeSymbols,
	monophthongPhonemeSymbols,
	phonemeSymbolById,
	rhoticPhonemeSymbols,
	vowelPhonemeSymbols,
} from "./phonetics/symbols/registry";
export * from "./types";
export * as phonariaUtils from "./utils/index";
export { vowels } from "./vowels";
