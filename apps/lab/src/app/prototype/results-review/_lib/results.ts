/**
 * PROTOTYPE ONLY — throwaway. Hardcoded post-submit data for wayfinder #130.
 *
 * Shapes follow #133's scorer contract: alignment operations, raw tallies,
 * accepted-alternate flags. Nothing here computes — the numbers are crafted so
 * the reveal has one of every interesting case to render:
 *
 *   about        — correct
 *   problem      — wrong: schwa → strut substitution
 *   banana       — wrong: one schwa omitted
 *   president    — correct, but via a non-first accepted alternate
 *   information  — blank (no answer)
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";

export type AlignmentOp =
	| { kind: "match"; sound: EnglishPhonemeSymbolId }
	| { kind: "substitution"; target: EnglishPhonemeSymbolId; learner: EnglishPhonemeSymbolId }
	| { kind: "omission"; target: EnglishPhonemeSymbolId }
	| { kind: "insertion"; learner: EnglishPhonemeSymbolId };

export interface WordResult {
	word: string;
	syllables: number;
	correct: boolean;
	blank: boolean;
	/** The matched-or-closest accepted pronunciation (#133). */
	reference: EnglishPhonemeSymbolId[];
	learner: EnglishPhonemeSymbolId[];
	ops: AlignmentOp[];
	/** The word has genuinely different accepted pronunciations (#133: 14% of pool). */
	hasAlternates: boolean;
	/** matched sounds and max(learner, reference) length, for pooled accuracy. */
	matched: number;
	span: number;
}

function ops(list: AlignmentOp[]): AlignmentOp[] {
	return list;
}

const m = (sound: EnglishPhonemeSymbolId): AlignmentOp => ({ kind: "match", sound });

export const SESSION_RESULTS: WordResult[] = [
	{
		word: "about",
		syllables: 2,
		correct: true,
		blank: false,
		reference: ["AX", "B", "AU", "T"],
		learner: ["AX", "B", "AU", "T"],
		ops: ops([m("AX"), m("B"), m("AU"), m("T")]),
		hasAlternates: false,
		matched: 4,
		span: 4,
	},
	{
		word: "problem",
		syllables: 2,
		correct: false,
		blank: false,
		reference: ["P", "R", "A", "B", "L", "AX", "M"],
		learner: ["P", "R", "A", "B", "L", "AH", "M"],
		ops: ops([
			m("P"),
			m("R"),
			m("A"),
			m("B"),
			m("L"),
			{ kind: "substitution", target: "AX", learner: "AH" },
			m("M"),
		]),
		hasAlternates: false,
		matched: 6,
		span: 7,
	},
	{
		word: "banana",
		syllables: 3,
		correct: false,
		blank: false,
		reference: ["B", "AX", "N", "AE", "N", "AX"],
		learner: ["B", "N", "AE", "N", "AX"],
		ops: ops([m("B"), { kind: "omission", target: "AX" }, m("N"), m("AE"), m("N"), m("AX")]),
		hasAlternates: false,
		matched: 5,
		span: 6,
	},
	{
		word: "president",
		syllables: 3,
		correct: true,
		blank: false,
		reference: ["P", "R", "E", "Z", "AX", "D", "AX", "N", "T"],
		learner: ["P", "R", "E", "Z", "AX", "D", "AX", "N", "T"],
		ops: ops([m("P"), m("R"), m("E"), m("Z"), m("AX"), m("D"), m("AX"), m("N"), m("T")]),
		hasAlternates: true,
		matched: 9,
		span: 9,
	},
	{
		word: "information",
		syllables: 4,
		correct: false,
		blank: true,
		reference: ["IX", "N", "F", "ER", "M", "EI", "SH", "AX", "N"],
		learner: [],
		ops: ops([
			{ kind: "omission", target: "IX" },
			{ kind: "omission", target: "N" },
			{ kind: "omission", target: "F" },
			{ kind: "omission", target: "ER" },
			{ kind: "omission", target: "M" },
			{ kind: "omission", target: "EI" },
			{ kind: "omission", target: "SH" },
			{ kind: "omission", target: "AX" },
			{ kind: "omission", target: "N" },
		]),
		hasAlternates: false,
		matched: 0,
		span: 9,
	},
];

export const WORDS_CORRECT = SESSION_RESULTS.filter((w) => w.correct).length;
export const WORD_COUNT = SESSION_RESULTS.length;

/** Pooled across the session, per #133 — never averaged per word. */
export const SOUNDS_MATCHED = SESSION_RESULTS.reduce((n, w) => n + w.matched, 0);
export const SOUNDS_TOTAL = SESSION_RESULTS.reduce((n, w) => n + w.span, 0);
export const SOUND_ACCURACY = Math.round((SOUNDS_MATCHED / SOUNDS_TOTAL) * 100);

/** The topic's own figure, derived by filtering tallies to AX (#133). */
export const SCHWA_TARGETS = SESSION_RESULTS.flatMap((w) =>
	w.ops.filter(
		(op) => op.kind !== "insertion" && (op.kind === "match" ? op.sound : op.target) === "AX",
	),
);
export const SCHWA_PLACED = SCHWA_TARGETS.filter((op) => op.kind === "match").length;
export const SCHWA_TOTAL = SCHWA_TARGETS.length;

/**
 * Deterministic, mistake-relevant schwa teaching. Each snippet is keyed to a
 * mistake pattern actually present in the ops — never generic filler. The final
 * copy is fog on the map; these stand in for its shape.
 */
export interface LessonSnippet {
	key: string;
	title: string;
	body: string;
	/** Words in this session that exhibit the mistake. */
	words: string[];
}

export function deriveLessons(results: WordResult[]): LessonSnippet[] {
	const lessons: LessonSnippet[] = [];

	const substituted = results.filter((w) =>
		w.ops.some((op) => op.kind === "substitution" && op.target === "AX"),
	);
	if (substituted.length > 0) {
		lessons.push({
			key: "ax-sub",
			title: "Schwa is not the strut vowel",
			body: "You reached for /ʌ/ (as in cup) where the word wanted /ə/. They can sound close, but /ʌ/ lives in stressed syllables and schwa never does. If the syllable is unstressed and the vowel feels like a mumble, it is almost always /ə/.",
			words: substituted.map((w) => w.word),
		});
	}

	const omitted = results.filter(
		(w) => !w.blank && w.ops.some((op) => op.kind === "omission" && op.target === "AX"),
	);
	if (omitted.length > 0) {
		lessons.push({
			key: "ax-omit",
			title: "Schwa hides, but it is still there",
			body: "You skipped a schwa. Unstressed syllables are easy to swallow — say the word slowly and count the beats: each syllable still needs a vowel, and in English that quiet vowel is usually /ə/.",
			words: omitted.map((w) => w.word),
		});
	}

	const blanks = results.filter((w) => w.blank);
	if (blanks.length > 0) {
		lessons.push({
			key: "blank",
			title: "Blank words still teach",
			body: "You left a word unanswered. That is fine — the accepted pronunciation is shown above so you can study it. Next time, try a guess: even a wrong attempt shows you which sounds you already hear correctly.",
			words: blanks.map((w) => w.word),
		});
	}

	return lessons;
}
