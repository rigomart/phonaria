import type { TargetAccent } from "../core/types";
import { deepFreeze } from "../shared/readonly";

export const LANGUAGE_FEATURE_KEYS = [
	"articulations",
	"cmuArpa",
	"allophones",
	"contrasts",
	"spellingPatterns",
	"curatedWordData",
	"transcription",
] as const;

export type LanguageFeatureKey = (typeof LANGUAGE_FEATURE_KEYS)[number];

export type LanguageFeatureCapabilities = Readonly<Record<LanguageFeatureKey, boolean>>;

export const LanguageFeatureCapabilitiesRegistry = deepFreeze({
	"en-us": {
		articulations: true,
		cmuArpa: true,
		allophones: true,
		contrasts: true,
		spellingPatterns: true,
		curatedWordData: true,
		transcription: true,
	},
	"es-419": {
		articulations: true,
		cmuArpa: false,
		allophones: false,
		contrasts: false,
		spellingPatterns: false,
		curatedWordData: false,
		transcription: true,
	},
} as const satisfies Record<TargetAccent, LanguageFeatureCapabilities>);

export function getLanguageFeatureCapabilities(
	language: TargetAccent,
): LanguageFeatureCapabilities {
	return LanguageFeatureCapabilitiesRegistry[language];
}

export function hasLanguageFeature(language: TargetAccent, feature: LanguageFeatureKey): boolean {
	return LanguageFeatureCapabilitiesRegistry[language][feature];
}
