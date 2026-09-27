/** Optimal string alignment distance, stopped once more than two edits are needed. */
export function spellingEditDistanceWithinTwo(left: string, right: string): number | null {
	const typed = left.toLowerCase();
	const word = right.toLowerCase();
	if (Math.abs(typed.length - word.length) > 2) return null;
	const distance = remainingDistance(typed, word, 0, 0, 2);
	return distance > 2 ? null : distance;
}

/** @internal Used by the browser CPU probe to run the same distance code in Chromium. */
export function remainingDistance(
	typed: string,
	word: string,
	startTyped: number,
	startWord: number,
	remaining: number,
): number {
	let i = startTyped;
	let j = startWord;
	while (i < typed.length && j < word.length && typed[i] === word[j]) {
		i += 1;
		j += 1;
	}
	if (i === typed.length || j === word.length) {
		const tail = typed.length - i + word.length - j;
		return tail <= remaining ? tail : 3;
	}
	if (remaining === 0 || Math.abs(typed.length - i - (word.length - j)) > remaining) return 3;

	const next = remaining - 1;
	let best = remainingDistance(typed, word, i + 1, j + 1, next);
	if (best > 0) best = Math.min(best, remainingDistance(typed, word, i + 1, j, next));
	if (best > 0) best = Math.min(best, remainingDistance(typed, word, i, j + 1, next));
	if (typed[i] === word[j + 1] && typed[i + 1] === word[j]) {
		best = Math.min(best, remainingDistance(typed, word, i + 2, j + 2, next));
	}
	return best < 3 ? best + 1 : 3;
}
