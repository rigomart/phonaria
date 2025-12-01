import type { PhonemeArticulatoryFeatures } from "shared-data";
import { PhonemeArticulationRegistry } from "shared-data";
import { describe, expect, it } from "vitest";
import { featureDefinitions, phonemeDetailsById } from "./phoneme-details";

type FeatureKey = keyof PhonemeArticulatoryFeatures;

const allFeatureKeys = Object.keys(featureDefinitions) as FeatureKey[];

const getFeatureValueDefinition = <K extends FeatureKey>(
	featureKey: K,
	valueKey: PhonemeArticulatoryFeatures[K] | undefined,
) => {
	if (!valueKey) return null;
	const feature = featureDefinitions[featureKey];
	if (!feature) return null;
	const value = feature.values[valueKey];
	return value ?? null;
};

describe("phoneme details data", () => {
	it("exposes details for every articulated phoneme", () => {
		for (const phonemeId of Object.keys(PhonemeArticulationRegistry)) {
			expect(phonemeDetailsById[phonemeId as keyof typeof phonemeDetailsById]).toBeDefined();
		}
	});

	it("covers every articulation feature with definitions", () => {
		for (const articulation of Object.values(PhonemeArticulationRegistry)) {
			const features = articulation.features as Partial<PhonemeArticulatoryFeatures>;

			for (const featureKey of allFeatureKeys) {
				const featureValue = features[featureKey];
				if (!featureValue) continue;

				const valueDefinition = getFeatureValueDefinition(featureKey, featureValue);
				expect(valueDefinition).toBeDefined();
			}
		}
	});
});
