import { z } from "zod";
import type { SpellingMiss } from "./spelling-suggestion";

/**
 * Context-aware spelling suggestions: the Worker asks Jev which dictionary neighbour a missed
 * token meant, given the words around it. Browser-safe contract; the service lives in
 * `spelling-context-service.ts`.
 */

/** Hard input limit. The transcription box allows 200 characters, so this only stops abuse. */
export const MAX_SPELLING_CONTEXT_TEXT_LENGTH = 1_000;
/** Jev accepts at most 255 options per question, one of which is "none of these". */
export const MAX_SPELLING_CONTEXT_CANDIDATES = 100;
export const MAX_SPELLING_CONTEXT_MISSES = 8;
const MAX_CANDIDATE_LENGTH = 64;

export const spellingContextInputSchema = z.object({
	text: z.string().min(1).max(MAX_SPELLING_CONTEXT_TEXT_LENGTH),
	misses: z
		.array(
			z.object({
				tokenIndex: z.number().int().min(0),
				candidates: z
					.array(z.string().min(1).max(MAX_CANDIDATE_LENGTH))
					.min(1)
					.max(MAX_SPELLING_CONTEXT_CANDIDATES),
			}),
		)
		.min(1)
		.max(MAX_SPELLING_CONTEXT_MISSES),
});

export type SpellingContextInput = z.infer<typeof spellingContextInputSchema>;

/** `word: null` means the sentence did not support any candidate: stay silent. */
export type SpellingContextPick = { tokenIndex: number; word: string | null };

/**
 * `unavailable` is not a learner-facing failure: the browser falls back to the frequency
 * rule. Tokens missing from `picks` (not asked, or answered unreadably) fall back the same way.
 */
export type SpellingContextOutput =
	| { status: "answered"; picks: SpellingContextPick[] }
	| { status: "unavailable" };

export type ChooseSpellingInContextFn = (
	input: SpellingContextInput,
) => Promise<SpellingContextOutput>;

/**
 * The request for the misses worth asking about, or null when none are. Misses with no
 * candidates have nothing to choose from; oversized ones are left to the rule.
 */
export function buildSpellingContextRequest(
	text: string,
	misses: SpellingMiss[],
): SpellingContextInput | null {
	if (text.length > MAX_SPELLING_CONTEXT_TEXT_LENGTH) return null;
	const asked = misses
		.filter(
			({ candidates }) =>
				candidates.length > 0 && candidates.length <= MAX_SPELLING_CONTEXT_CANDIDATES,
		)
		.slice(0, MAX_SPELLING_CONTEXT_MISSES)
		.map(({ tokenIndex, candidates }) => ({ tokenIndex, candidates }));
	if (asked.length === 0) return null;
	return { text, misses: asked };
}

export function spellingContextPicksByToken(
	output: SpellingContextOutput | null,
): Map<number, string | null> {
	const picks = new Map<number, string | null>();
	if (output?.status !== "answered") return picks;
	for (const { tokenIndex, word } of output.picks) picks.set(tokenIndex, word);
	return picks;
}
