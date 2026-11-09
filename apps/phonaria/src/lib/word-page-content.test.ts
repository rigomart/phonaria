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

	it("gives every sound of enough its letters, name, page and recording", () => {
		const view = getWordPageView("enough");
		expect(view?.name).toBe("Enough");
		expect(view?.ipa).toBe("ɪˈnʌf");
		expect(
			view?.sounds.map(({ letters, sound, name, stressed }) => [
				letters,
				sound.ipa,
				name,
				stressed,
			]),
		).toEqual([
			["e", "ɪ", "Short I", false],
			["n", "n", "N", true],
			["ou", "ʌ", "Short U", true],
			["gh", "f", "F", true],
		]);
		expect(view?.sounds[3].sound.path).toBe("/sounds/f-fan");
		expect(view?.sounds[3].audioPath).toBe("/audio/phonemes/F.ogg");
	});

	it("leaves out the recording of a sound that has none", () => {
		const [, ow] = getWordPageView("know")?.sounds ?? [];
		expect(ow.name).toBe("Long O");
		expect(ow.audioPath).toBeNull();
	});

	it("sizes each spelling against its sound's spellings, rare ones under 2%", () => {
		const sounds = getWordPageView("enough")?.sounds ?? [];
		const [, n, , gh] = sounds;
		expect(n.rare).toBe(false);
		expect(n.percentage).toBeGreaterThan(90);
		expect(gh.rare).toBe(true);
		expect(gh.percentage).toBeLessThan(2);
		expect(gh.shares.filter(({ own }) => own)).toEqual([
			{ spelling: "gh", percentage: gh.percentage, own: true },
		]);
		expect(gh.shares.reduce((sum, { percentage }) => sum + percentage, 0)).toBeCloseTo(100, 1);
	});

	it("gives other words spelled the same way, linking those with a page", () => {
		const gh = getWordPageView("enough")?.sounds[3];
		expect(gh?.examples.map(({ word }) => word)).toEqual(["tough", "laugh", "rough"]);
		const kn = getWordPageView("know")?.sounds[0];
		expect(kn?.examples.find(({ word }) => word === "known")?.path).toBe("/words/known");
	});

	it("gives a stressed vowel no example whose matching vowel is unstressed", () => {
		expect(getWordPageView("women")?.sounds[1].examples).toEqual([]);
	});

	it("shows a split spelling's letters together", () => {
		expect(getWordPageView("move")?.sounds.map(({ letters }) => letters)).toEqual([
			"m",
			"o…e",
			"v",
		]);
	});

	it("links a sound to the contrast page of the minimal pair it changes in", () => {
		const [kn, ow] = getWordPageView("know")?.sounds ?? [];
		expect(kn.contrasts).toEqual([]);
		expect(ow.contrasts).toEqual([
			expect.objectContaining({ other: "now", path: "/minimal-pairs/ou-au" }),
		]);
	});

	it("links a pair only from the sound that changes, not every card with that sound", () => {
		const taught = getWordPageView("taught")?.sounds ?? [];
		expect(taught.map(({ sound }) => sound.ipa)).toEqual(["t", "ɔ", "t"]);
		expect(taught.map(({ contrasts }) => contrasts.map(({ other }) => other))).toEqual([
			["thought"],
			[],
			[],
		]);
	});

	it("describes the page with the word's IPA", () => {
		const view = getWordPageView("enough");
		if (!view) throw new Error("enough has a page");
		expect(wordPageDescription(view)).toBe(
			"Enough in IPA is /ɪˈnʌf/ in American English. Hear it and see which letters spell each sound.",
		);
	});
});
