/**
 * Enhanced Fallback G2P System
 * Provides intelligent pronunciation for words not in CMUdict
 * Phase 1: Enhanced fallback with pattern recognition
 */

// Module-level constants (shared across all instances)
const CONSONANT_MAP: Record<string, string> = {
	b: "b",
	c: "k", // default to /k/, but can be /s/ before e,i,y
	d: "d",
	f: "f",
	g: "ɡ", // default to /ɡ/, but can be /dʒ/ before e,i,y
	h: "h",
	j: "dʒ",
	k: "k",
	l: "l",
	m: "m",
	n: "n",
	p: "p",
	q: "k",
	r: "ɹ",
	s: "s",
	t: "t",
	v: "v",
	w: "w",
	x: "z", // default to /z/, but can be /ks/ or /ɡz/
	y: "j",
	z: "z",
};

const VOWEL_MAP: Record<string, string> = {
	a: "æ", // default, but can be /eɪ/ before final e
	e: "ɛ", // default, but silent at word end
	i: "ɪ", // default, but can be /aɪ/ before final e
	o: "ɔ", // default, but can be /oʊ/ before final e
	u: "ʌ", // default, but can be /uː/ or /juː/
};

const DIGRAPHS: Record<string, string> = {
	// Consonant digraphs
	th: "θ", // "think", "bath"
	ch: "tʃ", // "church", "cheese"
	sh: "ʃ", // "shop", "fish"
	ph: "f", // "phone", "iPhone"
	wh: "w", // "what", "when"
	gh: "f", // "laugh", "enough" (often silent)
	ck: "k", // "back", "check"
	ng: "ŋ", // "sing", "long"
	qu: "k", // "quick", "queen" (followed by /w/)

	// Vowel digraphs and trigraphs
	ea: "iː", // "read", "sea"
	ee: "iː", // "see", "tree"
	ie: "aɪ", // "pie", "lie"
	oe: "oʊ", // "toe", "foe"
	ue: "uː", // "blue", "true"
	ai: "eɪ", // "rain", "main"
	ay: "eɪ", // "day", "play"
	oi: "ɔɪ", // "coin", "boy"
	oy: "ɔɪ", // "toy", "enjoy"
	ou: "aʊ", // "house", "out"
	ow: "aʊ", // "cow", "now"
	oo: "uː", // "moon", "food"
	au: "ɔː", // "caught", "taught"
	aw: "ɔː", // "law", "saw"

	// Trigraphs
	igh: "aɪ", // "high", "night"
	eigh: "eɪ", // "eight", "weight"
};

const SILENT_PATTERNS: Record<string, string> = {
	kn: "n", // "know", "knee"
	wr: "ɹ", // "write", "wrong" - silent w, keep r sound
	mb: "m", // "thumb", "climb" (often silent b)
	gn: "n", // "gnat", "sign"
	ps: "s", // "psychology", "psalm"
	sc: "s", // "science", "scene" (before e,i)
};

const SOFT_C = new Set(["e", "i", "y"]);
const SOFT_G = new Set(["e", "i", "y"]);

export class FallbackG2P {
	/**
	 * Generate pronunciation for unknown words using pattern recognition.
	 * Processes the word through these stages: trigraphs, digraphs, silent letters,
	 * contextual rules, and post-processing.
	 *
	 * @param word - The word to convert to phonemes
	 * @returns Array of IPA phoneme strings representing the pronunciation
	 */
	generatePronunciation(word: string): string[] {
		const result: string[] = [];
		const letters = word.toLowerCase();
		let i = 0;

		while (i < letters.length) {
			let phoneme: string | null = null;

			// Check for trigraphs first (3 letters)
			if (i + 2 < letters.length) {
				const trigraph = letters.slice(i, i + 3);
				if (DIGRAPHS[trigraph]) {
					phoneme = DIGRAPHS[trigraph];
					i += 3;
				}
			}

			// Check for digraphs (2 letters)
			if (!phoneme && i + 1 < letters.length) {
				const digraph = letters.slice(i, i + 2);
				if (DIGRAPHS[digraph]) {
					phoneme = DIGRAPHS[digraph];
					i += 2;
				} else if (SILENT_PATTERNS[digraph]) {
					// Handle silent letters
					phoneme = SILENT_PATTERNS[digraph];
					i += 2;
				}
			}

			// Single letters
			if (!phoneme) {
				const letter = letters[i];

				if (this.isVowel(letter)) {
					phoneme = this.processVowel(letter, i, letters);
				} else if (this.isConsonant(letter)) {
					phoneme = this.processConsonant(letter, i, letters);
				} else {
					// Handle unknown characters
					phoneme = letter;
				}
				i++;
			}

			if (phoneme) {
				result.push(phoneme);
			}
		}

		// Post-processing
		this.applyPostProcessing(result, letters);

		return result;
	}

