import { describe, expect, it } from "vitest";
import cmudict from "../../../data/en/dict/cmudict.json";
import { EnglishCuratedTop10k } from "../../data/en/curated-10k";
import { EnglishPracticeSchwa, validatePracticeEntries } from "./practice-schwa";

const exceptions = ["adopt", "lemon", "banana", "adapt", "vanilla", "sofa"];
const held = [
	"chocolate",
	"comfortable",
	"people",
	"little",
	"button",
	"museum",
	"navigation",
	"tomato",
	"umbrella",
	"temperature",
	"different",
];

describe("approved Practice schwa entries", () => {
	it("pins 360 unique single-form words including exact dictionary stress", () => {
		expect(EnglishPracticeSchwa).toHaveLength(360);
		expect(new Set(EnglishPracticeSchwa.map(({ word }) => word)).size).toBe(360);
		validatePracticeEntries(EnglishPracticeSchwa, EnglishCuratedTop10k.words);
		const full: Record<string, string[]> = cmudict.data;
		for (const { word, variant } of EnglishPracticeSchwa) {
			expect(full[word.toUpperCase()], word).toEqual([variant]);
			expect(variant.split(" "), word).toContain("AX0");
			expect(held, word).not.toContain(word);
		}
	});
	it("keeps top-5k ranks with exactly the six approved exceptions", () => {
		const ranks = new Map(
			Object.keys(EnglishCuratedTop10k.words).map((word, rank) => [word, rank]),
		);
		const outside = EnglishPracticeSchwa.filter(({ word }) => ranks.get(word)! >= 5000).map(
			({ word }) => word,
		);
		expect(outside.sort()).toEqual(exceptions.sort());
	});
	it("rejects dictionary and list drift", () => {
		const entry = { word: "about", variant: "AX0 B AU1 T" };
		const driftedDictionaries: Record<string, string[]>[] = [
			{},
			{ about: ["AX0 B AU2 T"] },
			{ about: [entry.variant, entry.variant] },
		];
		for (const words of driftedDictionaries)
			expect(() => validatePracticeEntries([entry], words)).toThrow(/about/);
		expect(() => validatePracticeEntries([entry, entry], { about: [entry.variant] })).toThrow(
			/duplicate/i,
		);
	});
});
