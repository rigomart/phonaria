import type { TargetLanguage } from "./core/types";
import type { CmuArpaToken, CmuStressLevel } from "./en/cmu-arpa-registry";
import { CmuArpaRegistry } from "./en/cmu-arpa-registry";
import type { LanguagePhonemeAllophoneRegistry } from "./en/phoneme-allophones";
import { EnglishPhonemeAllophoneRegistry } from "./en/phoneme-allophones";
import type { LanguagePhonemeContrastRegistry } from "./en/phoneme-contrasts";
import { EnglishContrastsByPhonemeIdRegistry } from "./en/phoneme-contrasts";
import type { LanguageSpellingPatternRegistry } from "./en/phoneme-patterns";
import { EnglishPhonemeSpellingPatternRegistry } from "./en/phoneme-patterns";

type EnglishLanguageDatasets = {
	cmuArpaRegistry: Record<string, string>;
	allophoneRegistry: LanguagePhonemeAllophoneRegistry<"en">;
	contrastsRegistry: LanguagePhonemeContrastRegistry<"en">;
	spellingPatternRegistry: LanguageSpellingPatternRegistry<"en">;
};

export const LanguageDataRegistry = {
	en: {
		cmuArpaRegistry: CmuArpaRegistry,
		allophoneRegistry: EnglishPhonemeAllophoneRegistry,
		contrastsRegistry: EnglishContrastsByPhonemeIdRegistry,
		spellingPatternRegistry: EnglishPhonemeSpellingPatternRegistry,
	},
	es: {},
} as const satisfies Record<TargetLanguage, Partial<EnglishLanguageDatasets>>;

export function getCmuArpaRegistryForLanguage(
	language: TargetLanguage,
): Readonly<Record<CmuArpaToken, string>> | null {
	return language === "en" ? CmuArpaRegistry : null;
}

export function getAllophoneRegistryForLanguage(
	language: TargetLanguage,
): LanguagePhonemeAllophoneRegistry<"en"> | null {
	return language === "en" ? EnglishPhonemeAllophoneRegistry : null;
}

export function getContrastRegistryForLanguage(
	language: TargetLanguage,
): LanguagePhonemeContrastRegistry<"en"> | null {
	return language === "en" ? EnglishContrastsByPhonemeIdRegistry : null;
}

export function getSpellingPatternRegistryForLanguage(
	language: TargetLanguage,
): LanguageSpellingPatternRegistry<"en"> | null {
	return language === "en" ? EnglishPhonemeSpellingPatternRegistry : null;
}

export type { CmuArpaToken, CmuStressLevel };
