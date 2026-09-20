import type { LabDatabase } from "@/db/drizzle";
import { generateOneSlipVariants } from "@/lib/transcription/spelling-suggestion";
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

	return attachSpellingNeighbours(results, options.db);
}

async function attachSpellingNeighbours(results: G2PWord[], db?: LabDatabase): Promise<G2PWord[]> {
	const fallbackIndexes: number[] = [];
	for (let index = 0; index < results.length; index += 1) {
		if (results[index]?.source === "fallback") fallbackIndexes.push(index);
	}
	if (fallbackIndexes.length === 0) return results;

	const variants = new Set<string>();
	for (const index of fallbackIndexes) {
		const word = results[index]?.word;
		if (!word) continue;
		for (const variant of generateOneSlipVariants(word)) variants.add(variant);
	}
	if (variants.size === 0) return results;

	const existing = new Set(
		db
			? await findExistingCmudictWords([...variants], db)
			: await findExistingCmudictWords([...variants]),
	);

	for (const index of fallbackIndexes) {
		const word = results[index];
		if (!word) continue;
		const spellingNeighbours = generateOneSlipVariants(word.word).filter((variant) =>
			existing.has(variant),
		);
		if (spellingNeighbours.length > 0) {
			results[index] = { ...word, spellingNeighbours };
		}
	}

	return results;
}
