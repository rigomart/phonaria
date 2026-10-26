import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { collectCuratedWords, getExclusionReason, pickPronunciation } from "./curated-words";
import { excludedWords } from "./excluded-words";
import { recordedBeforeTop10k } from "./fixtures/recorded-before-top-10k";
import { curatedPronunciations } from "./reviewed-pronunciations";

const variantsOf = (word: string) => EnglishCuratedTop10k.words[word];
const beforeTop10k = { recorded: recordedBeforeTop10k };

describe("curated word selection", () => {
	it("selects unrecorded words in frequency order, the top-1k inside the top-10k", () => {
		const top1k = collectCuratedWords("top-1k", beforeTop10k).words.map(({ word }) => word);
		const top10k = collectCuratedWords("top-10k", beforeTop10k).words.map(({ word }) => word);
		expect(top1k.slice(0, 4)).toEqual(["the", "to", "and", "of"]);
		expect(top10k.slice(0, top1k.length)).toEqual(top1k);
		expect(top10k.filter((word) => recordedBeforeTop10k.has(word))).toEqual([]);
	});
	it("leaves no curated word to plan once the live manifest lists the top-10k", () => {
		expect(collectCuratedWords("top-1k").words).toEqual([]);
		expect(collectCuratedWords("top-10k").words).toEqual([]);
	});
	it("skips words that are already recorded", () => {
		const words = collectCuratedWords("top-1k", { recorded: new Set(["the", "of"]) }).words;
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
		expect(collectCuratedWords("top-10k", beforeTop10k).excluded).toContainEqual({ word, reason });
	});
	it.each(
		Object.entries(excludedWords).flatMap(([reason, words]) =>
			Object.entries(words).map(([word, note]) => [word, reason, note]),
		),
	)("leaves out %s as a %s: %s", (word, reason) => {
		expect(getExclusionReason(word)).toBe(reason);
		expect(collectCuratedWords("top-10k", beforeTop10k).excluded).toContainEqual({ word, reason });
	});
	it.each([
		"a",
		"i",
		"rhythm",
		"the",
		"read",
		"ok",
		"okay",
		"us",
		"it",
		"do",
		"so",
		"etc",
		"nasa",
		"nato",
		"aids",
		"ex",
		"pa",
		"mar",
	])("keeps %s", (word) => {
		expect(getExclusionReason(word)).toBeUndefined();
	});
	it("keeps excluded words a saved plan already has, so it can resume", () => {
		const saved = collectCuratedWords("top-1k", { ...beforeTop10k, saved: new Set(["al"]) });
		expect(saved.words.map(({ word }) => word)).toContain("al");
		expect(saved.excluded).not.toContainEqual(expect.objectContaining({ word: "al" }));
		const fresh = collectCuratedWords("top-1k", beforeTop10k).words.map(({ word }) => word);
		expect(fresh).not.toContain("al");
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
	it.each([
		["caught", "K O1 T", "/ɔ/ form of the first stressed one-syllable form; not K A1 T"],
		["bought", "B O1 T", "/ɔ/ form of the first stressed one-syllable form; not B A1 T"],
		["boss", "B O1 S", "/ɔ/ form of the first stressed one-syllable form; not B A1 S"],
		["august", "O1 G AX0 S T", "/ɔ/ form of the first dictionary form; not A1 G AX0 S T"],
		["audience", "O1 D I0 AX0 N S", "/ɔ/ form of the first dictionary form; not A1 D I0 AX0 N S"],
	])("prefers the /ɔ/ form of %s to its /ɑ/ form", (word, variant, reason) => {
		expect(pickPronunciation(word, variantsOf(word))).toEqual({
			variant,
			choice: { source: "rule", reason },
		});
	});
	it.each(["lot", "doctor", "on", "want", "watch", "beyond", "gospel"])(
		"keeps the /ɑ/ form of %s, a LOT word or an exception",
		(word) => {
			expect(pickPronunciation(word, variantsOf(word)).variant).toBe(variantsOf(word)[0]);
			expect(pickPronunciation(word, variantsOf(word)).choice.reason).not.toMatch(/ɔ/);
		},
	);
	it("keeps the rule for forms that differ in something else", () => {
		expect(pickPronunciation("either", variantsOf("either")).variant).toBe(variantsOf("either")[0]);
		expect(pickPronunciation("because", variantsOf("because")).choice.reason).toMatch(
			/^first dictionary form;/,
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
