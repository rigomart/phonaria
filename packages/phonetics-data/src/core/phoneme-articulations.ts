import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatureValueMap,
	VowelArticulatoryFeatures,
} from "./articulatory-features";
import { PHONEME_ARTICULATORY_FEATURE_KEYS } from "./articulatory-features";
import type { PhonemeSymbolId } from "./ipa-registry";

export type VowelType = "monophthong" | "diphthong";

export type DiphthongVowelArticulatoryFeatures = {
	height: VowelArticulatoryFeatures["height"];
	backness: VowelArticulatoryFeatures["backness"];
	roundness: VowelArticulatoryFeatures["roundness"];
	targetHeight: VowelArticulatoryFeatures["height"];
	targetBackness: VowelArticulatoryFeatures["backness"];
	targetRoundness: VowelArticulatoryFeatures["roundness"];
};

export type ConsonantArticulation = {
	category: "consonant";
	features: ConsonantArticulatoryFeatures;
};

export type MonophthongVowelArticulation = {
	category: "vowel";
	vowelType: "monophthong";
	features: VowelArticulatoryFeatures;
};

export type DiphthongVowelArticulation = {
	category: "vowel";
	vowelType: "diphthong";
	features: DiphthongVowelArticulatoryFeatures;
};

export type PhonemeArticulation =
	| ConsonantArticulation
	| MonophthongVowelArticulation
	| DiphthongVowelArticulation;

export type FeatureValueLookup<TPhonemeId extends PhonemeSymbolId> = {
	[K in PhonemeArticulatoryFeatureKey]: Partial<
		Record<TPhonemeId, PhonemeArticulatoryFeatureValueMap[K]>
	>;
};

function hasCompleteFeatureLookup<TPhonemeId extends PhonemeSymbolId>(
	lookup: Partial<FeatureValueLookup<TPhonemeId>>,
): lookup is FeatureValueLookup<TPhonemeId> {
	return PHONEME_ARTICULATORY_FEATURE_KEYS.every((featureKey) => featureKey in lookup);
}

function assignFeatureValueByKey<
	TPhonemeId extends PhonemeSymbolId,
	TFeatureKey extends PhonemeArticulatoryFeatureKey,
>(
	lookup: Partial<FeatureValueLookup<TPhonemeId>>,
	featureKey: TFeatureKey,
	phonemeId: TPhonemeId,
	featureValues: Partial<PhonemeArticulatoryFeatureValueMap>,
): void {
	const value = featureValues[featureKey];
	if (value === undefined) {
		return;
	}

	const featureLookup = lookup[featureKey];
	if (!featureLookup) {
		return;
	}

	featureLookup[phonemeId] = value;
}

export function buildFeatureValueByPhoneme<TPhonemeId extends PhonemeSymbolId>(
	phonemeIds: readonly TPhonemeId[],
	phonemeArticulationRegistry: Record<TPhonemeId, PhonemeArticulation>,
): FeatureValueLookup<TPhonemeId> {
	const lookup: Partial<FeatureValueLookup<TPhonemeId>> = {};

	for (const featureKey of PHONEME_ARTICULATORY_FEATURE_KEYS) {
		lookup[featureKey] = {};
	}

	for (const phonemeId of phonemeIds) {
		const articulation = phonemeArticulationRegistry[phonemeId];
		const featureValues: Partial<PhonemeArticulatoryFeatureValueMap> = articulation.features;

		for (const featureKey of PHONEME_ARTICULATORY_FEATURE_KEYS) {
			assignFeatureValueByKey(lookup, featureKey, phonemeId, featureValues);
		}
	}

	if (!hasCompleteFeatureLookup(lookup)) {
		throw new Error("Feature lookup initialization failed.");
	}

	return lookup;
}
