/**
 * A slow, obvious Damerau-Levenshtein distance, for tests only.
 *
 * Its whole value is being written differently from the code it checks: `classifyEdits` walks
 * an alignment and stops at a budget, while this fills the full matrix. Both `spelling-edits`
 * and `spelling-search` compare against it — the first to confirm a script's length really is
 * the edit distance, the second to confirm the length and letter-mask prefilters never drop a
 * word that genuine classification would have kept.
 *
 * Deliberately unoptimised, and deliberately not importing anything it verifies.
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
			// Adjacent transposition, restricted (optimal string alignment) — the same variant
			// `classifyEdits` reads, which advances past both letters after a swap.
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
