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
	allPhonemeSymbols,
	consonantPhonemeSymbols,
	diphthongPhonemeSymbols,
	monophthongPhonemeSymbols,
	type PhonemeSymbolId,
	phonemeSymbolByArpa,
	phonemeSymbolByCmuArpa,
	phonemeSymbolById,
	rhoticPhonemeSymbols,
	vowelPhonemeSymbols,
} from "./phonetics/symbols-registry";
export * from "./types";
export * as phonariaUtils from "./utils/index";
export { vowels } from "./vowels";
