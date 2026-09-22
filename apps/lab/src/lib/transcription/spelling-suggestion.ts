import { tokenizeTextWithSpans } from "@/lib/g2p/text-processing";
import { classifyEdits, type EditScript, isStrongScript } from "./spelling-edits";
import { MAX_EDITS, reachesTwoEdits, type SpellingVocabulary } from "./spelling-search";

/** Exported so the evaluation corpus sweeps this policy rather than a copy of it. */
export interface SuggestionWeights {
	/** One reproduces the policy shipped before issue #248. */
	maxEdits: 1 | 2;
	/** Ten would silence `recieve`/`relieve` (~6.7x) and `dont`/`done` (~3.4x). */
	leadRatio: number;
	/** Scores an unranked candidate just past the curated list, so it still rivals a leader. */
	noFrequencyEvidenceRank: number;
	/** Separates `adress → address` from `dress`, which rank alone cannot: 1279 against 1776. */
	weakPattern: number;
	/**
	 * Undiscounted, `received` denies `receive` its lead and silences `recieve` entirely. A
	 * tenth means a two-edit reading wins only when it is ~30x more common than a one-edit one.
	 */
	twoEdit: number;
}

export const DEFAULT_SUGGESTION_WEIGHTS: SuggestionWeights = {
	maxEdits: MAX_EDITS,
	leadRatio: 3,
	noFrequencyEvidenceRank: 10_000,
	weakPattern: 0.25,
	twoEdit: 0.1,
};

/** A paragraph of nonsense should not become one scan per word. Earliest tokens win. */
export const MAX_EXPANDED_TOKENS_PER_REQUEST = 12;

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
	/** Supplies the curated ranks and the second edit's worth of candidates. */
	vocabulary: SpellingVocabulary;
	/** Defaults to the shipped policy; the evaluation corpus passes swept values. */
	weights?: SuggestionWeights;
}

export function suggestSpelling(input: SuggestSpellingInput): SpellingSuggestion | null {
	const { originalText, tokens, misses, vocabulary } = input;
	const weights = input.weights ?? DEFAULT_SUGGESTION_WEIGHTS;
	if (misses.length === 0) return null;

	const replacements = new Map<number, string>();
	let scansLeft = MAX_EXPANDED_TOKENS_PER_REQUEST;
	// One scan per distinct token: a word repeated across a paragraph is searched once.
	const scanned = new Map<string, string[]>();

	for (const { tokenIndex, candidates } of misses) {
		const token = tokens[tokenIndex];
		if (token === undefined) continue;

		// Server candidates (one edit, full dictionary) and scan candidates share one pool.
		const candidatePool = new Set(candidates.map((candidate) => candidate.toLowerCase()));

		// Short tokens are not charged: their scan only returns curated words one edit out,
		// which the server already supplied, so it would spend budget a later token needs.
		const normalized = token.toLowerCase();
		if (weights.maxEdits > 1 && reachesTwoEdits(normalized)) {
			const already = scanned.get(normalized);
			if (already !== undefined) {
				for (const word of already) candidatePool.add(word);
			} else if (scansLeft > 0) {
				scansLeft -= 1;
				const found = vocabulary.nearWords(normalized);
				scanned.set(normalized, found);
				for (const word of found) candidatePool.add(word);
			}
		}

		const offered = pickPlausibleNeighbour(token, [...candidatePool], vocabulary, weights);
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

interface PlausibleCandidate {
	word: string;
	score: number;
}

type Admission = "on the slip alone" | "needs frequency evidence" | "never";

/**
 * The absolute gate, applied before any candidate meets any other. A single slip contradicting
 * nothing typed stands alone (`aardvrk → aardvark`); anything weaker needs the curated list to
 * vouch for the word. A tighter rank floor was measured and rejected — see the research note.
 */
function admissionFor(script: EditScript): Admission {
	const strong = isStrongScript(script);
	if (script.edits.length === 1) return strong ? "on the slip alone" : "needs frequency evidence";
	return strong ? "needs frequency evidence" : "never";
}

function scoreOf(script: EditScript, rank: number | null, weights: SuggestionWeights): number {
	const patternWeight = isStrongScript(script) ? 1 : weights.weakPattern;
	const editWeight = script.edits.length === 1 ? 1 : weights.twoEdit;
	return (patternWeight * editWeight) / ((rank ?? weights.noFrequencyEvidenceRank) + 1);
}

/**
 * Uniqueness is settled after the gate, never before: one surviving candidate means only that
 * the search found one word. Exported for the corpus, which judges a token at a time.
 */
export function pickPlausibleNeighbour(
	token: string,
	candidates: string[],
	vocabulary: SpellingVocabulary,
	weights: SuggestionWeights = DEFAULT_SUGGESTION_WEIGHTS,
): string | null {
	const plausible: PlausibleCandidate[] = [];
	for (const candidate of candidates) {
		const script = classifyEdits(token, candidate, weights.maxEdits);
		if (script === null) continue;

		const admission = admissionFor(script);
		if (admission === "never") continue;
		const rank = vocabulary.rank(candidate);
		if (rank === null && admission === "needs frequency evidence") continue;

		plausible.push({ word: candidate, score: scoreOf(script, rank, weights) });
	}

	if (plausible.length === 0) return null;

	const scored = plausible.sort(
		(left, right) => right.score - left.score || left.word.localeCompare(right.word),
	);
	const leader = scored[0];
	if (leader === undefined) return null;

	const runnerUp = scored[1];
	if (runnerUp === undefined) return leader.word;
	return leader.score >= weights.leadRatio * runnerUp.score ? leader.word : null;
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
