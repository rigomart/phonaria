import type { PhonemeArticulatoryFeatures } from "@phonaria/phonetics-data";
import {
	EnglishPhonemeAllophoneRegistry,
	getLanguagePhonemeIds,
	getPhonemeArticulationRegistryForLanguage,
} from "@phonaria/phonetics-data";
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
				for (const phonemeId of getLanguagePhonemeIds("en")) {
					expect(copy.phonemeDetailsById[phonemeId]).toBeDefined();
				}
			});

			it("covers every articulation feature with definitions", () => {
				const articulationRegistry = getPhonemeArticulationRegistryForLanguage("en");
				for (const phonemeId of getLanguagePhonemeIds("en")) {
					const articulation = articulationRegistry[phonemeId];
					const features: Partial<PhonemeArticulatoryFeatures> = articulation.features;

					for (const featureKey of allFeatureKeys) {
						const featureValue = features[featureKey];
						if (!featureValue) continue;

						const valueDefinition = getFeatureValueDefinition(featureKey, featureValue);
						expect(valueDefinition).toBeDefined();
					}
				}
			});

			it("covers every allophone context with definitions", () => {
				for (const allophones of Object.values(EnglishPhonemeAllophoneRegistry)) {
					if (!allophones) continue;
					for (const allophone of allophones) {
						expect(copy.allophoneContextDefinitions[allophone.contextKey]).toBeDefined();
					}
				}
			});
		});
	}
});
