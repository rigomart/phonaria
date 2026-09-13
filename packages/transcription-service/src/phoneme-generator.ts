import type { TranscriptionPhoneme, TranscriptionSyllable } from "./contract";

/**
 * Fallback G2P generator for words not found in the dictionary.
 * Generates a simple character-by-character transcription.
 */
export class FallbackG2P {
	generatePronunciation(word: string): TranscriptionSyllable[] {
		const phonemes: TranscriptionPhoneme[] = word.split("").map((char) => ({
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
