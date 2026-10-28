import { type SpellingPattern, splitSpelledWord } from "@phonaria/phonetics-data";

/** Letter positions [start, end) in a word. */
type Span = readonly [start: number, end: number];

const VOWEL_LETTERS = /[aeiou]/;

/**
 * Every place a spelling pattern can sit in a word, each as the spans of
 * letters it covers. Hyphens anchor a pattern as in the spelling data: "-ed"
 * ends the word, "kn-" starts it, and "a-e" is a vowel letter and a final "e"
 * around one or two consonant letters ("l[a]n[e]").
 */
function findPattern(word: string, pattern: string): Span[][] {
	const split = /^([a-z]+)-([a-z]+)$/.exec(pattern);
	if (split) {
		const [, head, tail] = split;
		if (!word.endsWith(tail)) return [];
		const tailStart = word.length - tail.length;
		return [1, 2].flatMap((gap) => {
			const headStart = tailStart - gap - head.length;
			const gapLetters = word.slice(headStart + head.length, tailStart);
			return headStart >= 0 && word.startsWith(head, headStart) && !VOWEL_LETTERS.test(gapLetters)
				? [[[headStart, headStart + head.length] as const, [tailStart, word.length] as const]]
				: [];
		});
	}

	const letters = pattern.replaceAll("-", "");
	const matches: Span[][] = [];
	for (let start = word.indexOf(letters); start !== -1; start = word.indexOf(letters, start + 1)) {
		const end = start + letters.length;
		if (pattern.endsWith("-") && start !== 0) continue;
		if (pattern.startsWith("-") && end !== word.length) continue;
		matches.push([[start, end]]);
	}
	return matches;
}

type SpellingExample = SpellingPattern["examples"][number];

/** One way to spell the sound with the example words that use it, or an example no pattern explains. */
interface SpellingRow {
	pattern: string | null;
	examples: readonly SpellingExample[];
}

export interface SpellingPairs {
	/** Patterns with their examples, in pattern order; examples that match no pattern follow, alone. */
	rows: readonly SpellingRow[];
	/** Patterns that no example uses. */
	unpaired: readonly string[];
}

/** Where the example's bracketed letters sit in its word. */
function markedSpans(spelled: string): Span[] {
	const spans: Span[] = [];
	let offset = 0;
	for (const { text, highlighted } of splitSpelledWord(spelled)) {
		if (highlighted) spans.push([offset, offset + text.length]);
		offset += text.length;
	}
	return spans;
}

/**
 * How well a pattern explains an example: "exact" when the pattern sits on
 * exactly the marked letters ("-ed", "jump[ed]"); "within" when it sits where
 * its hyphens allow and the marked letters fall inside it ("-tion",
 * "na[ti]on"); null otherwise.
 */
function matchPattern(example: SpellingExample, pattern: string): "exact" | "within" | null {
	const marked = markedSpans(example.spelled);
	const candidates = findPattern(example.word, pattern);
	const sameSpans = (spans: readonly Span[]) =>
		spans.length === marked.length &&
		spans.every(([start, end], i) => start === marked[i][0] && end === marked[i][1]);
	if (candidates.some(sameSpans)) return "exact";
	const first = marked[0][0];
	const last = marked[marked.length - 1][1];
	const covers = (spans: readonly Span[]) =>
		spans.length === 1 && spans[0][0] <= first && spans[0][1] >= last;
	return candidates.some(covers) ? "within" : null;
}

/**
 * Pairs each spelling pattern with the example words that use it, by the
 * examples' bracketed letters: t with "[t]op", tt with "le[tt]er". An exact
 * match wins over a pattern that only contains the marked letters.
 */
export function pairSpellings({ patterns, examples }: SpellingPattern): SpellingPairs {
	const byPattern = new Map<string, SpellingExample[]>(patterns.map((pattern) => [pattern, []]));
	const alone: SpellingRow[] = [];

	for (const example of examples) {
		const pattern =
			patterns.find((candidate) => matchPattern(example, candidate) === "exact") ??
			patterns.find((candidate) => matchPattern(example, candidate) === "within");
		if (pattern) byPattern.get(pattern)?.push(example);
		else alone.push({ pattern: null, examples: [example] });
	}

	const paired = [...byPattern].filter(([, matched]) => matched.length > 0);
	return {
		rows: [...paired.map(([pattern, matched]) => ({ pattern, examples: matched })), ...alone],
		unpaired: [...byPattern].filter(([, matched]) => matched.length === 0).map(([p]) => p),
	};
}
