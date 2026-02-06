import type { TargetLanguage } from "@phonaria/phonetics-data";

/**
 * Target-language resolver for IPA chart.
 * Target language (which sounds to teach) is independent of locale (UI language).
 * Currently hardcoded to English; will become user-selectable when more
 * target languages are fully supported.
 */
export function getIpaChartTargetLanguage(): TargetLanguage {
	return "en";
}
