import { LanguageWordAudioDataRegistry } from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { collectCuratedWords, getExclusionReason, pickPronunciation } from "./curated-words";
import { curatedPronunciations } from "./reviewed-pronunciations";

const variantsOf = (word: string) => EnglishCuratedTop10k.words[word];

describe("curated word selection", () => {
	it("selects unrecorded words in frequency order, the top-1k inside the top-10k", () => {
		const top1k = collectCuratedWords("top-1k").words.map(({ word }) => word);
		const top10k = collectCuratedWords("top-10k").words.map(({ word }) => word);
		const recorded = new Set(LanguageWordAudioDataRegistry["en-us"].words);
		expect(top1k.slice(0, 4)).toEqual(["the", "to", "and", "of"]);
		expect(top10k.slice(0, top1k.length)).toEqual(top1k);
		expect(top10k.filter((word) => recorded.has(word))).toEqual([]);
	});
	it("skips words that are already recorded", () => {
		const words = collectCuratedWords("top-1k", new Set(["the", "of"])).words;
		expect(words.slice(0, 2).map(({ word }) => word)).toEqual(["to", "and"]);
	});
	it.each([
		["it's", "not a plain word"],
		["u.s", "not a plain word"],
		["mr", "abbreviation or letter"],
		["tv", "abbreviation or letter"],
		["b", "abbreviation or letter"],
	])("leaves out %s as %s", (word, reason) => {
		expect(getExclusionReason(word)).toBe(reason);
		expect(collectCuratedWords("top-10k").excluded).toContainEqual({ word, reason });
	});
	it.each(["a", "i", "rhythm", "the", "read"])("keeps %s", (word) => {
		expect(getExclusionReason(word)).toBeUndefined();
	});
});

describe("pronunciation rule", () => {
	it.each([
		["the", "DH AH1"],
		["a", "EI1"],
		["and", "AE1 N D"],
		["for", "F O1 R"],
		["to", "T U1"],
		["us", "AH1 S"],
	])("gives the one-syllable word %s its stressed citation form", (word, variant) => {
		expect(pickPronunciation(word, variantsOf(word))).toMatchObject({
			variant,
			choice: { source: "rule", reason: expect.stringMatching(/^first stressed/) },
		});
	});
	it.each([
		["our", "AU1 ER0"],
		["probably", "P R A1 B AX0 B L I2"],
		["before", "B IX0 F O1 R"],
		["particular", "P ER0 T IX1 K Y AX0 L ER0"],
	])("keeps the first dictionary form of %s", (word, variant) => {
		expect(pickPronunciation(word, variantsOf(word))).toMatchObject({
			variant,
			choice: { source: "rule", reason: expect.stringMatching(/^first dictionary form/) },
		});
	});
	it("records the forms it did not pick", () => {
		expect(pickPronunciation("the", variantsOf("the")).choice.reason).toBe(
			"first stressed one-syllable form; not DH AX0 | DH I0",
		);
	});
	it("uses a reviewed choice before the rule", () => {
		expect(pickPronunciation("sometimes", variantsOf("sometimes"))).toEqual({
			variant: curatedPronunciations.sometimes.variant,
			choice: { source: "reviewed", reason: curatedPronunciations.sometimes.reason },
		});
	});
	it("uses a heteronym's labelled main meaning", () => {
		expect(pickPronunciation("record", variantsOf("record"))).toEqual({
			variant: "R E1 K ER0 D",
			choice: { source: "reviewed", reason: "heteronym: noun" },
		});
	});
	it("marks a word with one dictionary form", () => {
		expect(pickPronunciation("people", variantsOf("people")).choice.source).toBe("only");
	});
	it("refuses a word without a pronunciation", () => {
		expect(() => pickPronunciation("missing", [])).toThrow(/missing/);
	});
});
