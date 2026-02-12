import { getIpaForPhonemeId } from "@phonaria/phonetics-data";
import type { G2PResponse, G2PWord } from "../g2p/model";
import { spanishGraphemeToPhonemes } from "./rules";
import { assignSpanishStressWithAccentIndex } from "./stress";
import { syllabifySpanish } from "./syllabifier";
import { tokenizeSpanishText } from "./tokenizer";

/**
 * Transcribe a single Spanish word to G2P format.
 */
export function transcribeSpanishWord(word: string): G2PWord {
	const { phonemes, accentedVowelIndex } = spanishGraphemeToPhonemes(word);
	const syllables = syllabifySpanish(phonemes, accentedVowelIndex);
	const stressed = assignSpanishStressWithAccentIndex(syllables, word, accentedVowelIndex);

	return {
		word,
		variants: [
			stressed.map((syl) => ({
				phonemes: syl.phonemes.map((p) => ({
					ipa: getIpaForPhonemeId(p.phonemeId),
					phonemeId: p.phonemeId,
					cmuToken: p.phonemeId,
				})),
				stress: syl.stress,
			})),
		],
		source: "rules",
	};
}

/**
 * Transcribe Spanish text to G2P format.
 * Tokenizes the input, runs rule-based G2P on each word,
 * and returns a response compatible with the existing transcription display.
 */
export function transcribeSpanishText(text: string): G2PResponse {
	const tokens = tokenizeSpanishText(text);
	const words = tokens.map(transcribeSpanishWord);
	return { words };
}
