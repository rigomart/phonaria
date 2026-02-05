import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatures,
	VowelArticulatoryFeatures,
} from "./articulatory-features";
import type { PhonemeSymbolId } from "./ipa-registry";
import type { PhonemeCategory } from "./types";

export type VowelType = "monophthong" | "diphthong";

export type DiphthongVowelArticulatoryFeatures = {
	height: VowelArticulatoryFeatures["height"];
	backness: VowelArticulatoryFeatures["backness"];
	roundness: VowelArticulatoryFeatures["roundness"];
	targetHeight: VowelArticulatoryFeatures["height"];
	targetBackness: VowelArticulatoryFeatures["backness"];
	targetRoundness: VowelArticulatoryFeatures["roundness"];
};

type PhonemeArticulationBase<
	Category extends PhonemeCategory,
	Features extends Record<string, string>,
	VowelTypeArg extends VowelType | undefined = undefined,
> = Category extends "vowel"
	? {
			category: Category;
			vowelType: VowelTypeArg extends VowelType ? VowelTypeArg : never;
			features: Features;
		}
	: {
			category: Category;
			features: Features;
		};

export type ConsonantArticulation = PhonemeArticulationBase<
	"consonant",
	ConsonantArticulatoryFeatures
>;

export type MonophthongVowelArticulation = PhonemeArticulationBase<
	"vowel",
	VowelArticulatoryFeatures,
	"monophthong"
>;

export type DiphthongVowelArticulation = PhonemeArticulationBase<
	"vowel",
	DiphthongVowelArticulatoryFeatures,
	"diphthong"
>;

export type PhonemeArticulation =
	| ConsonantArticulation
	| MonophthongVowelArticulation
	| DiphthongVowelArticulation;

export type FeatureValueLookup<TPhonemeId extends PhonemeSymbolId> = {
	[K in PhonemeArticulatoryFeatureKey]: Partial<Record<TPhonemeId, PhonemeArticulatoryFeatures[K]>>;
};

export function buildFeatureValueByPhoneme<TPhonemeId extends PhonemeSymbolId>(
	phonemeArticulationRegistry: Partial<Record<TPhonemeId, PhonemeArticulation>>,
): FeatureValueLookup<TPhonemeId> {
	const lookup: FeatureValueLookup<TPhonemeId> = {
		voicing: {},
		place: {},
		manner: {},
		height: {},
		backness: {},
		roundness: {},
		tenseness: {},
		rhoticity: {},
	};

	const assignFeatureValue = <K extends PhonemeArticulatoryFeatureKey>(
		key: K,
		phonemeId: TPhonemeId,
		value: PhonemeArticulatoryFeatures[K] | undefined,
	) => {
		if (!value) return;
		lookup[key][phonemeId] = value as FeatureValueLookup<TPhonemeId>[K][TPhonemeId];
	};

	for (const [phonemeId, articulation] of Object.entries(phonemeArticulationRegistry) as [
		TPhonemeId,
		PhonemeArticulation,
	][]) {
		const features = articulation.features as Partial<PhonemeArticulatoryFeatures>;

		assignFeatureValue("voicing", phonemeId, features.voicing);
		assignFeatureValue("place", phonemeId, features.place);
		assignFeatureValue("manner", phonemeId, features.manner);
		assignFeatureValue("height", phonemeId, features.height);
		assignFeatureValue("backness", phonemeId, features.backness);
		assignFeatureValue("roundness", phonemeId, features.roundness);
		assignFeatureValue("tenseness", phonemeId, features.tenseness);
		assignFeatureValue("rhoticity", phonemeId, features.rhoticity);
	}

	return lookup;
}
