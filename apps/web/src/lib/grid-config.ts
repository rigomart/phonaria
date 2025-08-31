import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { articulationRegistry } from "shared-data";
import { VOWEL_FRONTS, VOWEL_HEIGHTS } from "@/hooks/chart/use-vowel-grid";
import { MANNERS, PLACES } from "@/lib/phoneme-helpers";

export interface GridDimensions {
	rows: string[];
	columns: string[];
}

export interface GridConfig {
	dimensions: GridDimensions;
	rowType: "manner" | "height";
	columnType: "place" | "frontness";
	caption: string;
	getRowLabel: (row: string) => string;
	getColumnLabel: (column: string) => string;
}

export type PhonemeGrid<T extends ConsonantPhoneme | VowelPhoneme> = Record<
	string,
	Record<string, T[]>
>;

export type PhonemeGridProps =
	| {
			type: "consonant";
			grid: PhonemeGrid<ConsonantPhoneme>;
			onSelect: (phoneme: ConsonantPhoneme) => void;
	  }
	| {
			type: "vowel";
			grid: PhonemeGrid<VowelPhoneme>;
			onSelect: (phoneme: VowelPhoneme) => void;
	  };

export function getGridConfig(type: "consonant" | "vowel"): GridConfig {
	if (type === "consonant") {
		return {
			dimensions: {
				rows: MANNERS,
				columns: PLACES,
			},
			rowType: "manner",
			columnType: "place",
			caption: "Rows: Manner of articulation • Columns: Place of articulation",
			getRowLabel: (row) => row,
			getColumnLabel: (column) => column,
		};
	} else {
		return {
			dimensions: {
				rows: VOWEL_HEIGHTS,
				columns: VOWEL_FRONTS,
			},
			rowType: "height",
			columnType: "frontness",
			caption: "Rows: Height / Openness • Columns: Frontness / Backness",
			getRowLabel: (row) => row.replace("near-", "near "),
			getColumnLabel: (column) => column.replace("near-", "near "),
		};
	}
}

export function getArticulationInfo(key: string) {
	return articulationRegistry[key];
}

export function hasPhonemesInRow<T extends ConsonantPhoneme | VowelPhoneme>(
	grid: PhonemeGrid<T>,
	row: string,
	columns: string[],
): boolean {
	return columns.some((column) => grid[row]?.[column]?.length > 0);
}

export function getNonEmptyColumns<T extends ConsonantPhoneme | VowelPhoneme>(
	grid: PhonemeGrid<T>,
	row: string,
	columns: string[],
): string[] {
	return columns.filter((column) => grid[row]?.[column]?.length > 0);
}
