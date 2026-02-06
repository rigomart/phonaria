import { TARGET_LANGUAGES, type TargetLanguage } from "@phonaria/phonetics-data";

const targetLanguageSet: ReadonlySet<string> = new Set(TARGET_LANGUAGES);

/**
 * Phase 1 target-language resolver for IPA chart.
 * Maps the route locale to the matching target language; falls back to English
 * when the locale has no corresponding phoneme inventory.
 */
export function getIpaChartTargetLanguage(locale: string): TargetLanguage {
	return targetLanguageSet.has(locale) ? (locale as TargetLanguage) : "en";
}
