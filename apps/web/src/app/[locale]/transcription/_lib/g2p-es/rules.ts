import { getIpaForPhonemeId, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { SpanishPhoneme } from "./types";

interface RulesResult {
	phonemes: SpanishPhoneme[];
	/** Index of the vowel phoneme that carried an orthographic accent mark, or null. */
	accentedVowelIndex: number | null;
}

function phoneme(id: PhonemeSymbolId): SpanishPhoneme {
	return { phonemeId: id, ipa: getIpaForPhonemeId(id) };
}

function isAccentedVowel(ch: string): boolean {
	return "áéíóú".includes(ch);
}

/**
 * Convert a Spanish word to a sequence of phonemes using rule-based G2P.
 * Implements Latin American Spanish (seseo, yeismo).
 *
 * Cursor-based left-to-right scanner with greedy digraph matching.
 */
export function spanishGraphemeToPhonemes(word: string): RulesResult {
	const phonemes: SpanishPhoneme[] = [];
	let accentedVowelIndex: number | null = null;
	let i = 0;

	while (i < word.length) {
		const ch = word[i];
		const next = i + 1 < word.length ? word[i + 1] : "";
		const afterNext = i + 2 < word.length ? word[i + 2] : "";

		// Digraphs (longest first)
		if (ch === "c" && next === "h") {
			phonemes.push(phoneme("CH"));
			i += 2;
			continue;
		}

		if (ch === "l" && next === "l") {
			phonemes.push(phoneme("YH"));
			i += 2;
			continue;
		}

		if (ch === "r" && next === "r") {
			phonemes.push(phoneme("RR"));
			i += 2;
			continue;
		}

		if (ch === "q" && next === "u") {
			// qu: u is always silent (standard Spanish only uses qu before e/i)
			phonemes.push(phoneme("K"));
			i += 2;
			continue;
		}

		if (ch === "g" && next === "u") {
			// gu before e/i: u is silent
			if (afterNext === "e" || afterNext === "i" || afterNext === "é" || afterNext === "í") {
				phonemes.push(phoneme("G"));
				i += 2; // skip the u
				continue;
			}
		}

		// g + ü (dieresis u): G + W
		if (ch === "g" && next === "ü") {
			phonemes.push(phoneme("G"));
			phonemes.push(phoneme("W"));
			i += 2;
			continue;
		}

		// Single consonants with context
		if (ch === "c") {
			if (next === "e" || next === "i" || next === "é" || next === "í") {
				phonemes.push(phoneme("S")); // seseo
			} else {
				phonemes.push(phoneme("K"));
			}
			i++;
			continue;
		}

		if (ch === "g") {
			if (next === "e" || next === "i" || next === "é" || next === "í") {
				phonemes.push(phoneme("X")); // /x/ before e/i
			} else {
				phonemes.push(phoneme("G"));
			}
			i++;
			continue;
		}

		if (ch === "r") {
			// word-initial, or after n/l/s -> trill
			if (i === 0) {
				phonemes.push(phoneme("RR"));
			} else {
				const prev = word[i - 1];
				if (prev === "n" || prev === "l" || prev === "s") {
					phonemes.push(phoneme("RR"));
				} else {
					phonemes.push(phoneme("RX")); // tap
				}
			}
			i++;
			continue;
		}

		if (ch === "y") {
			if (i === word.length - 1) {
				phonemes.push(phoneme("I")); // word-final y is vowel /i/
			} else {
				phonemes.push(phoneme("YH")); // consonantal y
			}
			i++;
			continue;
		}

		if (ch === "x") {
			phonemes.push(phoneme("K"));
			phonemes.push(phoneme("S"));
			i++;
			continue;
		}

		if (ch === "ñ") {
			phonemes.push(phoneme("NY"));
			i++;
			continue;
		}

		// Simple consonant mappings
		if (ch === "b" || ch === "v") {
			phonemes.push(phoneme("B"));
			i++;
			continue;
		}
		if (ch === "z") {
			phonemes.push(phoneme("S")); // seseo
			i++;
			continue;
		}
		if (ch === "j") {
			phonemes.push(phoneme("X"));
			i++;
			continue;
		}
		if (ch === "h") {
			i++; // silent
			continue;
		}
		if (ch === "d") {
			phonemes.push(phoneme("D"));
			i++;
			continue;
		}
		if (ch === "f") {
			phonemes.push(phoneme("F"));
			i++;
			continue;
		}
		if (ch === "k") {
			phonemes.push(phoneme("K"));
			i++;
			continue;
		}
		if (ch === "l") {
			phonemes.push(phoneme("L"));
			i++;
			continue;
		}
		if (ch === "m") {
			phonemes.push(phoneme("M"));
			i++;
			continue;
		}
		if (ch === "n") {
			phonemes.push(phoneme("N"));
			i++;
			continue;
		}
		if (ch === "p") {
			phonemes.push(phoneme("P"));
			i++;
			continue;
		}
		if (ch === "s") {
			phonemes.push(phoneme("S"));
			i++;
			continue;
		}
		if (ch === "t") {
			phonemes.push(phoneme("T"));
			i++;
			continue;
		}
		if (ch === "w") {
			phonemes.push(phoneme("W"));
			i++;
			continue;
		}

		// Vowels
		if (ch === "a" || ch === "á") {
			if (isAccentedVowel(ch)) accentedVowelIndex = phonemes.length;
			phonemes.push(phoneme("AA"));
			i++;
			continue;
		}
		if (ch === "e" || ch === "é") {
			if (isAccentedVowel(ch)) accentedVowelIndex = phonemes.length;
			phonemes.push(phoneme("EE"));
			i++;
			continue;
		}
		if (ch === "i" || ch === "í") {
			if (isAccentedVowel(ch)) accentedVowelIndex = phonemes.length;
			phonemes.push(phoneme("I"));
			i++;
			continue;
		}
		if (ch === "o" || ch === "ó") {
			if (isAccentedVowel(ch)) accentedVowelIndex = phonemes.length;
			phonemes.push(phoneme("OO"));
			i++;
			continue;
		}
		if (ch === "u" || ch === "ú" || ch === "ü") {
			if (isAccentedVowel(ch)) accentedVowelIndex = phonemes.length;
			phonemes.push(phoneme("U"));
			i++;
			continue;
		}

		// Skip unknown characters
		i++;
	}

	return { phonemes, accentedVowelIndex };
}
