import { describe, expect, it } from "vitest";
import cmudict from "../../../data/en/dict/cmudict.json";
import { getPhonemeCategory } from "../../core/ipa-map";
import { EnglishCuratedTop10k } from "../../data/en/curated-10k";
import { tokenizePronunciation, tryExtractBasePhonemeId } from "./cmu-arpa";
import {
	EnglishPracticeRColoredVowel,
	EnglishPracticeSchwa,
	EnglishPracticeStrut,
	type PracticeWordEntry,
	validatePracticeEntries,
} from "./practice";

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

const ranks = new Map(Object.keys(EnglishCuratedTop10k.words).map((word, rank) => [word, rank]));
const isVowel = (token: string | undefined) => {
	const id = token === undefined ? null : tryExtractBasePhonemeId(token);
	return id !== null && getPhonemeCategory(id) === "vowel";
};

function expectMeetsDraftingRules(
	entries: readonly PracticeWordEntry[],
	sound: string,
	rankLimit: number,
) {
	validatePracticeEntries(entries, EnglishCuratedTop10k.words);
	const full: Record<string, string[]> = cmudict.data;
	for (const { word, variant } of entries) {
		expect(full[word.toUpperCase()], word).toEqual([variant]);
		expect(ranks.get(word), word).toBeLessThan(rankLimit);
		expect(
			tokenizePronunciation(variant).some((token) => tryExtractBasePhonemeId(token) === sound),
			word,
		).toBe(true);
	}
}

describe("approved Practice r-colored vowel entries", () => {
	it("pins 452 single-form top-5k words with ER", () => {
		expect(EnglishPracticeRColoredVowel).toHaveLength(452);
		expectMeetsDraftingRules(EnglishPracticeRColoredVowel, "ER", 5000);
	});

	it("leaves out words whose ER may not be its own syllable", () => {
		// ER0/ER2 before a vowel often sounds like schwa + r ("operation"); after a vowel the
		// syllable count wavers ("power"). ER1 before a vowel stays: "worry" is /ˈwɝi/.
		for (const { word, variant } of EnglishPracticeRColoredVowel) {
			const tokens = tokenizePronunciation(variant);
			tokens.forEach((token, index) => {
				if (tryExtractBasePhonemeId(token) !== "ER") return;
				if (token !== "ER1") expect(isVowel(tokens[index + 1]), word).toBe(false);
				expect(isVowel(tokens[index - 1]), word).toBe(false);
			});
		}
	});
});

describe("approved Practice strut entries", () => {
	it("pins 416 single-form top-10k words with AH", () => {
		expect(EnglishPracticeStrut).toHaveLength(416);
		expectMeetsDraftingRules(EnglishPracticeStrut, "AH", 10_000);
	});

	it("leaves out function words that reduce to schwa in a sentence", () => {
		const words = new Set(EnglishPracticeStrut.map(({ word }) => word));
		for (const word of ["but", "from", "some", "must", "such", "thus"]) {
			expect(words.has(word), word).toBe(false);
		}
	});
});
