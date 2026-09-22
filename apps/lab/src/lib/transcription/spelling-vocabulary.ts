import { loadTier2 } from "@/lib/phoneme-lookup/shared";
import {
	createSpellingVocabulary,
	ranksFromOrder,
	type SpellingVocabulary,
} from "./spelling-search";

let vocabulary: SpellingVocabulary | null = null;

/**
 * Built from the curated top-10k the browser already loads for Practice, and used for both
 * frequency evidence and the two-edit search. A word outside the list gets no rank — the list
 * has nothing to say about it, which is not the same as knowing it is rare. Built once.
 */
export async function loadSpellingVocabulary(): Promise<SpellingVocabulary> {
	if (vocabulary) return vocabulary;
	const tier2 = await loadTier2();
	vocabulary = createSpellingVocabulary(ranksFromOrder(Object.keys(tier2.words)));
	return vocabulary;
}
