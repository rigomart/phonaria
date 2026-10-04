import { describe, expect, it } from "vitest";
import {
	formatPhonemeLabel,
	getAllophoneRegistryForLanguage,
	getCmuArpaRegistryForLanguage,
	getConsonantArticulationRegistryForLanguage,
	getContrastRegistryForLanguage,
	getDiphthongVowelArticulationRegistryForLanguage,
	getFeatureValueByPhonemeRegistryForLanguage,
	getLanguageArticulationData,
	getLanguageFeatureCapabilities,
	getLanguagePhonemeIds,
	getMonophthongVowelArticulationRegistryForLanguage,
	getPhonemeArticulationRegistryForLanguage,
	getSpellingPatternRegistryForLanguage,
	hasLanguageFeature,
	LANGUAGE_FEATURE_KEYS,
	PHONEME_ARTICULATORY_FEATURE_KEYS,
	TARGET_ACCENTS,
} from "../index";

describe.each(TARGET_ACCENTS)("%s articulation registries", (accent) => {
	it("provides exactly the inventoried sounds in every articulation selector", () => {
		for (const [subset, registry] of [
			["consonants", getConsonantArticulationRegistryForLanguage(accent)],
			["monophthongs", getMonophthongVowelArticulationRegistryForLanguage(accent)],
			["diphthongs", getDiphthongVowelArticulationRegistryForLanguage(accent)],
			["phonemes", getPhonemeArticulationRegistryForLanguage(accent)],
		] as const) {
			expect(Object.keys(registry).sort(), subset).toEqual(
				[...getLanguagePhonemeIds(accent, subset)].sort(),
			);
		}
	});

	it("keeps sound categories and derived feature indexes consistent with articulation data", () => {
		const data = getLanguageArticulationData(accent);
		const featureIndex = getFeatureValueByPhonemeRegistryForLanguage(accent);
		for (const id of getLanguagePhonemeIds(accent)) {
			const articulation = data.phonemes[id as keyof typeof data.phonemes];
			expect(articulation.category, id).toBe(hasOwn(data.consonants, id) ? "consonant" : "vowel");
			if (articulation.category === "vowel") {
				expect(articulation.vowelType, id).toBe(
					hasOwn(data.diphthongs, id) ? "diphthong" : "monophthong",
				);
			}
			for (const key of PHONEME_ARTICULATORY_FEATURE_KEYS) {
				const values = featureIndex[key] as Record<string, unknown>;
				const features = articulation.features as Record<string, unknown>;
				expect(values[id], `${id}.${key}`).toBe(features[key]);
				expect(hasOwn(values, id), `${id}.${key} presence`).toBe(hasOwn(features, key));
			}
		}
		for (const values of Object.values(featureIndex)) {
			for (const id of Object.keys(values)) {
				expect(hasOwn(data.phonemes, id), `unexpected indexed sound ${id}`).toBe(true);
			}
		}
	});
});

function hasOwn(object: object, key: string): boolean {
	return Object.getOwnPropertyDescriptor(object, key) !== undefined;
}

describe("accent selection", () => {
	it.each([
		["en-us", "T", "Voiceless alveolar plosive"],
		["es-419", "T", "Voiceless dental plosive"],
		["en-us", "D", "Voiced alveolar plosive"],
		["es-419", "D", "Voiced dental plosive"],
		["es-419", "EE", "Close-mid front unrounded vowel"],
		["es-419", "AA", "Open central unrounded vowel"],
		["es-419", "NY", "Voiced palatal nasal"],
	] as const)("formats %s %s from its own articulation", (accent, id, expected) => {
		expect(formatPhonemeLabel(accent, id)).toBe(expected);
	});

	it("keeps IPA-faithful diphthong positions even when trajectories overlap", () => {
		const vowels = getDiphthongVowelArticulationRegistryForLanguage("en-us");
		expect(vowels.AI.features).toMatchObject({
			height: "open",
			backness: "front",
			targetHeight: "near-close",
			targetBackness: "near-front",
		});
		expect(vowels.AU.features).toMatchObject({
			height: "open",
			backness: "front",
			targetHeight: "near-close",
			targetBackness: "near-back",
		});
	});
});

describe.each(TARGET_ACCENTS)("%s feature availability", (accent) => {
	it("declares data-backed capabilities in agreement with selector results", () => {
		const available = {
			articulations:
				getLanguagePhonemeIds(accent).length > 0 &&
				Object.keys(getPhonemeArticulationRegistryForLanguage(accent)).length > 0,
			cmuArpa: getCmuArpaRegistryForLanguage(accent) !== null,
			allophones: getAllophoneRegistryForLanguage(accent) !== null,
			contrasts: getContrastRegistryForLanguage(accent) !== null,
			spellingPatterns: getSpellingPatternRegistryForLanguage(accent) !== null,
		};
		const capabilities = getLanguageFeatureCapabilities(accent);
		for (const feature of LANGUAGE_FEATURE_KEYS) {
			expect(typeof capabilities[feature], feature).toBe("boolean");
			expect(hasLanguageFeature(accent, feature), feature).toBe(capabilities[feature]);
		}
		for (const [feature, expected] of Object.entries(available)) {
			expect(capabilities[feature as keyof typeof available], feature).toBe(expected);
		}
	});
});

describe("English-only features", () => {
	it.each([
		["cmuArpa", getCmuArpaRegistryForLanguage],
		["allophones", getAllophoneRegistryForLanguage],
		["contrasts", getContrastRegistryForLanguage],
		["spellingPatterns", getSpellingPatternRegistryForLanguage],
	] as const)("makes %s usable for English and unavailable for Spanish", (feature, getData) => {
		const english = getData("en-us");
		expect(english).not.toBeNull();
		expect(Object.keys(english ?? {}).length).toBeGreaterThan(0);
		expect(hasLanguageFeature("en-us", feature)).toBe(true);
		expect(getData("es-419")).toBeNull();
		expect(hasLanguageFeature("es-419", feature)).toBe(false);
	});
});
