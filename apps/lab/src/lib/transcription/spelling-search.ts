/**
 * Bounded neighbour search over the curated vocabulary.
 *
 * The server already searches the full pronunciation dictionary one edit out. Reaching two
 * edits the same way is not affordable: a nine-letter token has ~530 one-edit variants and
 * ~133,000 second-order ones, far too many to enumerate and send to Turso.
 *
 * So the second edit is searched the other way round — scan the vocabulary and classify
 * each word — over the curated 10k the browser has already loaded for frequency ranks.
 * That costs no extra request, no extra payload, and no database index. It also matches
 * the policy: a two-edit candidate needs frequency evidence to be offered at all, so words
 * the curated list has never heard of could not be offered even if the search found them.
 *
 * `docs/research/issue-248-two-edit-spelling-suggestions.md` records the measured comparison
 * against a full-dictionary index and a database-backed lookup.
 */

import { classifyEdits } from "./spelling-edits";

const VARIANT_ALPHABET = "abcdefghijklmnopqrstuvwxyz'-";

/**
 * Below this length, two edits stop being evidence of anything: almost every short word is
 * within two edits of almost every other, so `bg` and `cn` would pull in rivals rather than
 * evidence.
 */
export const MIN_LENGTH_FOR_TWO_EDITS = 6;

/**
 * The widest slip the feature reads. Shared with the scoring policy: if the search reached
 * further than the policy classifies, it would only ever collect candidates that get dropped.
 */
export const MAX_EDITS = 2;

const LETTER_A = 97;
const LETTER_Z = 122;

/**
 * Curated ranks keyed by word, taken from the list's own order. The curated files are ordered
 * by frequency, so a word's rank is its position — which is why this is derived, not stored.
 */
export function ranksFromOrder(orderedWords: string[]): Record<string, number> {
	const ranks: Record<string, number> = {};
	for (const [index, word] of orderedWords.entries()) {
		ranks[word] = index;
	}
	return ranks;
}

/**
 * Every word one slip from `word`, for the server to intersect with the full pronunciation
 * dictionary. This is the first edit's retrieval: enumerate the query, ask the database once.
 * A nine-letter token yields ~530 variants, which one `IN` query answers.
 */
export function generateOneEditVariants(word: string): string[] {
	const normalized = word.toLowerCase();
	if (normalized.length === 0) return [];

	const variants = new Set<string>();
	const letters = [...normalized];

	for (let index = 0; index < letters.length; index += 1) {
		const deleted = letters
			.slice(0, index)
			.concat(letters.slice(index + 1))
			.join("");
		if (deleted.length > 0 && deleted !== normalized) variants.add(deleted);

		for (const char of VARIANT_ALPHABET) {
			if (char === letters[index]) continue;
			const substituted = letters.slice();
			substituted[index] = char;
			const next = substituted.join("");
			if (next !== normalized) variants.add(next);
		}

		if (index + 1 < letters.length && letters[index] !== letters[index + 1]) {
			const transposed = letters.slice();
			const current = transposed[index];
			const next = transposed[index + 1];
			if (current === undefined || next === undefined) continue;
			transposed[index] = next;
			transposed[index + 1] = current;
			const swapped = transposed.join("");
			if (swapped !== normalized) variants.add(swapped);
		}
	}

	for (let index = 0; index <= letters.length; index += 1) {
		for (const char of VARIANT_ALPHABET) {
			const inserted = letters.slice(0, index).concat(char, letters.slice(index)).join("");
			if (inserted !== normalized) variants.add(inserted);
		}
	}

	return [...variants];
}

export interface SpellingVocabulary {
	/** The curated rank, or null when the list carries no evidence about the word. */
	rank(word: string): number | null;
	/** Curated words within the bounded edit radius of the token, never the token itself. */
	nearWords(token: string): string[];
}

/**
 * The curated ranks double as the vocabulary: the list is both the word set searched and
 * the frequency evidence weighed, so the two can never disagree about which words exist.
 */
export function createSpellingVocabulary(ranksByWord: Record<string, number>): SpellingVocabulary {
	const ranks = new Map<string, number>();
	for (const [word, rank] of Object.entries(ranksByWord)) {
		ranks.set(word.toLowerCase(), rank);
	}

	const index = buildIndex([...ranks.keys()]);

	return {
		rank(word) {
			return ranks.get(word.toLowerCase()) ?? null;
		},
		nearWords(token) {
			return searchIndex(index, token);
		},
	};
}

interface IndexedWord {
	word: string;
	/** Bit per distinct a-z letter present. Other characters are ignored, so it only ever loosens. */
	letters: number;
}

/** Words bucketed by length, so a search reads only the lengths an edit budget can reach. */
type VocabularyIndex = Map<number, IndexedWord[]>;

function buildIndex(words: string[]): VocabularyIndex {
	const index: VocabularyIndex = new Map();
	for (const word of words) {
		const bucket = index.get(word.length);
		const entry = { word, letters: letterMask(word) };
		if (bucket === undefined) index.set(word.length, [entry]);
		else bucket.push(entry);
	}
	return index;
}

function letterMask(word: string): number {
	let mask = 0;
	for (let position = 0; position < word.length; position += 1) {
		const code = word.charCodeAt(position);
		if (code >= LETTER_A && code <= LETTER_Z) mask |= 1 << (code - LETTER_A);
	}
	return mask;
}

function countBits(value: number): number {
	let remaining = value;
	let count = 0;
	while (remaining !== 0) {
		remaining &= remaining - 1;
		count += 1;
	}
	return count;
}

/**
 * Every curated word within the token's edit radius — all of them, deliberately.
 *
 * There is no ceiling on the result count. One here would be the wrong kind of bound: by the
 * time it could truncate, the scan has already paid for every candidate it found, so it saves
 * no measurable work — and it would give the search a say in the decision. The policy abstains
 * when rivals sit too close together, which it can only do for rivals it is shown; dropping
 * some of them in length order would let an arbitrary subset settle the offer. Tokens missing
 * an early consonant really do reach that many: `saring` has 67 curated neighbours.
 *
 * The per-token bound is on work instead, and it is structural: only lengths inside the budget
 * are visited, the letter mask rules out most of each bucket, and the curated list is a fixed
 * 10k asset. Measured worst case is 0.19 ms for one token, unchanged by dropping the old cap.
 */
function searchIndex(index: VocabularyIndex, rawToken: string): string[] {
	const token = rawToken.toLowerCase();
	if (token.length === 0) return [];

	const maxEdits = token.length >= MIN_LENGTH_FOR_TWO_EDITS ? MAX_EDITS : 1;
	const tokenLetters = letterMask(token);
	// One edit changes at most one letter on each side, so it moves at most two mask bits.
	const maxMaskDistance = 2 * maxEdits;

	const found: string[] = [];
	for (let length = token.length - maxEdits; length <= token.length + maxEdits; length += 1) {
		const bucket = index.get(length);
		if (bucket === undefined) continue;

		for (const { word, letters } of bucket) {
			if (word === token) continue;
			if (countBits(tokenLetters ^ letters) > maxMaskDistance) continue;
			if (classifyEdits(token, word, maxEdits) === null) continue;
			found.push(word);
		}
	}

	return found;
}
