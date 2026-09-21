import { tokenizeTextWithSpans } from "@/lib/g2p/text-processing";

const VARIANT_ALPHABET = "abcdefghijklmnopqrstuvwxyz'-";
/**
 * Zipf score is `1 / (rank + 1)`. Ten times would silence named stories:
 * `recieve` also neighbours `relieve` (~6.7x) and `dont` neighbours `done` (~3.4x).
 * Three times still keeps similar-rank misses quiet (`from`/`form` at 25 vs 30).
 */
const FREQUENCY_LEAD_RATIO = 3;
/** Scores an unranked candidate just past the curated list, so it still rivals a leader. */
const NO_FREQUENCY_EVIDENCE_RANK = 10_000;
const VOWEL_LETTERS = new Set(["a", "e", "i", "o", "u", "y"]);
const isVowel = (letter: string) => VOWEL_LETTERS.has(letter);

export interface SpellingFrequency {
	/** The curated rank, or null when the list carries no evidence about the word. */
	rank(word: string): number | null;
}

export interface SpellingMiss {
	tokenIndex: number;
	/** Dictionary words one slip from the token, found during the server lookup. */
	candidates: string[];
}

export interface SpellingSuggestionSegment {
	text: string;
	underlined: boolean;
}

export interface SpellingSuggestion {
	suggestedText: string;
	underlinedTokenIndexes: number[];
	segments: SpellingSuggestionSegment[];
}

export interface SuggestSpellingInput {
	originalText: string;
	tokens: string[];
	misses: SpellingMiss[];
	frequency: SpellingFrequency;
}

