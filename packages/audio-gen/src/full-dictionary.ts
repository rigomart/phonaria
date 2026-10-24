import { readFile } from "node:fs/promises";
import path from "node:path";
import { toBasePhonemeIds } from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import type { PronunciationLookup } from "@phonaria/pronunciation";

const FULL_CMU = path.resolve(
	import.meta.dirname,
	"../../phonetics-data/data/en/dict/cmudict.json",
);

/**
 * Every pronunciation of a word in the full CMU dictionary bundled with phonetics-data
 * (126k words), falling back to the curated top-10k. Read once, when called.
 */
export async function fullDictionaryPronunciations(): Promise<PronunciationLookup> {
	const { data } = JSON.parse(await readFile(FULL_CMU, "utf8")) as {
		data: Record<string, readonly string[]>;
	};
	return (word) =>
		(data[word.toUpperCase()] ?? EnglishCuratedTop10k.words[word])?.map((variant) =>
			toBasePhonemeIds(variant),
		);
}
