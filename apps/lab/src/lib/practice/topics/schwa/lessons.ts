/**
 * Mistake-keyed lesson selection for the schwa topic (#140).
 *
 * Six deterministic patterns in fixed catalog order. Patterns 1–5 key on
 * alignment ops — each op maps to exactly one pattern or none — and pattern 6
 * keys on blank words, which are excluded from the op-keyed patterns
 * entirely. All triggered notes show; nothing is ranked or capped.
 */

import type { AlignmentOp } from "../../scoring";
import type { LessonNote, LessonWordResult } from "../types";

// Palette-space phoneme IDs the patterns key on. Note: ARPA "IH" normalizes
// to the ID `IX`, so the kit vowel is keyed as IX here.
const SCHWA = "AX";
const STRUT = "AH";
const KIT = "IX";

/** Pattern ids, so `classifyOp` and the catalog cannot silently drift apart. */
type SchwaLessonId =
	| "schwa-omitted"
	| "schwa-vs-strut"
	| "schwa-vs-kit"
	| "schwa-spelling"
	| "schwa-misplaced"
	| "blank-word";

const BLANK_WORD_ID: SchwaLessonId = "blank-word";

/**
 * The six notes in the order the reveal renders them. Bodies are
 * learner-facing copy from the PRD — keep them verbatim, including the
 * `*word*` emphasis the disclosure renders as italics.
 */
const catalog: readonly (Omit<LessonNote, "words"> & { id: SchwaLessonId })[] = [
	{
		id: "schwa-omitted",
		title: "The schwa you skipped",
		body: "Say the word slowly and count the beats. Every syllable needs a vowel, and in the syllables nobody stresses, that vowel is usually the quiet /ə/. It's easy to swallow — but it's there.",
	},
	{
		id: "schwa-vs-strut",
		title: "Stressed out: /ə/ vs. /ʌ/",
		body: "You reached for /ʌ/ (as in *cup*). It's the closest full vowel to schwa, but it only shows up in stressed syllables — /ə/ never carries stress. If the syllable is the quiet one, go with /ə/.",
	},
	{
		id: "schwa-vs-kit",
		title: "So close: /ə/ vs. /ɪ/",
		body: "You picked /ɪ/ (as in *kit*) where the answer wants /ə/. Honestly, these two blur together in unstressed syllables — even dictionaries argue about it. The dictionary we grade against hears /ə/ here, so when you're torn, let the mumble win.",
	},
	{
		id: "schwa-spelling",
		title: "The letter is bluffing",
		body: "You gave the vowel its full spelling sound — the one the letter advertises. In unstressed syllables, English quietly swaps that vowel for /ə/, no matter what's written. Trust the stress, not the spelling.",
	},
	{
		id: "schwa-misplaced",
		title: "Schwa in the wrong seat",
		body: "You used /ə/ where the word doesn't have one — either in a stressed syllable, which keeps its full vowel, or as an extra beat the word doesn't have. Schwa only lives in unstressed syllables that are really there.",
	},
	{
		id: BLANK_WORD_ID,
		title: "About the blank one",
		body: "You left this word blank — that's fine. Its pronunciation is up in the list, and every symbol is tappable if you want to explore it. Next time, take a guess: even a wrong answer shows you which sounds you already hear.",
	},
];

/** Keys one alignment op to exactly one pattern id, or none. */
function classifyOp(op: AlignmentOp): SchwaLessonId | null {
	switch (op.kind) {
		case "omission":
			return op.target === SCHWA ? "schwa-omitted" : null;
		case "substitution":
			if (op.target === SCHWA) {
				if (op.source === STRUT) return "schwa-vs-strut";
				if (op.source === KIT) return "schwa-vs-kit";
				return "schwa-spelling";
			}
			// Target ≠ AX here, so a schwa source means schwa in the wrong seat.
			return op.source === SCHWA ? "schwa-misplaced" : null;
		case "insertion":
			return op.source === SCHWA ? "schwa-misplaced" : null;
		case "match":
			return null;
	}
}

/**
 * Selects the triggered schwa notes for one session's scored words. Each
 * note lists its triggering words in session order, naming a word at most
 * once even when several of its ops qualify.
 */
export function selectSchwaLessons(results: readonly LessonWordResult[]): LessonNote[] {
	const wordsByPattern = new Map<SchwaLessonId, string[]>();
	const record = (patternId: SchwaLessonId, word: string) => {
		const words = wordsByPattern.get(patternId) ?? [];
		if (!words.includes(word)) words.push(word);
		wordsByPattern.set(patternId, words);
	};

	for (const result of results) {
		if (result.blank) {
			record(BLANK_WORD_ID, result.word);
			continue;
		}
		for (const op of result.ops) {
			const patternId = classifyOp(op);
			if (patternId !== null) record(patternId, result.word);
		}
	}

	return catalog
		.filter((pattern) => wordsByPattern.has(pattern.id))
		.map((pattern) => ({ ...pattern, words: wordsByPattern.get(pattern.id) ?? [] }));
}