export function generateOneSlipVariants(word: string): string[] {
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

export function createSpellingFrequency(ranksByWord: Record<string, number>): SpellingFrequency {
	const ranks = new Map<string, number>();
	for (const [word, rank] of Object.entries(ranksByWord)) {
		ranks.set(word.toLowerCase(), rank);
	}
	return {
		rank(word) {
			return ranks.get(word.toLowerCase()) ?? null;
		},
	};
}

export function suggestSpelling(input: SuggestSpellingInput): SpellingSuggestion | null {
	const { originalText, tokens, misses, frequency } = input;
	if (misses.length === 0) return null;

	const replacements = new Map<number, string>();

	for (const { tokenIndex, candidates } of misses) {
		const token = tokens[tokenIndex];
		if (token === undefined) continue;

		const offered = pickPlausibleNeighbour(token, candidates, frequency);
		if (offered === null) continue;
		replacements.set(tokenIndex, applyCapitalization(token, offered));
	}

	if (replacements.size === 0) return null;

	const rewrite = rewriteOriginal(originalText, replacements);
	if (rewrite === null) return null;

	return {
		suggestedText: rewrite.suggestedText,
		underlinedTokenIndexes: [...replacements.keys()].sort((left, right) => left - right),
		segments: rewrite.segments,
	};
}

export function getVisibleSpellingSuggestion(
	suggestion: SpellingSuggestion | null | undefined,
	lookupError: string | null,
	isTranscribing: boolean,
): SpellingSuggestion | null {
	if (lookupError !== null || isTranscribing) return null;
	return suggestion ?? null;
}

type OneSlipEdit =
	| { kind: "insert" }
	| { kind: "delete"; doubled: boolean }
	| { kind: "substitute"; from: string; to: string }
	| { kind: "transpose"; first: string; second: string }
	| { kind: "other" };

/** Which single slip turns `token` into `candidate`; `other` if no single slip does. */
function classifyOneSlipEdit(token: string, candidate: string): OneSlipEdit {
	const typed = token.toLowerCase();
	const word = candidate.toLowerCase();
	if (typed === word) return { kind: "other" };

	if (word.length === typed.length + 1) {
		let index = 0;
		while (index < typed.length && typed[index] === word[index]) index += 1;
		if (typed.slice(index) !== word.slice(index + 1)) return { kind: "other" };
		return { kind: "insert" };
	}

	if (word.length === typed.length - 1) {
		let index = 0;
		while (index < word.length && typed[index] === word[index]) index += 1;
		if (typed.slice(index + 1) !== word.slice(index)) return { kind: "other" };
		const removed = typed[index];
		return {
			kind: "delete",
			doubled: typed[index - 1] === removed || typed[index + 1] === removed,
		};
	}

	if (word.length !== typed.length) return { kind: "other" };

	const differences: number[] = [];
	for (let index = 0; index < typed.length; index += 1) {
		if (typed[index] !== word[index]) differences.push(index);
	}

	const [first, second] = differences;
	if (differences.length === 1 && first !== undefined) {
		return { kind: "substitute", from: typed[first] ?? "", to: word[first] ?? "" };
	}
	if (
		differences.length === 2 &&
		first !== undefined &&
		second === first + 1 &&
		typed[first] === word[first + 1] &&
		typed[first + 1] === word[first]
	) {
		return { kind: "transpose", first: typed[first] ?? "", second: typed[first + 1] ?? "" };
	}

	return { kind: "other" };
}

/**
 * Whether the slip alone justifies the candidate, with no idea how common the word is.
 * It does when nothing the learner typed is contradicted: every letter survives in order
 * (they left one out), a doubled keystroke is dropped, or only vowels move — vowel letters
 * being the ambiguous part of English spelling. Replacing or reordering a consonant guesses
 * at what they meant, and the 126k-word dictionary has such a neighbour for almost anything.
 */
function hasStrongSlipEvidence(edit: OneSlipEdit): boolean {
	switch (edit.kind) {
		case "insert":
			return true;
		case "delete":
			return edit.doubled;
		case "substitute":
			return isVowel(edit.from) && isVowel(edit.to);
		case "transpose":
			return isVowel(edit.first) && isVowel(edit.second);
		default:
			return false;
	}
}

/**
 * Offers a candidate the curated list shows is common, or one the slip itself justifies.
 * Uniqueness is settled after that filter: one candidate only means the search found one.
 */
function pickPlausibleNeighbour(
	token: string,
	candidates: string[],
	frequency: SpellingFrequency,
): string | null {
	const plausible: { word: string; rank: number }[] = [];
	for (const candidate of candidates) {
		const edit = classifyOneSlipEdit(token, candidate);
		if (edit.kind === "other") continue;
		const rank = frequency.rank(candidate);
		if (rank === null && !hasStrongSlipEvidence(edit)) continue;
		plausible.push({ word: candidate, rank: rank ?? NO_FREQUENCY_EVIDENCE_RANK });
	}

	if (plausible.length === 0) return null;
	if (plausible.length === 1) return plausible[0]?.word ?? null;

	const scored = plausible
		.map(({ word, rank }) => ({ word, score: 1 / (rank + 1) }))
		.sort((left, right) => right.score - left.score || left.word.localeCompare(right.word));

	const leader = scored[0];
	const runnerUp = scored[1];
	if (leader === undefined || runnerUp === undefined) return null;
	if (leader.score >= FREQUENCY_LEAD_RATIO * runnerUp.score) return leader.word;
	return null;
}

function applyCapitalization(originalToken: string, dictionarySpelling: string): string {
	const letters = originalToken.replace(/[^A-Za-z]/g, "");
	if (letters.length > 0 && letters === letters.toUpperCase()) {
		return dictionarySpelling.toUpperCase();
	}

	const first = originalToken[0];
	if (first !== undefined && first !== first.toLowerCase()) {
		return dictionarySpelling.charAt(0).toUpperCase() + dictionarySpelling.slice(1);
	}

	return dictionarySpelling;
}

function rewriteOriginal(
	originalText: string,
	replacements: Map<number, string>,
): { suggestedText: string; segments: SpellingSuggestionSegment[] } | null {
	const spans = tokenizeTextWithSpans(originalText);
	if (spans.length === 0) return null;

	const segments: SpellingSuggestionSegment[] = [];
	let cursor = 0;

	for (let index = 0; index < spans.length; index += 1) {
		const span = spans[index];
		if (span === undefined) continue;

		if (span.start > cursor) {
			pushSegment(segments, originalText.slice(cursor, span.start), false);
		}

		const replacement = replacements.get(index);
		if (replacement !== undefined) {
			pushSegment(segments, replacement, true);
		} else {
			pushSegment(segments, originalText.slice(span.start, span.end), false);
		}
		cursor = span.end;
	}

	if (cursor < originalText.length) {
		pushSegment(segments, originalText.slice(cursor), false);
	}

	const suggestedText = segments.map((segment) => segment.text).join("");
	return { suggestedText, segments };
}

function pushSegment(
	segments: SpellingSuggestionSegment[],
	text: string,
	underlined: boolean,
): void {
	if (text.length === 0) return;
	const previous = segments[segments.length - 1];
	if (previous && previous.underlined === underlined) {
		previous.text += text;
		return;
	}
	segments.push({ text, underlined });
}
