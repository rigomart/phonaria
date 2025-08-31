import { convertArpabetToIPA } from "./arpabet-mapping";
import { fallbackG2P } from "./fallback-g2p";

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
			const ipaPhonemes = convertArpabetToIPA(arpaPhonemes);

			this.dict.set(word, ipaPhonemes);
		}
	}

	lookup(word: string): string[] {
		if (!this.loaded) {
			throw new Error("Dictionary not loaded");
		}

		// Try dictionary lookup first
		const dictResult = this.dict.get(word.toUpperCase());
		if (dictResult) {
			return dictResult;
		}

		// Phase 2.1: Fallback for unknown words
		return fallbackG2P.generatePronunciation(word);
	}
}

export const cmudict = new CMUDict();
