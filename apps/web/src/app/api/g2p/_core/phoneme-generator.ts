export class FallbackG2P {
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

	generatePronunciation(word: string): string[] {
		const result: string[] = [];
		const letters = word.toLowerCase().split("");

		for (const letter of letters) {
			if (this.basicConsonantMap[letter]) {
				result.push(this.basicConsonantMap[letter]);
			} else if (this.basicVowelMap[letter]) {
				result.push(this.basicVowelMap[letter]);
			} else {
				result.push(letter);
			}
		}

		return result;
	}
}

export const fallbackG2P = new FallbackG2P();
