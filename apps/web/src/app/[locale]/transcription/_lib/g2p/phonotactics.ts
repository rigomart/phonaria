import type { ConsonantSymbolId } from "@phonaria/phonetics-data";

/**
 * Valid English onsets for syllabification using Maximum Onset Principle.
 * These use phoneme IDs (H, J) not ARPABET tokens (HH, JH).
 */
const ONSETS: ConsonantSymbolId[][] = [
	// Single Consonants (all except NG)
	["P"],
	["B"],
	["T"],
	["D"],
	["K"],
	["G"],
	["F"],
	["V"],
	["TH"],
	["DH"],
	["S"],
	["Z"],
	["SH"],
	["ZH"],
	["H"],
	["M"],
	["N"],
	["L"],
	["R"],
	["W"],
	["Y"],
	["CH"],
	["J"],

	// Two-Consonant Clusters
	// Stop + Liquid
	["P", "L"],
	["P", "R"],
	["B", "L"],
	["B", "R"],
	["T", "R"],
	["D", "R"],
	["K", "L"],
	["K", "R"],
	["G", "L"],
	["G", "R"],
	// Fricative + Liquid
	["F", "L"],
	["F", "R"],
	["TH", "R"],
	["SH", "R"],
	// S + Stop
	["S", "P"],
	["S", "T"],
	["S", "K"],
	// S + Nasal
	["S", "M"],
	["S", "N"],
	// S + Liquid/Glide
	["S", "L"],
	["S", "W"],
	// Other
	["H", "Y"], // hue
	["K", "W"], // quick
	["G", "W"], // guava (rare but possible)

	// Three-Consonant Clusters
	// S + Stop + Liquid
	["S", "P", "L"],
	["S", "P", "R"],
	["S", "T", "R"],
	["S", "K", "L"], // sclerotic
	["S", "K", "R"],
	// S + Stop + Glide
	["S", "K", "W"], // square
];

export const VALID_ONSETS = new Set(ONSETS.map((tokens) => tokens.join(" ")));

/**
 * Checks if a sequence of phoneme ID tokens forms a valid onset.
 */
export function isValidOnset(tokens: string[]): boolean {
	if (tokens.length === 0) return false;
	const key = tokens.join(" ");
	return VALID_ONSETS.has(key);
}
