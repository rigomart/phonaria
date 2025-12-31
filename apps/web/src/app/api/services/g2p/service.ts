import { lookupManyCmudict } from "./cmudict";
import type { G2PResponse, G2PWord } from "./model";
import { fallbackG2P } from "./phoneme-generator";
import { normalizeCmuWord, tokenizeText } from "./text-processing";

export function isValidText(text: string): boolean {
	return Boolean(text && text.trim().length > 0);
}

export async function processG2P(text: string): Promise<G2PResponse> {
	if (!isValidText(text)) {
		return { words: [] };
	}

	const words = tokenizeText(text);
	const lookups = await lookupManyCmudict(words);
	const results: G2PWord[] = [];

	for (const word of words) {
		if (word.length === 0) continue;

		const variants = lookups.get(normalizeCmuWord(word));
		let phonemeVariants: G2PWord["variants"];
		let source: G2PWord["source"];

		if (variants && variants.length > 0) {
			phonemeVariants = variants;
			source = "cmudict";
		} else {
			phonemeVariants = [fallbackG2P.generatePronunciation(word)];
			source = "fallback";
		}

		results.push({
			word: word.toLowerCase(),
			variants: phonemeVariants,
			source,
		});
	}

	return { words: results };
}
