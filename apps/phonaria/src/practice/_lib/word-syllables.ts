import { getIpaForPhonemeId } from "@phonaria/phonetics-data";
import { transformToTranscriptionResult } from "@/lib/g2p-client";
import { lookupWordClient } from "@/lib/phoneme-lookup";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";
import type { TranscribedSyllable } from "@/lib/types/g2p";

/**
 * A catalog word's first pronunciation, syllabified with stress for the IPA
 * display. Catalog words have one sound sequence, so the first variant's
 * phoneme positions match the scorer's.
 */
export async function loadWordSyllables(word: string): Promise<TranscribedSyllable[] | null> {
	const found = await lookupWordClient(word).catch(() => null);
	if (!found) return catalogSyllables(word);
	const result = transformToTranscriptionResult(
		{ words: [{ word: found.word, variants: found.variants, source: "cmudict" }] },
		word,
	);
	return result.words[0]?.variants[0] ?? catalogSyllables(word);
}

/** The sounds without syllables or stress, for when the dictionary chunk fails to load. */
function catalogSyllables(word: string): TranscribedSyllable[] | null {
	const ids = CatalogWordPronunciations.get(word)?.[0];
	if (!ids) return null;
	return [
		{
			stress: "none",
			phonemes: ids.map((phonemeId, phonemeIndex) => {
				const ipa = getIpaForPhonemeId(phonemeId);
				return { symbol: ipa, ipa, cmuToken: phonemeId, phonemeId, wordIndex: 0, phonemeIndex };
			}),
		},
	];
}
