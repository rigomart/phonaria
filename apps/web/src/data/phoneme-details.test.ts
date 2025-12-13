import type { PhonemeArticulatoryFeatures } from "shared-data";
import { PhonemeAllophoneRegistry, PhonemeArticulationRegistry } from "shared-data";
import { describe, expect, it } from "vitest";
import { phonemeDetailsCopyByLocale } from "./phoneme-details";

type FeatureKey = keyof PhonemeArticulatoryFeatures;

const locales = Object.keys(phonemeDetailsCopyByLocale) as Array<
	keyof typeof phonemeDetailsCopyByLocale
>;

describe("phoneme details data", () => {
	for (const locale of locales) {
		const copy = phonemeDetailsCopyByLocale[locale];
		const featureDefinitions = copy.featureDefinitions;
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

		describe(locale, () => {
			it("exposes details for every articulated phoneme", () => {
				for (const phonemeId of Object.keys(PhonemeArticulationRegistry)) {
					expect(
						copy.phonemeDetailsById[phonemeId as keyof typeof copy.phonemeDetailsById],
					).toBeDefined();
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

			it("covers every allophone context with definitions", () => {
				for (const allophones of Object.values(PhonemeAllophoneRegistry)) {
					if (!allophones) continue;
					for (const allophone of allophones) {
						expect(copy.allophoneContextDefinitions[allophone.contextKey]).toBeDefined();
					}
				}
			});
		});
	}
});
