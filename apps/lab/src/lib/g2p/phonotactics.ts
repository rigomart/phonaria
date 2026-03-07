import type { ConsonantSymbolId } from "@phonaria/phonetics-data";

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
	["F", "L"],
	["F", "R"],
	["TH", "R"],
	["SH", "R"],
	["S", "P"],
	["S", "T"],
	["S", "K"],
	["S", "M"],
	["S", "N"],
	["S", "L"],
	["S", "W"],
	["H", "Y"],
	["K", "W"],
	["G", "W"],

	// Three-Consonant Clusters
	["S", "P", "L"],
	["S", "P", "R"],
	["S", "T", "R"],
	["S", "K", "L"],
	["S", "K", "R"],
	["S", "K", "W"],
];

export const VALID_ONSETS = new Set(ONSETS.map((tokens) => tokens.join(" ")));

export function isValidOnset(tokens: string[]): boolean {
	if (tokens.length === 0) return false;
	const key = tokens.join(" ");
	return VALID_ONSETS.has(key);
}
