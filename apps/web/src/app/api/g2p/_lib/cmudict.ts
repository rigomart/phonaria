import cmudictData from "@data/cmudict.json";
import { convertArpabetToIPA } from "./arpabet-mapping";
import { normalizeCmuWord } from "./cmudict-utils";

type CompactCmudictMap = Map<string, string[]>;

class CMUDict {
	private dict = new Map<string, string[][]>();
	private loaded = false;
	private loadPromise: Promise<void> | null = null;

	async load(): Promise<void> {
		if (this.loaded) return;
		if (this.loadPromise) return this.loadPromise;

		this.loadPromise = (async () => {
			if (this.loaded) return;
			this.parseObject(cmudictData as Record<string, string[]>);
			this.loaded = true;
		})().catch((error) => {
			this.loadPromise = null;
			throw error;
		});

		return this.loadPromise;
	}

	private parseObject(data: Record<string, string[]>): void {
		const jsonData: CompactCmudictMap = new Map(Object.entries(data));

		for (const [word, arpaVariants] of jsonData) {
			const validVariants = arpaVariants.filter(
				(arpaPhonemes): arpaPhonemes is string =>
					arpaPhonemes != null &&
					typeof arpaPhonemes === "string" &&
					arpaPhonemes.trim().length > 0,
			);

			if (validVariants.length === 0) {
				continue;
			}

			const ipaVariants: string[][] = validVariants.map((arpaPhonemes) => {
				const arpaTokens = arpaPhonemes.split(/\s+/);
				return convertArpabetToIPA(arpaTokens);
			});

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
