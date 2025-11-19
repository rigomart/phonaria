import cmudictData from "@/data/dict/cmudict.json";
import type { G2PSyllable } from "../_schemas/g2p-api.schema";
import { normalizeCmuWord } from "../_utils/text-processing";
import { syllabify } from "./syllabifier";

type PreprocessedCmudict = Record<string, string[] | undefined>;
type CmudictVariant = G2PSyllable[];
type CmudictLookupResult = CmudictVariant[] | undefined;

type CmudictJson = { meta: unknown; data: Record<string, string[]> };

class CMUDict {
	private data: PreprocessedCmudict | null = null;
	private cache = new Map<string, CmudictVariant[]>();
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

	lookup(rawWord: string): CmudictLookupResult {
		if (!this.loaded || !this.data) {
			throw new Error("Dictionary not loaded");
		}

		const normalizedWord = normalizeCmuWord(rawWord); // e.g. "record"

		const cached = this.cache.get(normalizedWord);
		if (cached) {
			return cached;
		}

		const variants = this.data[normalizedWord]; // e.g. ["R AH0 K AO1 R D","R EH1 K ER0 D","R IH0 K AO1 R D"] | undefined
		if (!variants) {
			return undefined;
		}

		const mappedVariants: CmudictVariant[] = [];

		for (const variant of variants) {
			if (typeof variant !== "string") continue;

			const tokens = variant
				.split(" ")
				.map((token) => token.trim())
				.filter((token) => token.length > 0); // e.g. ["R", "AH0", "K", "AO1", "R", "D"]

			if (tokens.length === 0) continue;

			const syllables = syllabify(tokens);
			mappedVariants.push(syllables);
		}

		this.cache.set(normalizedWord, mappedVariants);
		return mappedVariants;
	}
}

export const cmudict = new CMUDict();
