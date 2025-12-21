import type {
	PhonemeAllophoneContextKey,
	PhonemeArticulatoryFeatures,
	PhonemeSymbolId,
} from "@phonaria/phonetics-data";

export type FeatureValueDefinition = {
	label: string;
	description: string;
};

export type ArticulatoryFeature<ValueKey extends string> = {
	label: string;
	description: string;
	values: Record<ValueKey, FeatureValueDefinition>;
};

export type BaseFeatureDefinitions = {
	[K in keyof Required<PhonemeArticulatoryFeatures>]: ArticulatoryFeature<
		NonNullable<PhonemeArticulatoryFeatures[K]>
	>;
};

export type DiphthongTargetFeatureDefinitions = {
	targetHeight: ArticulatoryFeature<PhonemeArticulatoryFeatures["height"]>;
	targetBackness: ArticulatoryFeature<PhonemeArticulatoryFeatures["backness"]>;
	targetRoundness: ArticulatoryFeature<PhonemeArticulatoryFeatures["roundness"]>;
};

export type PhonemeDetailsEntry = {
	label: string;
};

export type AllophoneContextDefinition = {
	name: string;
	description: string;
	when: string;
};

export type PhonemeDetailsCopy = {
	phonemeDetailsById: Record<PhonemeSymbolId, PhonemeDetailsEntry>;
	featureDefinitions: BaseFeatureDefinitions;
	diphthongTargetDefinitions: DiphthongTargetFeatureDefinitions;
	allophoneContextDefinitions: Record<PhonemeAllophoneContextKey, AllophoneContextDefinition>;
};
