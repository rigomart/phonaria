import { isVowelPhoneme, type PhonemeSymbolId } from "@phonaria/phonetics-data";

/**
 * Lines up expected sounds with the sounds a scorer reports, by edit distance.
 * Returns, for each expected sound, the index of the reported sound it lines up
 * with, or null when it lines up with none. An expected sound only gets a
 * reported sound when every cheapest alignment pairs them, so a reported sound
 * that could belong to either of two expected sounds goes to neither.
 *
 * A vowel never lines up with a consonant. A reported sound of null has no
 * phoneme ID; it can stand in for any expected sound but never counts as the same.
 */
export function alignPhonemes(
	expected: readonly PhonemeSymbolId[],
	reported: readonly (PhonemeSymbolId | null)[],
): (number | null)[] {
	const rows = expected.length;
	const columns = reported.length;
	const pair = (row: number, column: number) => substitutionCost(expected[row], reported[column]);

	const costOfPrefixes = table(rows, columns);
	for (let row = 0; row <= rows; row++) {
		for (let column = 0; column <= columns; column++) {
			if (row === 0 || column === 0) {
				costOfPrefixes[row][column] = row + column;
				continue;
			}
			costOfPrefixes[row][column] = Math.min(
				costOfPrefixes[row - 1][column - 1] + pair(row - 1, column - 1),
				costOfPrefixes[row - 1][column] + 1,
				costOfPrefixes[row][column - 1] + 1,
			);
		}
	}

	const costOfSuffixes = table(rows, columns);
	for (let row = rows; row >= 0; row--) {
		for (let column = columns; column >= 0; column--) {
			if (row === rows || column === columns) {
				costOfSuffixes[row][column] = rows - row + columns - column;
				continue;
			}
			costOfSuffixes[row][column] = Math.min(
				costOfSuffixes[row + 1][column + 1] + pair(row, column),
				costOfSuffixes[row + 1][column] + 1,
				costOfSuffixes[row][column + 1] + 1,
			);
		}
	}

	const best = costOfPrefixes[rows][columns];
	return expected.map((_, row) => {
		const cheapestWays: (number | null)[] = [];
		for (let column = 0; column <= columns; column++) {
			if (costOfPrefixes[row][column] + 1 + costOfSuffixes[row + 1][column] === best) {
				cheapestWays.push(null);
			}
			if (
				column < columns &&
				costOfPrefixes[row][column] + pair(row, column) + costOfSuffixes[row + 1][column + 1] ===
					best
			) {
				cheapestWays.push(column);
			}
		}
		return forcedPartner(cheapestWays);
	});
}

function forcedPartner(cheapestWays: readonly (number | null)[]): number | null {
	return cheapestWays.length === 1 ? cheapestWays[0] : null;
}

function table(rows: number, columns: number): number[][] {
	return Array.from({ length: rows + 1 }, () => new Array<number>(columns + 1).fill(0));
}

function substitutionCost(expected: PhonemeSymbolId, reported: PhonemeSymbolId | null): number {
	if (reported === expected) return 0;
	if (reported === null || isVowelPhoneme(reported) === isVowelPhoneme(expected)) return 1;
	return Number.POSITIVE_INFINITY;
}
