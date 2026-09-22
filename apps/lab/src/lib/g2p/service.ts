import type { LabDatabase } from "@/db/drizzle";
import { generateOneEditVariants } from "@/lib/transcription/spelling-search";
import { findExistingCmudictWords, lookupManyCmudict } from "./cmudict";
import type { G2PWord } from "./model";
import { fallbackG2P } from "./phoneme-generator";
import { normalizeCmuWord } from "./text-processing";

export type ProcessWordsOptions = {
	db?: LabDatabase;
};

export async function processWords(
	inputWords: string[],
	options: ProcessWordsOptions = {},
): Promise<G2PWord[]> {
	if (inputWords.length === 0) return [];

	const lookups = options.db
		? await lookupManyCmudict(inputWords, options.db)
		: await lookupManyCmudict(inputWords);
	const results: G2PWord[] = [];

	for (const word of inputWords) {
		if (word.length === 0) continue;

		const variants = lookups.get(normalizeCmuWord(word));

		if (variants && variants.length > 0) {
			results.push({
				word: word.toLowerCase(),
				variants,
				source: "cmudict",
			});
		} else {
			const lowerWord = word.toLowerCase();
			results.push({
				word: lowerWord,
				variants: [fallbackG2P.generatePronunciation(lowerWord)],
				source: "fallback",
			});
		}
	}

	try {
		return await attachSpellingNeighbours(results, options.db);
	} catch (error) {
		console.error("transcription: spelling neighbour lookup failed", error);
		return results;
	}
}

async function attachSpellingNeighbours(results: G2PWord[], db?: LabDatabase): Promise<G2PWord[]> {
	const fallbackIndexes: number[] = [];
	for (let index = 0; index < results.length; index += 1) {
		if (results[index]?.source === "fallback") fallbackIndexes.push(index);
	}
	if (fallbackIndexes.length === 0) return results;

	// Generated once per token, then read twice: for the membership query and per token.
	const variantsByIndex = new Map<number, string[]>();
	const allVariants = new Set<string>();
	for (const index of fallbackIndexes) {
		const word = results[index]?.word;
		if (!word) continue;
		const variants = generateOneEditVariants(word);
		variantsByIndex.set(index, variants);
		for (const variant of variants) allVariants.add(variant);
	}
	if (allVariants.size === 0) return results;

	const existing = new Set(
		db
			? await findExistingCmudictWords([...allVariants], db)
			: await findExistingCmudictWords([...allVariants]),
	);

	for (const [index, variants] of variantsByIndex) {
		const word = results[index];
		if (!word) continue;
		const spellingNeighbours = variants.filter((variant) => existing.has(variant));
		if (spellingNeighbours.length > 0) {
			results[index] = { ...word, spellingNeighbours };
		}
	}

	return results;
}
