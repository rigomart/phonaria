import { lookupManyCmudict } from "./cmudict";
import type { G2PWord } from "./model";
import { fallbackG2P } from "./phoneme-generator";
import { normalizeCmuWord } from "./text-processing";

export async function processWords(inputWords: string[]): Promise<G2PWord[]> {
	if (inputWords.length === 0) return [];

	const lookups = await lookupManyCmudict(inputWords);
	const results: G2PWord[] = [];

	for (const word of inputWords) {
		if (word.length === 0) continue;

		const variants = lookups.get(normalizeCmuWord(word));

		if (variants && variants.length > 0) {
			results.push({
				word: word.toLowerCase(),
				variants,
				source: "cmudict",
			});
		} else {
			const lowerWord = word.toLowerCase();
			results.push({
				word: lowerWord,
				variants: [fallbackG2P.generatePronunciation(lowerWord)],
				source: "fallback",
			});
		}
	}

	return results;
}
