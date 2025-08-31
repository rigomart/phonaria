import * as React from "react";
import type { ConsonantPhoneme } from "shared-data";
import { consonants } from "shared-data";
import { MANNERS, PLACES } from "../_lib/phoneme-helpers";

export type ConsonantGrid = Record<string, Record<string, ConsonantPhoneme[]>>;

export function useConsonantGrid(): ConsonantGrid {
	return React.useMemo(() => {
		const grid: ConsonantGrid = {};
		for (const manner of MANNERS) {
			grid[manner] = {} as Record<string, ConsonantPhoneme[]>;
			for (const place of PLACES) {
				grid[manner][place] = [];
			}
		}
		for (const c of consonants) {
			if (!grid[c.articulation.manner]) continue;
			if (!grid[c.articulation.manner][c.articulation.place]) continue;
			grid[c.articulation.manner][c.articulation.place].push(c);
		}
		for (const manner of MANNERS) {
			for (const place of PLACES) {
				grid[manner][place].sort((a, b) =>
					a.articulation.voicing === b.articulation.voicing
						? 0
						: a.articulation.voicing === "voiceless"
							? -1
							: 1,
				);
			}
		}
		return grid;
	}, []);
}
