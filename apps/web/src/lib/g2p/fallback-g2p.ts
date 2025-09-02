/**
 * Enhanced Fallback G2P System
 * Provides intelligent pronunciation for words not in CMUdict
 * Phase 1: Enhanced fallback with pattern recognition
 */

export class FallbackG2P {
	// Enhanced consonant mappings
	private consonantMap: Record<string, string> = {
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

	// Enhanced vowel mappings with positional awareness
	private vowelMap: Record<string, string> = {
		a: "æ", // default, but can be /eɪ/ before final e
		e: "ɛ", // default, but silent at word end
		i: "ɪ", // default, but can be /aɪ/ before final e
		o: "ɔ", // default, but can be /oʊ/ before final e
		u: "ʌ", // default, but can be /uː/ or /juː/
	};

	// Common digraph and trigraph patterns
	private digraphs: Record<string, string> = {
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

	// Silent letter patterns
	private silentPatterns: Record<string, string> = {
		kn: "n", // "know", "knee"
		wr: "r", // "write", "wrong"
		mb: "m", // "thumb", "climb" (often silent b)
		gn: "n", // "gnat", "sign"
		ps: "s", // "psychology", "psalm"
		sc: "s", // "science", "scene" (before e,i)
	};

	// Special rules for c and g before e,i,y
	private softC = new Set(["e", "i", "y"]);
	private softG = new Set(["e", "i", "y"]);

	/**
	 * Generate enhanced pronunciation for unknown words
	 * Phase 1: Intelligent pattern-based conversion
	 */
	generatePronunciation(word: string): string[] {
		const result: string[] = [];
		const letters = word.toLowerCase();
		let i = 0;

		while (i < letters.length) {
			let phoneme: string | null = null;

			// Trigraphs
			if (i + 2 < letters.length) {
				const trigraph = letters.substr(i, 3);
				if (this.digraphs[trigraph]) {
					phoneme = this.digraphs[trigraph];
					i += 3;
				}
			}

			// Digraphs
			if (!phoneme && i + 1 < letters.length) {
				const digraph = letters.substr(i, 2);
				if (this.digraphs[digraph]) {
					phoneme = this.digraphs[digraph];
					i += 2;
				} else if (this.silentPatterns[digraph]) {
					// Handle silent letters
					phoneme = this.silentPatterns[digraph];
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
		return letter in this.vowelMap;
	}

	private isConsonant(letter: string): boolean {
		return letter in this.consonantMap;
	}

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

		return this.vowelMap[vowel];
	}

	private processConsonant(consonant: string, position: number, word: string): string {
		// Soft 'c' before e,i,y
		if (consonant === "c" && position + 1 < word.length) {
			const nextLetter = word[position + 1];
			if (this.softC.has(nextLetter)) {
				return "s"; // "ceiling", "city"
			}
		}

		// Soft 'g' before e,i,y
		if (consonant === "g" && position + 1 < word.length) {
			const nextLetter = word[position + 1];
			if (this.softG.has(nextLetter)) {
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

		return this.consonantMap[consonant];
	}

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
