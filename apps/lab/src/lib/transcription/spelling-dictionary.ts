import { loadTier2 } from "@/lib/phoneme-lookup/shared";
import { type SpellingDictionary, withExtraHits } from "./spelling-suggestion";

let curatedRanks: Map<string, number> | null = null;

async function loadCuratedRanks(): Promise<Map<string, number>> {
	if (curatedRanks) return curatedRanks;
	const tier2 = await loadTier2();
	curatedRanks = new Map(Object.keys(tier2.words).map((word, index) => [word, index]));
	return curatedRanks;
}

export async function loadSpellingDictionary(
	extraHits: Iterable<string> = [],
): Promise<SpellingDictionary> {
	const rankByWord = await loadCuratedRanks();
	const curated: SpellingDictionary = {
		has(word) {
			return rankByWord.has(word.toLowerCase());
		},
		rank(word) {
			return rankByWord.get(word.toLowerCase()) ?? rankByWord.size;
		},
	};
	return withExtraHits(curated, extraHits, rankByWord.size);
}
