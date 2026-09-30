/**
 * Pure helpers for matching minimal pairs against curated CMU pronunciations.
 * Shared by the contrast catalog's validation test and the candidate-pair
 * script, so both apply one definition of "differs by exactly one sound".
 */
import type { PhonemeSymbolId } from "../../core/ipa-map";
import { extractBasePhonemeId } from "./cmu-arpa";

/** Phoneme IDs of one CMU variant (e.g. "S I1 T"), stress digits removed. */
export function toBasePhonemeIds(variant: string): PhonemeSymbolId[] {
	return variant.split(" ").map(extractBasePhonemeId);
}

/**
 * The one pronunciation a word can be taught with, or null when its CMU
 * variants disagree beyond stress. A word with competing pronunciations is an
 * ambiguous stimulus: the learner cannot know which sound to listen for.
 */
export function getSinglePronunciation(
	variants: readonly string[],
): readonly PhonemeSymbolId[] | null {
	const [first, ...rest] = variants.map(toBasePhonemeIds);
	if (!first) return null;
	const key = first.join(" ");
	return rest.every((ids) => ids.join(" ") === key) ? first : null;
}

export interface PhonemeSubstitution {
	index: number;
	from: PhonemeSymbolId;
	to: PhonemeSymbolId;
}

/**
 * Where two pronunciations differ by exactly one substituted sound, or null
 * when they differ in length, in more than one place, or not at all.
 */
export function findSubstitution(
	from: readonly PhonemeSymbolId[],
	to: readonly PhonemeSymbolId[],
): PhonemeSubstitution | null {
	if (from.length !== to.length) return null;
	let substitution: PhonemeSubstitution | null = null;
	for (let index = 0; index < from.length; index++) {
		if (from[index] === to[index]) continue;
		if (substitution) return null;
		substitution = { index, from: from[index], to: to[index] };
	}
	return substitution;
}
