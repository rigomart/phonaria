/**
 * A slow, obvious Damerau-Levenshtein distance, for tests only. Its value is being written
 * differently from the code it checks — a full matrix against a budgeted alignment walk — so
 * it deliberately imports nothing it verifies.
 */
export function damerauLevenshtein(left: string, right: string): number {
	const rows = left.length + 1;
	const columns = right.length + 1;
	const table: number[][] = Array.from({ length: rows }, () => new Array<number>(columns).fill(0));
	for (let row = 0; row < rows; row += 1) table[row][0] = row;
	for (let column = 0; column < columns; column += 1) table[0][column] = column;

	for (let row = 1; row < rows; row += 1) {
		for (let column = 1; column < columns; column += 1) {
			const cost = left[row - 1] === right[column - 1] ? 0 : 1;
			let best = Math.min(
				table[row - 1][column] + 1,
				table[row][column - 1] + 1,
				table[row - 1][column - 1] + cost,
			);
			// Restricted (optimal string alignment), matching what `classifyEdits` reads.
			if (
				row > 1 &&
				column > 1 &&
				left[row - 1] === right[column - 2] &&
				left[row - 2] === right[column - 1]
			) {
				best = Math.min(best, table[row - 2][column - 2] + 1);
			}
			table[row][column] = best;
		}
	}

	return table[left.length][right.length];
}

/** The distance, or `ceiling + 1` to stand for "further than we care to measure". */
export function damerauLevenshteinUpTo(left: string, right: string, ceiling: number): number {
	return Math.min(damerauLevenshtein(left, right), ceiling + 1);
}
