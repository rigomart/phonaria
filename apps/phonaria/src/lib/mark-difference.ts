/** Brackets the letters `word` doesn't share with `other` at either end: hot, hat → "h[o]t". */
export function markDifference(word: string, other: string): string {
	let start = 0;
	while (start < word.length && start < other.length && word[start] === other[start]) start++;
	let end = 0;
	while (
		end < word.length - start &&
		end < other.length - start &&
		word[word.length - 1 - end] === other[other.length - 1 - end]
	) {
		end++;
	}
	const changed = word.slice(start, word.length - end);
	return changed ? `${word.slice(0, start)}[${changed}]${word.slice(word.length - end)}` : word;
}
