/**
 * Retrieval for spelling suggestions, in two halves: the server enumerates one-edit variants
 * and asks Turso; the second edit is searched the other way round, by scanning the curated 10k
 * the browser already holds. Enumerating two edits would mean ~133k variants per token.
 *
 * Retrieval options and their measurements: `docs/research/issue-248-two-edit-spelling-suggestions.md`.
 */

import { classifyEdits } from "./spelling-edits";

const VARIANT_ALPHABET = "abcdefghijklmnopqrstuvwxyz'-";

/** Below this, almost every short word is within two edits of almost every other. */
export const MIN_LENGTH_FOR_TWO_EDITS = 6;

/** Callers check this before charging a scan to the request budget. */
export function reachesTwoEdits(token: string): boolean {
	return token.length >= MIN_LENGTH_FOR_TWO_EDITS;
}

/** Shared with the scoring policy, which would drop anything found beyond it. */
export const MAX_EDITS = 2;

const LETTER_A = 97;
const LETTER_Z = 122;

/** The curated lists are ordered by frequency, so a word's rank is its position. */
export function ranksFromOrder(orderedWords: string[]): Record<string, number> {
	const ranks: Record<string, number> = {};
	for (const [index, word] of orderedWords.entries()) {
		ranks[word] = index;
	}
	return ranks;
}

/** The first edit's retrieval: ~530 variants for a nine-letter token, answered by one query. */
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

/** The ranks double as the word set searched, so the two cannot disagree. */
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
 * Every match, uncapped: the policy abstains only over rivals it is shown, so truncating would
 * let an arbitrary subset settle the offer (`saring` has 67 neighbours). The bound is the scan
 * itself — at most the length buckets within budget, of a fixed 10k list.
 */
function searchIndex(index: VocabularyIndex, rawToken: string): string[] {
	const token = rawToken.toLowerCase();
	if (token.length === 0) return [];

	const maxEdits = reachesTwoEdits(token) ? MAX_EDITS : 1;
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
