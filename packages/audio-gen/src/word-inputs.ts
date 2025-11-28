import type { TtsInput } from "./providers/types";
import { collectWordsWithPhonemic } from "./words";

/**
 * Wraps text in SSML with phoneme pronunciation using CMU ARPA (ARPAbet).
 * If CMU ARPA is not available, falls back to plain text.
 */
function wrapWithSsml(word: string, cmuArpa?: string): string {
	if (!cmuArpa) {
		// Fallback to plain text if no CMU ARPA available
		return word;
	}

	// ElevenLabs uses <phoneme> tag with alphabet="ipa" or alphabet="cmu-arpabet"
	// CMU ARPA format uses space-separated tokens
	return `<speak><phoneme alphabet="cmu-arpabet" ph="${cmuArpa}">${word}</phoneme></speak>`;
}

export function getWordInputs(limit?: number): TtsInput[] {
	const words = collectWordsWithPhonemic();
	const selected = limit ? words.slice(0, limit) : words;

	return selected.map(({ word, cmuArpa }) => ({
		id: word,
		text: wrapWithSsml(word, cmuArpa),
	}));
}
