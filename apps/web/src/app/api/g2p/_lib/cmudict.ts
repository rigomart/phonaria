import { convertArpabetToIPA } from "./arpabet-mapping";

class CMUDict {
	private dict = new Map<string, string[][]>();
	private loaded = false;

	async load(): Promise<void> {
		if (this.loaded) return;

		console.log("Loading CMUdict from GitHub...");
		const response = await fetch(
			"https://raw.githubusercontent.com/rigomart/cmudict/refs/heads/master/cmudict.dict",
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
		for (const rawLine of lines) {
			const line = rawLine.trim();
			if (!line) continue;
			// Skip comment/header lines that may start with ';' (old CMU format) or '#'
			if (line.startsWith(";") || line.startsWith("#")) continue;

			// Capture WORD and the rest of the line as phoneme sequence using flexible whitespace
			const match = line.match(/^(\S+)\s+(.+)$/);
			if (!match) continue;

			const wordPart = match[1];
			const phonemePart = match[2];

			// Extract base word from variants (LEAD(1) → LEAD)
			let baseWord = wordPart;
			if (wordPart.includes("(")) {
				baseWord = wordPart.replace(/\(\d+\)$/, "");
			}

			const word = baseWord.toUpperCase();
			const arpaPhonemes = phonemePart.trim().split(/\s+/);
			const ipaPhonemes = convertArpabetToIPA(arpaPhonemes);

			// Store multiple variants per word
			const variants = this.dict.get(word);
			if (!variants) {
				this.dict.set(word, [ipaPhonemes]);
			} else {
				variants.push(ipaPhonemes);
			}
		}
	}

	lookup(word: string): string[][] | undefined {
		if (!this.loaded) {
			throw new Error("Dictionary not loaded");
		}

		return this.dict.get(word.toUpperCase());
	}
}

export const cmudict = new CMUDict();
