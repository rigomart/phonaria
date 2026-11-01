import { EnglishPhonemeContrasts } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import { contrastPageHeading, getContrastPage } from "@/lib/minimal-pairs";
import {
	drawWord,
	listContrastOptions,
	promptFor,
	validateMinimalPairSearch,
} from "./minimal-pair-prompt";

const getContrastOption = (id: string) => listContrastOptions().find((option) => option.id === id);

describe("listContrastOptions", () => {
	it("offers every catalog contrast with its two sounds and headline pair", () => {
		const options = listContrastOptions();
		expect(options).toHaveLength(EnglishPhonemeContrasts.length);
		expect(getContrastOption("i-ix")).toEqual({
			id: "i-ix",
			category: "vowel",
			sounds: [
				{ id: "IX", ipa: "ɪ" },
				{ id: "I", ipa: "i" },
			],
			example: ["ship", "sheep"],
		});
		expect(getContrastOption("p-b")?.category).toBe("consonant");
		expect(getContrastOption("ai-ei")?.category).toBe("vowel");
	});

	it("shows each contrast's headline pair, words and sounds in the order its page has them", () => {
		for (const { id } of EnglishPhonemeContrasts) {
			const page = getContrastPage(id);
			const option = getContrastOption(id);
			if (!page || !option) throw new Error(`Missing page or row for ${id}.`);
			const [a, b] = option.sounds;
			const [first, second] = option.example;
			expect(`/${a.ipa}/ vs /${b.ipa}/: ${first} vs ${second}`, id).toBe(contrastPageHeading(page));
		}
		expect(getContrastOption("th-t")?.example).toEqual(["three", "tree"]);
		expect(getContrastOption("th-s")?.example).toEqual(["think", "sink"]);
		expect(getContrastOption("l-r")?.example).toEqual(["light", "right"]);
	});
});

describe("promptFor", () => {
	it("targets the word's own sound and names its pair partner", () => {
		expect(promptFor("i-ix", "ship")).toEqual({
			contrastId: "i-ix",
			word: "ship",
			partnerWord: "sheep",
			target: { id: "IX", ipa: "ɪ" },
			partner: { id: "I", ipa: "i" },
			position: 1,
		});
		expect(promptFor("i-ix", "sheep")).toMatchObject({
			partnerWord: "ship",
			target: { id: "I" },
			partner: { id: "IX" },
			position: 1,
		});
	});

	it("finds the position of a sound that isn't the first vowel", () => {
		expect(promptFor("p-b", "lab")).toMatchObject({ target: { id: "B" }, position: 2 });
		expect(promptFor("ae-a", "adopt")).toMatchObject({ target: { id: "A" }, position: 2 });
	});

	it("is null for a word outside the contrast or an unknown contrast", () => {
		expect(promptFor("i-ix", "bat")).toBeNull();
		expect(promptFor("nope", "ship")).toBeNull();
	});

	it("builds a prompt for both words of every catalog pair", () => {
		for (const contrast of EnglishPhonemeContrasts) {
			for (const { words } of contrast.minimalPairs) {
				for (const word of words) {
					const prompt = promptFor(contrast.id, word);
					expect(prompt, `${contrast.id}: ${word}`).not.toBeNull();
					expect(contrast.phonemeIds).toContain(prompt?.target.id);
					expect(contrast.phonemeIds).toContain(prompt?.partner.id);
				}
			}
		}
	});
});

describe("drawWord", () => {
	it("draws from either side of any pair", () => {
		expect(drawWord("u-ux", undefined, () => 0)).toBe("pool");
		expect(drawWord("u-ux", undefined, () => 0.99)).toBe("full");
	});

	it("never repeats the previous word", () => {
		for (const random of [0, 0.3, 0.6, 0.99]) {
			expect(drawWord("u-ux", "pool", () => random)).not.toBe("pool");
		}
	});

	it("is null for an unknown contrast", () => {
		expect(drawWord("nope")).toBeNull();
	});
});

describe("validateMinimalPairSearch", () => {
	it("keeps a known contrast and a word from its pairs", () => {
		expect(validateMinimalPairSearch({ contrast: "i-ix", word: "ship" })).toEqual({
			contrast: "i-ix",
			word: "ship",
		});
	});

	it("drops a word from another contrast, and an unknown contrast", () => {
		expect(validateMinimalPairSearch({ contrast: "i-ix", word: "bat" })).toEqual({
			contrast: "i-ix",
		});
		expect(validateMinimalPairSearch({ contrast: "nope", word: "ship" })).toEqual({});
		expect(validateMinimalPairSearch({ contrast: 3 })).toEqual({});
	});
});
