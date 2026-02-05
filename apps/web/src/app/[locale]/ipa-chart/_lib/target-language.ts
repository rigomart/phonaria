import type { TargetLanguage } from "@phonaria/phonetics-data";

/**
 * Phase 1 target-language resolver for IPA chart.
 * Display language is controlled by locale; target language stays explicit and separate.
 */
export function getIpaChartTargetLanguage(): TargetLanguage {
	return "en";
}
