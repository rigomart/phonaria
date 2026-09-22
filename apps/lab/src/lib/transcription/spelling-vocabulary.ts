import { loadTier2 } from "@/lib/phoneme-lookup/shared";
import {
	createSpellingVocabulary,
	ranksFromOrder,
	type SpellingVocabulary,
} from "./spelling-search";

let vocabulary: SpellingVocabulary | null = null;

/**
 * The suggestion vocabulary, built from the curated top-10k the browser already loads for
 * Practice. It supplies two things at once: frequency evidence, where a word outside the list
 * gets no rank because the list has nothing to say about it — which is not the same as knowing
 * the word is rare — and the word set the bounded two-edit search scans.
 *
 * Built once per session, so the index cost is paid on the first transcription that misses the
 * dictionary and never again.
 */
export async function loadSpellingVocabulary(): Promise<SpellingVocabulary> {
	if (vocabulary) return vocabulary;
	const tier2 = await loadTier2();
	vocabulary = createSpellingVocabulary(ranksFromOrder(Object.keys(tier2.words)));
	return vocabulary;
}
