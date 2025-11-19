import type { G2PPhoneme, G2PSyllable } from "../_schemas/g2p-api.schema";

export class FallbackG2P {
	generatePronunciation(word: string): G2PSyllable[] {
		// Return letters as unknown tokens - we don't guess IPA to avoid teaching incorrect pronunciation
		const phonemes: G2PPhoneme[] = word.split("").map((char) => ({
			cmuToken: char,
			phonemeId: null,
		}));

		return [
			{
				phonemes,
				stress: "none",
			},
		];
	}
}

export const fallbackG2P = new FallbackG2P();
