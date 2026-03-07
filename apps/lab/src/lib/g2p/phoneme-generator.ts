import type { G2PPhoneme, G2PSyllable } from "./model";

export class FallbackG2P {
	generatePronunciation(word: string): G2PSyllable[] {
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
