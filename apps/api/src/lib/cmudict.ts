const ARPABET_TO_IPA: Record<string, string> = {
	AA: "ɑ",
	AA0: "ɑ",
	AA1: "ɑ",
	AA2: "ɑ",
	AE: "æ",
	AE0: "æ",
	AE1: "æ",
	AE2: "æ",
	AH: "ʌ",
	AH0: "ə",
	AH1: "ʌ",
	AH2: "ʌ",
	AO: "ɔ",
	AO0: "ɔ",
	AO1: "ɔ",
	AO2: "ɔ",
	AW: "aʊ",
	AW0: "aʊ",
	AW1: "aʊ",
	AW2: "aʊ",
	AY: "aɪ",
	AY0: "aɪ",
	AY1: "aɪ",
	AY2: "aɪ",
	EH: "ɛ",
	EH0: "ɛ",
	EH1: "ɛ",
	EH2: "ɛ",
	ER: "ɝ",
	ER0: "ɚ",
	ER1: "ɝ",
	ER2: "ɝ",
	EY: "eɪ",
	EY0: "eɪ",
	EY1: "eɪ",
	EY2: "eɪ",
	IH: "ɪ",
	IH0: "ɪ",
	IH1: "ɪ",
	IH2: "ɪ",
	IY: "i",
	IY0: "i",
	IY1: "i",
	IY2: "i",
	OW: "oʊ",
	OW0: "oʊ",
	OW1: "oʊ",
	OW2: "oʊ",
	OY: "ɔɪ",
	OY0: "ɔɪ",
	OY1: "ɔɪ",
	OY2: "ɔɪ",
	UH: "ʊ",
	UH0: "ʊ",
	UH1: "ʊ",
	UH2: "ʊ",
	UW: "u",
	UW0: "u",
	UW1: "u",
	UW2: "u",
	B: "b",
	CH: "tʃ",
	D: "d",
	DH: "ð",
	F: "f",
	G: "g",
	HH: "h",
	JH: "dʒ",
	K: "k",
	L: "l",
	M: "m",
	N: "n",
	NG: "ŋ",
	P: "p",
	R: "ɹ",
	S: "s",
	SH: "ʃ",
	T: "t",
	TH: "θ",
	V: "v",
	W: "w",
	Y: "j",
	Z: "z",
	ZH: "ʒ",
};

class CMUDict {
	private dict = new Map<string, string[]>();
	private loaded = false;

	async load(): Promise<void> {
		if (this.loaded) return;

		console.log("Loading CMUdict from GitHub...");
		const response = await fetch(
			"https://raw.githubusercontent.com/Alexir/CMUdict/refs/heads/master/cmudict-0.7b",
		);
		if (!response.ok) {
			throw new Error(`Failed to load CMUdict: ${response.statusText}`);
		}

		const content = await response.text();
		this.parse(content);
		this.loaded = true;
		console.log(`CMUdict loaded: ${this.dict.size} words`);
	}

	private parse(content: string): void {
		const lines = content.split(/\r?\n/);
		for (const line of lines) {
			if (line.startsWith(";;;") || !line.trim()) continue;

			const parts = line.split("  ");
			if (parts.length !== 2) continue;

			const [wordPart, phonemePart] = parts;

			// Skip variants for now - use base form only
			if (wordPart.includes("(")) continue;

			const word = wordPart.toUpperCase();
			const arpaPhonemes = phonemePart.trim().split(/\s+/);
			const ipaPhonemes = this.convertToIPA(arpaPhonemes);

			this.dict.set(word, ipaPhonemes);
		}
	}

	private convertToIPA(arpaPhonemes: string[]): string[] {
		const result: string[] = [];

		for (const arpa of arpaPhonemes) {
			if (arpa.endsWith("1")) {
				result.push("ˈ");
				result.push(ARPABET_TO_IPA[arpa] || arpa);
			} else if (arpa.endsWith("2")) {
				result.push("ˌ");
				result.push(ARPABET_TO_IPA[arpa] || arpa);
			} else {
				result.push(ARPABET_TO_IPA[arpa] || arpa);
			}
		}

		return result;
	}

	lookup(word: string): string[] | null {
		if (!this.loaded) {
			throw new Error("Dictionary not loaded");
		}
		return this.dict.get(word.toUpperCase()) || null;
	}
}

export const cmudict = new CMUDict();
