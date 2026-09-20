import { tokenizeTextWithSpans } from "@/lib/g2p/text-processing";

const VARIANT_ALPHABET = "abcdefghijklmnopqrstuvwxyz'-";
/**
 * Zipf score is `1 / (rank + 1)`. Ten times would silence named stories:
 * `recieve` also neighbours `relieve` (~6.7x) and `dont` neighbours `done` (~3.4x).
 * Three times still keeps similar-rank misses quiet (`from`/`form` at 25 vs 30).
 */
const FREQUENCY_LEAD_RATIO = 3;
const BEYOND_CURATED_RANK = 10_000;

export interface SpellingDictionary {
	has(word: string): boolean;
	rank(word: string): number;
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
	missedTokenIndexes: number[];
	dictionary: SpellingDictionary;
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

export function createSpellingDictionary(ranksByWord: Record<string, number>): SpellingDictionary {
	const ranks = new Map<string, number>();
	for (const [word, rank] of Object.entries(ranksByWord)) {
		ranks.set(word.toLowerCase(), rank);
	}
	return {
		has(word) {
			return ranks.has(word.toLowerCase());
		},
		rank(word) {
			return ranks.get(word.toLowerCase()) ?? BEYOND_CURATED_RANK;
		},
	};
}

export function withExtraHits(
	dictionary: SpellingDictionary,
	extraHits: Iterable<string>,
	extraRank = BEYOND_CURATED_RANK,
): SpellingDictionary {
	const extra = new Set<string>();
	for (const word of extraHits) {
		const normalized = word.toLowerCase().trim();
		if (normalized) extra.add(normalized);
	}
	if (extra.size === 0) return dictionary;

	return {
		has(word) {
			return dictionary.has(word) || extra.has(word.toLowerCase());
		},
		rank(word) {
			if (dictionary.has(word)) return dictionary.rank(word);
			return extraRank;
		},
	};
}

export function suggestSpelling(input: SuggestSpellingInput): SpellingSuggestion | null {
	const { originalText, tokens, missedTokenIndexes, dictionary } = input;
	if (missedTokenIndexes.length === 0) return null;

	const replacements = new Map<number, string>();

	for (const tokenIndex of missedTokenIndexes) {
		const token = tokens[tokenIndex];
		if (token === undefined) continue;

		const offered = pickObviousNeighbour(token, dictionary);
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

function pickObviousNeighbour(token: string, dictionary: SpellingDictionary): string | null {
	const candidates: string[] = [];
	for (const variant of generateOneSlipVariants(token)) {
		if (dictionary.has(variant)) candidates.push(variant);
	}
	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0] ?? null;

	const scored = candidates
		.map((word) => ({ word, score: 1 / (dictionary.rank(word) + 1) }))
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
