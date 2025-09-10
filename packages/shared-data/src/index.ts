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
export * from "./types";
export * as phonixUtils from "./utils/index";
export type { VowelFrontnessInfo, VowelHeightInfo } from "./vowel-axis";
export { vowels } from "./vowels";
