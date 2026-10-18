import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import fullCmu from "../../phonetics-data/data/en/dict/cmudict.json";
import { spellingPronunciations } from "./reviewed-pronunciations";
import { collectWordsWithPhonemic } from "./words";

describe("reviewed spelling pronunciations", () => {
	it("pins only real bundled CMU entries and explains every choice", () => {
		const fullWords: Record<string, string[]> = fullCmu.data;
		for (const [word, reviewed] of Object.entries(spellingPronunciations)) {
			const variants =
				reviewed.dictionary === "full"
					? fullWords[word.toUpperCase()]
					: EnglishCuratedTop10k.words[word];
			expect(variants, word).toContain(reviewed.variant);
			expect(reviewed.reason, word).not.toBe("");
		}
	});
	it("requires review for every spelling word with dictionary alternatives or missing curated data", () => {
		const unreviewed = collectWordsWithPhonemic("spelling").filter(({ word }) => {
			const variants = EnglishCuratedTop10k.words[word];
			return (!variants || variants.length > 1) && !spellingPronunciations[word];
		});
		expect(unreviewed).toEqual([]);
	});
});
