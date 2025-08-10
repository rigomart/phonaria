import type { VowelPhoneme } from "shared-data";
import { vowels } from "shared-data";

export const VOWEL_HEIGHTS: Array<VowelPhoneme["articulation"]["height"]> = [
	"high",
	"near-high",
	"high-mid",
	"mid",
	"low-mid",
	"near-low",
	"low",
];

export const VOWEL_FRONTS: Array<VowelPhoneme["articulation"]["frontness"]> = [
	"front",
	"near-front",
	"central",
	"near-back",
	"back",
];

export type VowelGrid = Record<string, Record<string, VowelPhoneme[]>>;

/**
 * Build grid height x frontness; diphthongs keyed by starting position (their first element articulation).
 */
export function useVowelGrid(): VowelGrid {
	const grid: VowelGrid = {} as VowelGrid;
	for (const h of VOWEL_HEIGHTS) {
		grid[h] = {} as Record<string, VowelPhoneme[]>;
		for (const f of VOWEL_FRONTS) {
			grid[h][f] = [];
		}
	}
	for (const v of vowels) {
		const { height, frontness } = v.articulation;
		if (grid[height] && frontness in grid[height]) {
			grid[height][frontness].push(v);
		}
	}
	for (const h of VOWEL_HEIGHTS) {
		for (const f of VOWEL_FRONTS) {
			grid[h][f].sort((a, b) => {
				if (a.type !== b.type) return a.type === "monophthong" ? -1 : 1;
				if (a.articulation.tenseness !== b.articulation.tenseness) {
					return a.articulation.tenseness === "tense" ? -1 : 1;
				}
				if (a.articulation.roundness !== b.articulation.roundness) {
					return a.articulation.roundness === "unrounded" ? -1 : 1;
				}
				return a.symbol.localeCompare(b.symbol);
			});
		}
	}
	return grid;
}
