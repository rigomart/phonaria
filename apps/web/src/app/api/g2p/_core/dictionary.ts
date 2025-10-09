import cmudictData from "@data/cmudict.json";
import { convertArpabetToIPA, normalizeCmuWord } from "shared-data";

type PreprocessedCmudict = Record<string, string[]>;

// Type for the new CMUDict JSON format with metadata
type CmudictJson = { meta: unknown; data: Record<string, string[]> };

class CMUDict {
	private data: PreprocessedCmudict | null = null;
	private cache = new Map<string, string[][]>();
	private loaded = false;
	private loadPromise: Promise<void> | null = null;

	async load(): Promise<void> {
		if (this.loaded) return;
		if (this.loadPromise) return this.loadPromise;

		this.loadPromise = Promise.resolve()
			.then(() => {
				if (this.loaded) return;
				this.data = (cmudictData as CmudictJson).data;
				this.loaded = true;
			})
			.catch((error) => {
				this.loadPromise = null;
				throw error;
			});

		return this.loadPromise;
	}

	lookup(rawWord: string): string[][] | undefined {
		if (!this.loaded || !this.data) {
			throw new Error("Dictionary not loaded");
		}

		const normalizedWord = normalizeCmuWord(rawWord);
		const cached = this.cache.get(normalizedWord);
		if (cached) {
			return cached;
		}

		const variants = this.data[normalizedWord];
		if (!variants) {
			return undefined;
		}

		const ipaVariants: string[][] = [];
		for (const variant of variants) {
			const sanitized = typeof variant === "string" ? variant.trim() : "";
			if (!sanitized) continue;
			const tokens = sanitized.split(" ");
			const ipa = convertArpabetToIPA(tokens);
			if (ipa.length === 0) continue;
			ipaVariants.push(ipa);
		}

		this.cache.set(normalizedWord, ipaVariants);
		return ipaVariants;
	}
}

export const cmudict = new CMUDict();
