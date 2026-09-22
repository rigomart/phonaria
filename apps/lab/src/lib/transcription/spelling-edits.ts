/**
 * Reads how a typed token could have become a dictionary word, within a small edit budget.
 *
 * The suggestion policy does not care about edit *distance* alone: it cares whether the
 * slip contradicts anything the learner typed. So each edit carries a strength, and the
 * classifier returns the most charitable reading of the slip rather than any reading.
 */

const VOWEL_LETTERS = new Set(["a", "e", "i", "o", "u", "y"]);
const isVowel = (letter: string | undefined) => letter !== undefined && VOWEL_LETTERS.has(letter);

export type EditKind = "insert" | "delete" | "substitute" | "transpose";

export interface SpellingEdit {
	kind: EditKind;
	/**
	 * True when the edit contradicts nothing the learner typed: they left a letter out,
	 * repeated a keystroke, or moved between vowel letters — the ambiguous part of English
	 * spelling. Replacing or reordering a consonant instead guesses at what they meant, and
	 * a 126k-word dictionary holds a neighbour of that shape for almost any input.
	 */
	strong: boolean;
}

export interface EditScript {
	edits: SpellingEdit[];
}

/**
 * The most charitable script of at most `maxEdits` turning `token` into `candidate`, or
 * null when no script that short exists. Script length equals the real edit distance
 * (Damerau-Levenshtein, adjacent transpositions only) whenever that distance fits.
 */
export function classifyEdits(
	token: string,
	candidate: string,
	maxEdits: number,
): EditScript | null {
	const typed = token.toLowerCase();
	const word = candidate.toLowerCase();
	if (typed === word || typed.length === 0 || word.length === 0) return null;
	if (Math.abs(typed.length - word.length) > maxEdits) return null;

	// Shortest first, so the returned length is the real distance rather than a budget artefact.
	for (let budget = 1; budget <= maxEdits; budget += 1) {
		const scripts = enumerate(typed, word, 0, 0, budget);
		const best = pickMostCharitable(scripts);
		if (best !== undefined) return { edits: best };
	}

	return null;
}

export function isStrongScript(script: EditScript): boolean {
	return script.edits.every((edit) => edit.strong);
}

/**
 * Every script of exactly `budget` remaining edits that aligns `typed` from `i` with
 * `word` from `j`. Matching letters are consumed greedily: when two letters agree there is
 * always a shortest script that pairs them, so branching on them only repeats work.
 */
function enumerate(
	typed: string,
	word: string,
	startTyped: number,
	startWord: number,
	budget: number,
): SpellingEdit[][] {
	let i = startTyped;
	let j = startWord;
	while (i < typed.length && j < word.length && typed[i] === word[j]) {
		i += 1;
		j += 1;
	}

	const typedLeft = typed.length - i;
	const wordLeft = word.length - j;
	if (typedLeft === 0 && wordLeft === 0) return budget === 0 ? [[]] : [];
	// Each edit closes the length gap by at most one, so a wider gap cannot be closed.
	if (budget === 0 || Math.abs(typedLeft - wordLeft) > budget) return [];

	const scripts: SpellingEdit[][] = [];
	const extend = (edit: SpellingEdit, nextTyped: number, nextWord: number) => {
		for (const rest of enumerate(typed, word, nextTyped, nextWord, budget - 1)) {
			scripts.push([edit, ...rest]);
		}
	};

	// The candidate supplies a letter the learner left out.
	if (j < word.length) extend({ kind: "insert", strong: true }, i, j + 1);

	if (i < typed.length) {
		const dropped = typed[i];
		const doubled = typed[i - 1] === dropped || typed[i + 1] === dropped;
		extend({ kind: "delete", strong: doubled }, i + 1, j);
	}

	if (i < typed.length && j < word.length) {
		extend({ kind: "substitute", strong: isVowel(typed[i]) && isVowel(word[j]) }, i + 1, j + 1);
	}

	if (
		i + 1 < typed.length &&
		j + 1 < word.length &&
		typed[i] === word[j + 1] &&
		typed[i + 1] === word[j]
	) {
		extend({ kind: "transpose", strong: isVowel(typed[i]) && isVowel(typed[i + 1]) }, i + 2, j + 2);
	}

	return scripts;
}

/**
 * Most strong edits first, then strongest-earliest. Both orderings are total on the
 * enumerated scripts, so the chosen reading does not depend on branch order.
 */
function pickMostCharitable(scripts: SpellingEdit[][]): SpellingEdit[] | undefined {
	let best: SpellingEdit[] | undefined;
	let bestKey: string | undefined;

	for (const script of scripts) {
		const key = strengthKey(script);
		if (bestKey === undefined || key < bestKey) {
			best = script;
			bestKey = key;
		}
	}

	return best;
}

/** Sorts ascending: fewer weak edits first, and weak edits as late as possible. */
function strengthKey(script: SpellingEdit[]): string {
	const weak = script.reduce((count, edit) => count + (edit.strong ? 0 : 1), 0);
	return `${weak}${script.map((edit) => (edit.strong ? "0" : "1")).join("")}`;
}
