import { describe, expect, it } from "vitest";
import { formatWordIpa, getWordPageView, wordPageDescription } from "./word-page-content";
import { findWordPagePath, hasWordPage, listWordPagePaths } from "./word-pages";

describe("word pages", () => {
	it("serves only listed words, by their lowercase spelling", () => {
		expect(hasWordPage("enough")).toBe(true);
		expect(hasWordPage("Enough")).toBe(false);
		expect(findWordPagePath(" Enough ")).toBe("/words/enough");
		expect(findWordPagePath("will")).toBeUndefined();
		expect(listWordPagePaths()).toContain("/words/colonel");
	});

	it("writes IPA with stress marks, none on one syllable", () => {
		expect(formatWordIpa("IX0 N AH1 F")).toBe("ɪˈnʌf");
		expect(formatWordIpa("N OU1")).toBe("noʊ");
		expect(formatWordIpa("E1 N J AX0 N IX1 R IX0 NG")).toBe("ˌɛndʒəˈnɪɹɪŋ");
	});

	it("splits enough over its sounds, each linking to its sound page", () => {
		const view = getWordPageView("enough");
		expect(view?.name).toBe("Enough");
		expect(view?.ipa).toBe("ɪˈnʌf");
		expect(
			view?.letters.map(({ letters, sounds }) => [letters, sounds.map(({ ipa }) => ipa)]),
		).toEqual([
			["e", ["ɪ"]],
			["n", ["n"]],
			["ou", ["ʌ"]],
			["gh", ["f"]],
		]);
		expect(view?.letters[3].sounds[0].path).toBe("/sounds/f-fan");
	});

	it("names gh as rare for /f/, sized against /f/'s other spellings, with words that end in it", () => {
		const [gh] = getWordPageView("enough")?.unusual ?? [];
		expect(gh).toMatchObject({ spelling: "gh", sound: { ipa: "f" } });
		expect(gh.percentage).toBeLessThan(2);
		expect(gh.others.map(({ word }) => word).slice(0, 2)).toEqual(["tough", "laugh"]);
		expect(gh.others.some(({ word }) => word === "enough")).toBe(false);
		expect(gh.shares.filter(({ own }) => own)).toEqual([
			{ spelling: "gh", percentage: gh.percentage, own: true },
		]);
		expect(gh.shares[0]).toMatchObject({ spelling: "f", own: false });
		expect(gh.shares.reduce((sum, { percentage }) => sum + percentage, 0)).toBeCloseTo(100, 1);
		expect(getWordPageView("enough")?.letters.map(({ rare }) => rare)).toEqual([
			false,
			false,
			false,
			true,
		]);
	});

	it("marks both letter groups of a split rare spelling", () => {
		const move = getWordPageView("move");
		expect(move?.unusual[0].spelling).toBe("o-e");
		expect(move?.letters.map(({ letters, rare }) => [letters, rare])).toEqual([
			["m", false],
			["o", true],
			["v", false],
			["e", true],
		]);
	});

	it("gives no example word whose matching vowel is unstressed", () => {
		expect(getWordPageView("women")?.unusual[0].others).toEqual([]);
	});

	it("lists a word's minimal pairs with their contrast page, and none where it has none", () => {
		expect(getWordPageView("know")?.pairs).toEqual([
			expect.objectContaining({ other: "now", path: "/minimal-pairs/ou-au" }),
		]);
		expect(getWordPageView("enough")?.pairs).toEqual([]);
	});

	it("describes the page with the word's IPA and its unusual spelling", () => {
		const view = getWordPageView("enough");
		if (!view) throw new Error("enough has a page");
		expect(wordPageDescription(view)).toBe(
			"Enough in IPA is /ɪˈnʌf/ in American English. Hear it and see which letters spell each sound.",
		);
	});
});
