import { loadTier2 } from "@/lib/phoneme-lookup/shared";
import { MAX_SPELLING_CONTEXT_CANDIDATES } from "./spelling-context";
import { spellingEditDistanceWithinTwo } from "./spelling-edit-distance";
import type { SpellingMiss } from "./spelling-suggestion";

export type TwoEditCandidateIndex = Map<number, { word: string; rank: number }[]>;

let curatedIndex: TwoEditCandidateIndex | null = null;

export function createTwoEditCandidateIndex(rankedWords: readonly string[]): TwoEditCandidateIndex {
	const index: TwoEditCandidateIndex = new Map();
	for (const [rank, word] of rankedWords.entries()) {
		const words = index.get(word.length) ?? [];
		words.push({ word, rank });
		index.set(word.length, words);
	}
	return index;
}

export async function loadTwoEditCandidateIndex(): Promise<TwoEditCandidateIndex> {
	if (curatedIndex) return curatedIndex;
	curatedIndex = createTwoEditCandidateIndex(Object.keys((await loadTier2()).words));
	return curatedIndex;
}

/** Curated words are supplied in frequency order. Only the context chooser uses these. */
export function findTwoEditCandidates(token: string, index: TwoEditCandidateIndex): string[] {
	const normalized = token.toLowerCase();
	if (!/^[a-z]{5,}$/.test(normalized)) return [];

	const candidates: { word: string; rank: number }[] = [];
	for (let length = normalized.length - 2; length <= normalized.length + 2; length += 1) {
		for (const entry of index.get(length) ?? []) {
			if (spellingEditDistanceWithinTwo(normalized, entry.word) === 2) candidates.push(entry);
		}
	}
	return candidates
		.sort((left, right) => left.rank - right.rank)
		.slice(0, 10)
		.map(({ word }) => word);
}

/** Keep all one-edit options and fill only the Jev request's remaining slots. */
export function withTwoEditCandidates(
	tokens: string[],
	misses: SpellingMiss[],
	findCandidates: (token: string) => string[],
): SpellingMiss[] {
	return misses.map(({ tokenIndex, candidates }) => {
		const token = tokens[tokenIndex] ?? "";
		const combined = [...new Set(candidates)];
		if (combined.length < MAX_SPELLING_CONTEXT_CANDIDATES && /^[a-z]{5,}$/i.test(token)) {
			for (const word of findCandidates(token)) {
				if (combined.includes(word)) continue;
				combined.push(word);
				if (combined.length === MAX_SPELLING_CONTEXT_CANDIDATES) break;
			}
		}
		return { tokenIndex, candidates: combined };
	});
}
