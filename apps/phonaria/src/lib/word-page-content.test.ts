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

	it("names gh as rare for /f/, with other words that end in it first", () => {
		const [gh] = getWordPageView("enough")?.unusual ?? [];
		expect(gh).toMatchObject({ spelling: "gh", sound: { ipa: "f" } });
		expect(gh.percentage).toBeLessThan(2);
		expect(gh.others.map(({ word }) => word).slice(0, 2)).toEqual(["tough", "laugh"]);
		expect(gh.others.some(({ word }) => word === "enough")).toBe(false);
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
			"Enough in IPA is /ɪˈnʌf/ in American English, with a recording and the letters behind each sound. The gh spells /f/, as in tough: only 1.0% of /f/ sounds are spelled gh.",
		);
	});
});
