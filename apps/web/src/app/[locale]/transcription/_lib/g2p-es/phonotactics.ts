import type { PhonemeSymbolId } from "@phonaria/phonetics-data";

/**
 * Valid two-consonant onset clusters in Spanish (stop/fricative + liquid).
 * Used by the syllabifier for Maximum Onset Principle.
 */
export const VALID_ONSETS: ReadonlySet<string> = new Set([
	"PRX",
	"PL",
	"BRX",
	"BL",
	"TRX",
	"DRX",
	"KRX",
	"KL",
	"GRX",
	"GL",
	"FRX",
	"FL",
	"GW",
	"KW",
]);

/**
 * Check whether a sequence of consonant phoneme IDs forms a valid Spanish onset.
 */
export function isValidOnset(consonantIds: PhonemeSymbolId[]): boolean {
	if (consonantIds.length === 0) return true;
	if (consonantIds.length === 1) return true;
	if (consonantIds.length === 2) {
		return VALID_ONSETS.has(`${consonantIds[0]}${consonantIds[1]}`);
	}
	return false;
}
