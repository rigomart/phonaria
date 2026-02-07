import type { TargetLanguage } from "@phonaria/phonetics-data";

/**
 * Returns the default target language for the IPA chart based on the current locale.
 * Target language (which sounds to teach) is independent of locale (UI language),
 * but defaults to a 1:1 match when possible.
 */
export function getDefaultTargetLanguage(locale: string): TargetLanguage {
	if (locale === "es") return "es";
	return "en";
}