	private isVowel(letter: string): boolean {
		return letter in VOWEL_MAP;
	}

	private isConsonant(letter: string): boolean {
		return letter in CONSONANT_MAP;
	}

	/**
	 * Process a vowel with context-aware rules based on position and surrounding letters.
	 * Handles special cases like vowels before final 'e' and 'y' at word endings.
	 *
	 * @param vowel - The vowel letter to process
	 * @param position - Position of the vowel in the word (0-indexed)
	 * @param word - The complete word for context
	 * @returns The appropriate IPA phoneme for the vowel in this context
	 */
	private processVowel(vowel: string, position: number, word: string): string {
		// Special rules for vowels before final 'e'
		if (position === word.length - 2 && word.endsWith("e")) {
			switch (vowel) {
				case "a":
					return "eɪ"; // "cake"
				case "i":
					return "aɪ"; // "bike"
				case "o":
					return "oʊ"; // "hope"
				case "u":
					return "uː"; // "cute"
			}
		}

		// Special rule for 'y' at end of word
		if (vowel === "y" && position === word.length - 1) {
			return "aɪ"; // "my", "fly"
		}

		return VOWEL_MAP[vowel];
	}

	/**
	 * Process a consonant with context-aware rules for pronunciation variations.
	 * Handles soft 'c' and 'g' before e,i,y, and special cases for 'x' pronunciation.
	 *
	 * @param consonant - The consonant letter to process
	 * @param position - Position of the consonant in the word (0-indexed)
	 * @param word - The complete word for context
	 * @returns The appropriate IPA phoneme for the consonant in this context
	 */
	private processConsonant(consonant: string, position: number, word: string): string {
		// Soft 'c' before e,i,y
		if (consonant === "c" && position + 1 < word.length) {
			const nextLetter = word[position + 1];
			if (SOFT_C.has(nextLetter)) {
				return "s"; // "ceiling", "city"
			}
		}

		// Soft 'g' before e,i,y
		if (consonant === "g" && position + 1 < word.length) {
			const nextLetter = word[position + 1];
			if (SOFT_G.has(nextLetter)) {
				return "dʒ"; // "page", "gem"
			}
		}

		// Special 'x' handling
		if (consonant === "x") {
			// 'x' at start of word
			if (position === 0) {
				return "z"; // "xylophone"
			}
			// 'x' before consonant
			if (position + 1 < word.length && this.isConsonant(word[position + 1])) {
				return "k"; // "extra" - but this should be handled by digraph rules
			}
			// 'x' at end of word or before vowel
			return "k"; // "box" - will be followed by 's' from digraph rule
		}

		return CONSONANT_MAP[consonant];
	}

	/**
	 * Apply post-processing rules to refine the generated phonemes.
	 * Handles double consonant simplification and special cases like 'x' at word endings.
	 *
	 * @param phonemes - The array of phonemes to post-process (modified in-place)
	 * @param originalWord - The original word for context-specific rules
	 */
	private applyPostProcessing(phonemes: string[], originalWord: string): void {
		// Handle double consonants (simplify to single)
		for (let i = 0; i < phonemes.length - 1; i++) {
			if (phonemes[i] === phonemes[i + 1] && this.isConsonantPhoneme(phonemes[i])) {
				phonemes.splice(i + 1, 1);
				i--; // Adjust index after removal
			}
		}

		// Handle 'x' at end of word -> /ks/
		if (originalWord.endsWith("x") && phonemes.length > 0) {
			const lastPhoneme = phonemes[phonemes.length - 1];
			if (lastPhoneme === "k") {
				phonemes.push("s"); // "box" -> /bɑks/
			}
		}
	}

	private isConsonantPhoneme(phoneme: string): boolean {
		// Check if phoneme is a consonant (not a vowel or stress marker)
		const consonants = [
			"b",
			"d",
			"f",
			"ɡ",
			"h",
			"dʒ",
			"k",
			"l",
			"m",
			"n",
			"p",
			"ɹ",
			"s",
			"ʃ",
			"t",
			"tʃ",
			"θ",
			"v",
			"w",
			"z",
			"ʒ",
			"ŋ",
		];
		return consonants.includes(phoneme);
	}
}

export const fallbackG2P = new FallbackG2P();
