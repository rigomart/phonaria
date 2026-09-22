import { tokenizeTextWithSpans } from "@/lib/g2p/text-processing";
import { classifyEdits, type EditScript, isStrongScript } from "./spelling-edits";
import { MAX_EDITS, type SpellingVocabulary } from "./spelling-search";

/**
 * The policy's numbers, in one place and passable, because the evaluation corpus has to sweep
 * them. Exported so `scripts/review-spelling-cases.ts` drives *this* code at every swept point
 * rather than a copy of it: the threshold tables in the research note are only worth anything
 * if the thing measured is the thing that ships.
 */
export interface SuggestionWeights {
	/** The widest slip to read. One reproduces the policy shipped before issue #248. */
	maxEdits: 1 | 2;
	/**
	 * Zipf score is `1 / (rank + 1)`. Ten times would silence named stories:
	 * `recieve` also neighbours `relieve` (~6.7x) and `dont` neighbours `done` (~3.4x).
	 * Three times still keeps similar-rank misses quiet (`from`/`form` at 25 vs 30).
	 */
	leadRatio: number;
	/** Scores an unranked candidate just past the curated list, so it still rivals a leader. */
	noFrequencyEvidenceRank: number;
	/**
	 * How much a weak edit pattern discounts a candidate when separating rivals. This is what
	 * lets `adress → address` (a letter left out) beat `dress` (a letter dropped), which rank
	 * alone could not separate: 1279 against 1776 is nowhere near a 3x lead.
	 */
	weakPattern: number;
	/**
	 * How much the second edit discounts a candidate against a one-edit rival.
	 *
	 * This is the knob the wider search made necessary. A second edit is far less likely than a
	 * first, and a two-edit neighbour of a common word is often itself a common word: `recieve`
	 * is one edit from `receive` and two from `received`. Left undiscounted, that rival denies
	 * `receive` its lead and the offer disappears — the ticket's "more misleading competitors",
	 * exactly. At a tenth, a two-edit reading wins only when it is roughly thirty times more
	 * common than the one-edit reading it displaces. The tuning split is flat from 0.15 down to
	 * 0.05; a tenth is the round value in that range.
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

/**
 * Per-request ceiling on vocabulary scans. Each scan is bounded on its own, but a paragraph
 * of nonsense should not turn into one scan per word. Earlier tokens win the budget: the
 * learner reads the offer left to right, and the order is then independent of the data.
 */
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

	for (const { tokenIndex, candidates } of misses) {
		const token = tokens[tokenIndex];
		if (token === undefined) continue;

		// The server searched the full dictionary one edit out; the vocabulary scan reaches
		// the second edit. Both feed one pool, and the policy judges each candidate the same.
		const candidatePool = new Set(candidates.map((candidate) => candidate.toLowerCase()));
		if (weights.maxEdits > 1 && scansLeft > 0) {
			scansLeft -= 1;
			for (const word of vocabulary.nearWords(token)) candidatePool.add(word);
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
 * The absolute plausibility gate, applied before any candidate is compared with any other.
 *
 * Read the tiers as one sentence. A single slip that contradicts nothing the learner typed
 * stands on its own, with no idea how common the word is — that is what keeps
 * `aardvrk → aardvark` alive. Any weaker reading has to be carried by the curated list
 * vouching for the word. And two edits are read only when *both* contradict nothing: two weak
 * edits is not slip recovery but a search for anything nearby, and something is always nearby.
 *
 * A tighter floor than curated membership was measured and rejected. Capping weak readings at
 * a better rank than 10,000 cost one-slip recovery (83% down to 62% at a 5,000 cap) and *raised*
 * the wrong-offer rate, because dropping a correct leader can leave a wrong rival standing
 * alone. See the research note.
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
 * Offers the candidate the evidence supports, or nothing. Uniqueness is settled after the
 * plausibility gate, never before it: finding exactly one candidate says only that the search
 * found one word.
 *
 * Exported for the evaluation corpus, which judges one token at a time and assembles its own
 * candidate pool so it can reproduce the one-edit baseline.
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
