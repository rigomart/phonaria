import type { LanguagePhonemeId, TargetAccent } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { getCardWords } from "./card-words";
import type { PhonemeDetailsOptions } from "./sound";

const words = (phonemeId: string, options: Partial<PhonemeDetailsOptions> = {}) =>
	getCardWords({
		targetAccent: "en-us",
		phonemeId: phonemeId as LanguagePhonemeId<TargetAccent>,
		...options,
	});

describe("the compact card's words", () => {
	it("are one minimal pair against the sound's first contrast", () => {
		expect(words("TH")).toEqual({ kind: "pair", partnerIpa: "t", words: ["thin", "tin"] });
	});

	it("fall back to the first three example words for a sound without a contrast", () => {
		expect(words("O")).toMatchObject({
			kind: "examples",
			examples: [{ word: "saw" }, { word: "cause" }, { word: "talk" }],
		});
	});

	it("are the example words when the host hides comparisons", () => {
		expect(words("TH", { showComparisons: false })).toMatchObject({ kind: "examples" });
	});

	it("are none in Practice, which hides comparisons and spellings", () => {
		expect(words("TH", { showComparisons: false, showSpellings: false })).toBeNull();
	});
});
