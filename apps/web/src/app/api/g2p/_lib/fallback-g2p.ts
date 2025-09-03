/**
 * Fallback G2P System
 * Provides basic pronunciation for words not in CMUdict
 */

export class FallbackG2P {
	// Phase 2.1: Basic letter-to-IPA mapping
	private basicConsonantMap: Record<string, string> = {
		b: "b",
		c: "k",
		d: "d",
		f: "f",
		g: "ɡ",
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
		x: "z",
		y: "j",
		z: "z",
	};

	private basicVowelMap: Record<string, string> = {
		a: "æ",
		e: "ɛ",
		i: "ɪ",
		o: "ɔ",
		u: "ʌ",
	};

	/**
	 * Generate basic pronunciation for unknown words
	 * Phase 2.1: Simple letter-by-letter conversion
	 */
	generatePronunciation(word: string): string[] {
		const result: string[] = [];
		const letters = word.toLowerCase().split("");

		for (const letter of letters) {
			if (this.basicConsonantMap[letter]) {
				result.push(this.basicConsonantMap[letter]);
			} else if (this.basicVowelMap[letter]) {
				result.push(this.basicVowelMap[letter]);
			} else {
				// Handle unknown characters
				result.push(letter);
			}
		}

		return result;
	}
}

export const fallbackG2P = new FallbackG2P();
