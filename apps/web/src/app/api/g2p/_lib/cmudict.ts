import * as fs from "node:fs";
import * as path from "node:path";
import { convertArpabetToIPA } from "./arpabet-mapping";
import { normalizeCmuWord } from "./cmudict-utils";

type CompactCmudict = Record<string, string[]>;

class CMUDict {
	private dict = new Map<string, string[][]>();
	private loaded = false;

	async load(): Promise<void> {
		if (this.loaded) return;

		// Load the pre-processed CMUDict JSON file
		const cmudictPath = path.resolve(process.cwd(), "data/cmudict.json");

		let rawData: string;
		try {
			rawData = fs.readFileSync(cmudictPath, "utf-8");
		} catch (error) {
			throw new Error(`Failed to load CMUDict JSON file: ${error}`);
		}

		this.parse(rawData);
		this.loaded = true;
	}

	private parse(content: string): void {
		let jsonData: CompactCmudict;

		try {
			jsonData = JSON.parse(content) as CompactCmudict;
		} catch (error) {
			throw new Error(`Failed to parse CMUDict JSON: ${error}`);
		}

		// Process each word and its ARPABET variants
		for (const [word, arpaVariants] of Object.entries(jsonData)) {
			// Filter out null values and convert each ARPABET variant to IPA
			const validVariants = arpaVariants.filter(
				(arpaPhonemes): arpaPhonemes is string =>
					typeof arpaPhonemes === "string" && arpaPhonemes.trim().length > 0,
			);

			if (validVariants.length === 0) {
				// Skip words with no valid pronunciations
				continue;
			}

			const ipaVariants: string[][] = validVariants.map((arpaPhonemes) => {
				const arpaTokens = arpaPhonemes.split(/\s+/);
				return convertArpabetToIPA(arpaTokens);
			});

			// Normalize the word key and store variants
			const normalizedWord = normalizeCmuWord(word);
			this.dict.set(normalizedWord, ipaVariants);
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
