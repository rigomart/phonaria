import { z } from "zod";
import { type TextTokenSpan, tokenizeTextWithSpans } from "@/lib/g2p/text-processing";
import type { AskJev, JevChoiceQuestion } from "@/lib/jev/client";
import {
	type SpellingContextInput,
	type SpellingContextOutput,
	type SpellingContextPick,
	spellingContextInputSchema,
} from "./spelling-context";
import { isOneSlipNeighbour } from "./spelling-suggestion";

/**
 * Most text sent to Jev. Generous next to the 200-character transcription box, so in practice
 * the learner's whole input goes; the cap holds if either limit changes. Whole words only.
 */
export const SPELLING_CONTEXT_MAX_CHARS = 300;
/** Below this, a pick is treated as silence. Validated at 0.7 in issue #262. */
export const SPELLING_CONTEXT_MIN_CONFIDENCE = 0.7;
/** Not a dictionary spelling, so it cannot collide with a candidate such as `none`. */
export const NONE_OPTION = "none_of_these";

const NONE_CRITERION =
	"None of these: the typed word is a name, a made-up or foreign word, or none of the options fits the sentence.";

type AskedMiss = { tokenIndex: number; token: string; candidates: string[] };

export type SpellingContextPlan = {
	excerpt: string;
	asked: AskedMiss[];
	questions: Record<string, JevChoiceQuestion>;
};

export type ChooseSpellingDependencies = { askJev: AskJev };

export class SpellingContextValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SpellingContextValidationError";
	}
}

function questionKey(tokenIndex: number): string {
	return `miss_${tokenIndex}`;
}

/**
 * Keeps only what the server can vouch for: the token is re-read from the text, and each
 * candidate must be one slip from it. A client cannot turn this into a free text classifier.
 */
function verifiedMisses(input: SpellingContextInput, spans: TextTokenSpan[]): AskedMiss[] {
	const asked: AskedMiss[] = [];
	const seen = new Set<number>();
	for (const { tokenIndex, candidates } of input.misses) {
		if (seen.has(tokenIndex)) continue;
		seen.add(tokenIndex);
		const token = spans[tokenIndex]?.token;
		if (token === undefined) continue;
		const verified = [...new Set(candidates.map((candidate) => candidate.toLowerCase()))].filter(
			(candidate) => isOneSlipNeighbour(token, candidate),
		);
		if (verified.length > 0) asked.push({ tokenIndex, token, candidates: verified });
	}
	return asked.sort((left, right) => left.tokenIndex - right.tokenIndex);
}

/**
 * The widest run of whole words around the misses that fits `maxChars`. Misses that cannot
 * share a window with the first one are dropped, and the browser's rule covers them.
 */
export function buildExcerpt(
	text: string,
	spans: TextTokenSpan[],
	missIndexes: number[],
	maxChars: number,
): { excerpt: string; coveredIndexes: number[] } | null {
	const first = missIndexes[0];
	if (first === undefined) return null;

	const trimmed = text.trim();
	if (trimmed.length <= maxChars) return { excerpt: trimmed, coveredIndexes: missIndexes };

	const width = (left: number, right: number) =>
		(spans[right]?.end ?? 0) - (spans[left]?.start ?? 0);
	if (width(first, first) > maxChars) return null;

	const coveredIndexes = missIndexes.filter((index) => width(first, index) <= maxChars);
	let left = first;
	let right = coveredIndexes[coveredIndexes.length - 1] ?? first;

	let grew = true;
	while (grew) {
		grew = false;
		if (left > 0 && width(left - 1, right) <= maxChars) {
			left -= 1;
			grew = true;
		}
		if (right < spans.length - 1 && width(left, right + 1) <= maxChars) {
			right += 1;
			grew = true;
		}
	}

	const start = spans[left]?.start ?? 0;
	let end = spans[right]?.end ?? start;
	// Closing punctuation ("email?") tells the model how the sentence ends.
	while (end < text.length && end - start < maxChars && /[^\s\w'-]/.test(text[end] ?? "")) {
		end += 1;
	}
	return { excerpt: text.slice(start, end), coveredIndexes };
}

export function planSpellingContext(
	input: SpellingContextInput,
	maxChars = SPELLING_CONTEXT_MAX_CHARS,
): SpellingContextPlan | null {
	const spans = tokenizeTextWithSpans(input.text);
	const verified = verifiedMisses(input, spans);
	const window = buildExcerpt(
		input.text,
		spans,
		verified.map((miss) => miss.tokenIndex),
		maxChars,
	);
	if (window === null) return null;

	const covered = new Set(window.coveredIndexes);
	const asked = verified.filter((miss) => covered.has(miss.tokenIndex));
	const questions: Record<string, JevChoiceQuestion> = {};
	for (const { tokenIndex, token, candidates } of asked) {
		const criteria: Record<string, string> = {};
		for (const candidate of candidates) {
			criteria[candidate] = `They meant the word "${candidate}".`;
		}
		criteria[NONE_OPTION] = NONE_CRITERION;
		questions[questionKey(tokenIndex)] = {
			type: "choice",
			instructions: `An English learner typed this sentence. The pronunciation dictionary does not know the word "${token}". Which word did they most likely mean? Only pick a word if it fits the sentence.`,
			criteria,
		};
	}

	return { excerpt: window.excerpt, asked, questions };
}

const choiceAnswerSchema = z.object({
	choice: z.string(),
	confidence: z.number(),
});

/** Unreadable answers are left out, so the rule decides those tokens instead of silence. */
export function readSpellingContextAnswers(
	plan: SpellingContextPlan,
	answers: Record<string, unknown>,
	minConfidence = SPELLING_CONTEXT_MIN_CONFIDENCE,
): SpellingContextPick[] {
	const picks: SpellingContextPick[] = [];
	for (const { tokenIndex, candidates } of plan.asked) {
		const parsed = choiceAnswerSchema.safeParse(answers[questionKey(tokenIndex)]);
		if (!parsed.success) continue;
		const { choice, confidence } = parsed.data;
		const offered = confidence >= minConfidence && candidates.includes(choice);
		picks.push({ tokenIndex, word: offered ? choice : null });
	}
	return picks;
}

/**
 * Framework-neutral entry point. Throws `SpellingContextValidationError` for malformed input;
 * lets Jev failures propagate so the Worker adapter can log them and answer `unavailable`.
 */
export async function chooseSpellingInContext(
	input: unknown,
	dependencies: ChooseSpellingDependencies,
): Promise<SpellingContextOutput> {
	const parsed = spellingContextInputSchema.safeParse(input);
	if (!parsed.success) {
		throw new SpellingContextValidationError(
			parsed.error.issues[0]?.message ?? "Invalid spelling context request",
		);
	}

	const plan = planSpellingContext(parsed.data);
	if (plan === null || plan.asked.length === 0) return { status: "answered", picks: [] };

	const answers = await dependencies.askJev({
		state: { sentence: plan.excerpt },
		questions: plan.questions,
	});
	return { status: "answered", picks: readSpellingContextAnswers(plan, answers) };
}
