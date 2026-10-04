import type { DeepReadonly } from "../shared/readonly";
import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	PhonemeArticulatoryFeatureValueMap,
	VowelArticulatoryFeatures,
} from "./articulatory-features";
import { PHONEME_ARTICULATORY_FEATURE_KEYS } from "./articulatory-features";
import type { PhonemeSymbolId } from "./ipa-map";

export type VowelType = "monophthong" | "diphthong";

export type DiphthongVowelArticulatoryFeatures = {
	readonly height: VowelArticulatoryFeatures["height"];
	readonly backness: VowelArticulatoryFeatures["backness"];
	readonly roundness: VowelArticulatoryFeatures["roundness"];
	readonly targetHeight: VowelArticulatoryFeatures["height"];
	readonly targetBackness: VowelArticulatoryFeatures["backness"];
	readonly targetRoundness: VowelArticulatoryFeatures["roundness"];
};

export type ConsonantArticulation = {
	readonly category: "consonant";
	readonly features: ConsonantArticulatoryFeatures;
};

export type MonophthongVowelArticulation = {
	readonly category: "vowel";
	readonly vowelType: "monophthong";
	readonly features: VowelArticulatoryFeatures;
};

export type DiphthongVowelArticulation = {
	readonly category: "vowel";
	readonly vowelType: "diphthong";
	readonly features: DiphthongVowelArticulatoryFeatures;
};

export type PhonemeArticulation =
	| ConsonantArticulation
	| MonophthongVowelArticulation
	| DiphthongVowelArticulation;

type MutableFeatureValueLookup<TPhonemeId extends PhonemeSymbolId> = {
	[K in PhonemeArticulatoryFeatureKey]: Partial<
		Record<TPhonemeId, PhonemeArticulatoryFeatureValueMap[K]>
	>;
};

export type FeatureValueLookup<TPhonemeId extends PhonemeSymbolId> = DeepReadonly<
	MutableFeatureValueLookup<TPhonemeId>
>;

function hasCompleteFeatureLookup<TPhonemeId extends PhonemeSymbolId>(
	lookup: Partial<MutableFeatureValueLookup<TPhonemeId>>,
): lookup is MutableFeatureValueLookup<TPhonemeId> {
	return PHONEME_ARTICULATORY_FEATURE_KEYS.every(
		(featureKey) => Object.getOwnPropertyDescriptor(lookup, featureKey) !== undefined,
	);
}

function assignFeatureValueByKey<
	TPhonemeId extends PhonemeSymbolId,
	TFeatureKey extends PhonemeArticulatoryFeatureKey,
>(
	lookup: Partial<MutableFeatureValueLookup<TPhonemeId>>,
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
	phonemeArticulationRegistry: Readonly<Record<TPhonemeId, PhonemeArticulation>>,
): MutableFeatureValueLookup<TPhonemeId> {
	const lookup: Partial<MutableFeatureValueLookup<TPhonemeId>> = {};

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
