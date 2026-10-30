import { EnglishPhonemeContrasts } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { contrastPageHref, getContrastPage, listContrastPagePaths } from "./minimal-pairs";

describe("contrast pages", () => {
	it("has one page per catalog contrast, at its ID, in catalog order", () => {
		expect(listContrastPagePaths()).toEqual(
			EnglishPhonemeContrasts.map((contrast) => `/minimal-pairs/${contrast.id}`),
		);
	});

	it("holds the contrast's sounds and every one of its pairs", () => {
		const page = getContrastPage("th-s");
		expect(page?.category).toBe("consonant");
		expect(page?.sounds).toEqual([
			{ id: "TH", ipa: "θ", label: "Voiceless dental fricative" },
			{ id: "S", ipa: "s", label: "Voiceless alveolar fricative" },
		]);
		expect(page?.pairs).toHaveLength(11);
		expect(page?.pairs).toContainEqual(["think", "sink"]);
	});

	it("has no page for an unknown contrast", () => {
		expect(getContrastPage("th-zz")).toBeUndefined();
	});

	it("adds the practice word to the URL only when there is one", () => {
		expect(contrastPageHref("i-ix")).toBe("/minimal-pairs/i-ix");
		expect(contrastPageHref("i-ix", "ship")).toBe("/minimal-pairs/i-ix?word=ship");
	});
});

describe("how the two sounds differ", () => {
	const difference = (id: string) => getContrastPage(id)?.difference;

	it("says, in plain words, only what differs", () => {
		expect(difference("p-b")).toBe(
			"/p/ is made with the voice off. /b/ is made with the voice on. Everything else is the same.",
		);
		expect(difference("th-s")).toBe(
			"/θ/ is made with the tongue between the teeth. /s/ is made with the tongue tip on the gum ridge behind the top teeth. Everything else is the same.",
		);
	});

	it("says what the air does when that differs", () => {
		expect(difference("ch-sh")).toBe(
			"/tʃ/ is made by stopping the air and releasing it as a hiss. /ʃ/ is made by pushing air through a narrow gap. Everything else is the same.",
		);
		expect(difference("th-t")).toBe(
			"/θ/ is made with the tongue between the teeth, pushing air through a narrow gap. /t/ is made with the tongue tip on the gum ridge behind the top teeth, stopping the air and releasing it. Everything else is the same.",
		);
	});

	it("compares vowels by how open the mouth is, where the tongue sits and the lips", () => {
		expect(difference("i-ix")).toBe(
			"Compared with /i/, /ɪ/ is said with the mouth more open and the tongue further back.",
		);
		expect(difference("ux-ah")).toBe(
			"Compared with /ʊ/, /ʌ/ is said with the mouth more open, the tongue further back and the lips relaxed.",
		);
	});

	it("compares diphthongs by where they start and end", () => {
		expect(difference("ai-ei")).toBe(
			"Compared with /aɪ/, /eɪ/ starts with the mouth less open. Both end the same way.",
		);
	});

	it("compares every contrast in the catalog rather than falling back to the two labels", () => {
		for (const { id } of EnglishPhonemeContrasts) {
			expect(difference(id), id).toMatch(/ is made |^Compared with /);
		}
	});
});
