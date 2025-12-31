import { like } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { words } from "@/db/schema";
import type { PhonemeSearchResponse } from "./model";
import {
	arpabetToIpa,
	buildPhonemeKeyPrefix,
	extractNextPhoneme,
	isValidArpabetLabel,
	parsePath,
} from "./phoneme-utils";

type NextPhonemeAggregation = Map<string, number>;

function aggregateNextPhonemes(phonemeKeys: string[], pathLength: number): NextPhonemeAggregation {
	const aggregation = new Map<string, number>();

	for (const phonemeKey of phonemeKeys) {
		const nextPhoneme = extractNextPhoneme(phonemeKey, pathLength);
		if (nextPhoneme) {
			aggregation.set(nextPhoneme, (aggregation.get(nextPhoneme) ?? 0) + 1);
		}
	}

	return aggregation;
}

function formatNextPhonemes(
	aggregation: NextPhonemeAggregation,
): Array<{ arpabet: string; ipa: string; count: number }> {
	return Array.from(aggregation.entries())
		.map(([arpabet, count]) => ({
			arpabet,
			ipa: arpabetToIpa(arpabet) ?? `/${arpabet}/`,
			count,
		}))
		.sort((a, b) => b.count - a.count);
}

export async function searchPhonemes(
	pathString: string,
	limit: number,
): Promise<PhonemeSearchResponse | { error: string; message: string; invalidLabels?: string[] }> {
	const pathArray = parsePath(pathString);

	if (pathArray.length === 0) {
		return {
			words: [],
			totalCount: 0,
			nextPhonemes: [],
			path: [],
		};
	}

	const invalidLabels = pathArray.filter((label) => !isValidArpabetLabel(label));
	if (invalidLabels.length > 0) {
		return {
			error: "invalid_path",
			message: `Invalid ARPABET labels: ${invalidLabels.join(", ")}`,
			invalidLabels,
		};
	}

	const prefix = buildPhonemeKeyPrefix(pathArray);

	const matchingWords = await db
		.select({ word: words.word, phonemeKey: words.phonemeKey })
		.from(words)
		.where(like(words.phonemeKey, `${prefix}%`))
		.limit(limit);

	const wordsList = matchingWords.map((row) => row.word.toLowerCase());
	const phonemeKeys = matchingWords.map((row) => row.phonemeKey);

	const nextPhonemeAggregation = aggregateNextPhonemes(phonemeKeys, pathArray.length);
	const nextPhonemes = formatNextPhonemes(nextPhonemeAggregation);

	return {
		words: wordsList,
		totalCount: wordsList.length,
		nextPhonemes,
		path: pathArray,
	};
}
