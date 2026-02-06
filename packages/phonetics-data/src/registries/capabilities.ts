import type { TargetLanguage } from "../core/types";

export const LANGUAGE_FEATURE_KEYS = [
	"articulations",
	"cmuArpa",
	"allophones",
	"contrasts",
	"spellingPatterns",
	"curatedWordData",
] as const;

export type LanguageFeatureKey = (typeof LANGUAGE_FEATURE_KEYS)[number];

export type LanguageFeatureCapabilities = Record<LanguageFeatureKey, boolean>;

export const LanguageFeatureCapabilitiesRegistry = {
	en: {
		articulations: true,
		cmuArpa: true,
		allophones: true,
		contrasts: true,
		spellingPatterns: true,
		curatedWordData: true,
	},
	es: {
		articulations: true,
		cmuArpa: false,
		allophones: false,
		contrasts: false,
		spellingPatterns: false,
		curatedWordData: false,
	},
} as const satisfies Record<TargetLanguage, LanguageFeatureCapabilities>;

export function getLanguageFeatureCapabilities(
	language: TargetLanguage,
): LanguageFeatureCapabilities {
	return LanguageFeatureCapabilitiesRegistry[language];
}

export function hasLanguageFeature(language: TargetLanguage, feature: LanguageFeatureKey): boolean {
	return LanguageFeatureCapabilitiesRegistry[language][feature];
}
