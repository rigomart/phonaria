import { describe, expect, it } from "vitest";
import { EnglishCuratedTop10k } from "../../data/en/curated-10k";
import { findLetterSoundGap, type LetterGroup, matchLettersToSounds } from "./letter-sounds";
import { toBasePhonemeIds } from "./minimal-pairs";

function split(word: string, variant: string): string[] | null {
	const groups = matchLettersToSounds(word, toBasePhonemeIds(variant));
	return groups?.map(formatGroup) ?? null;
}

function formatGroup({ letters, phonemes }: LetterGroup): string {
	return `${letters}:${phonemes.join(" ")}`;
}

describe("matchLettersToSounds", () => {
	it.each([
		["knight", "N AI1 T", ["kn:N", "igh:AI", "t:T"]],
		["though", "DH OU1", ["th:DH", "ough:OU"]],
		["through", "TH R U1", ["th:TH", "r:R", "ough:U"]],
		["tough", "T AH1 F", ["t:T", "ou:AH", "gh:F"]],
		["thought", "TH O1 T", ["th:TH", "ough:O", "t:T"]],
		["island", "AI1 L AX0 N D", ["i:AI", "s:", "l:L", "a:AX", "n:N", "d:D"]],
	])("splits %s into its letter groups", (word, variant, expected) => {
		expect(split(word, variant)).toEqual(expected);
	});

	it("allows more than one silent letter", () => {
		expect(split("wednesday", "W E1 N Z D I0")).toEqual([
			"w:W",
			"e:E",
			"d:",
			"n:N",
			"e:",
			"s:Z",
			"d:D",
			"ay:I",
		]);
	});

	it("lets one letter spell two sounds", () => {
		expect(split("box", "B A1 K S")).toEqual(["b:B", "o:A", "x:K S"]);
		expect(split("table", "T EI1 B AX0 L")).toEqual(["t:T", "a:EI", "b:B", "le:AX L"]);
	});

	it("prefers a known letter group to a silent letter", () => {
		expect(split("write", "R AI1 T")).toEqual(["wr:R", "i:AI", "t:T", "e:"]);
		expect(split("door", "D O1 R")).toEqual(["d:D", "oo:O", "r:R"]);
	});

	it("follows the chosen pronunciation", () => {
		expect(split("record", "R E1 K ER0 D")).toEqual(["r:R", "e:E", "c:K", "or:ER", "d:D"]);
		expect(split("record", "R IX0 K O1 R D")).toEqual(["r:R", "e:IX", "c:K", "o:O", "r:R", "d:D"]);
	});

	it("returns null when the spelling and pronunciation do not match", () => {
		expect(split("cat", "D A1 G")).toBeNull();
		expect(split("cat", "K AE1 T S")).toBeNull();
	});

	it("returns null for an empty spelling or pronunciation", () => {
		expect(matchLettersToSounds("", ["K"])).toBeNull();
		expect(matchLettersToSounds("cat", [])).toBeNull();
	});

	it("gives back the spelling unchanged, including case and apostrophes", () => {
		const groups = matchLettersToSounds("Don't", toBasePhonemeIds("D OU1 N T"));
		expect(groups?.map(formatGroup)).toEqual(["D:D", "o:OU", "n:N", "':", "t:T"]);
	});

	it("fails on letters outside a-z instead of treating them as silent", () => {
		expect(split("café", "K AE0 F EI1")).toBeNull();
	});

	it("accepts a typographic apostrophe and uppercase letters", () => {
		expect(split("WON’T", "W OU1 N T")).toEqual(["W:W", "O:OU", "N:N", "’:", "T:T"]);
	});

	it("splits at least 98% of the top-10k words by their first pronunciation", () => {
		const entries = Object.entries(EnglishCuratedTop10k.words);
		let splitCount = 0;
		for (const [word, [variant]] of entries) {
			const groups = matchLettersToSounds(word, toBasePhonemeIds(variant));
			if (!groups) continue;
			splitCount++;
			expect(groups.map((group) => group.letters).join("")).toBe(word);
			expect(groups.flatMap((group) => group.phonemes)).toEqual(toBasePhonemeIds(variant));
		}
		expect(splitCount / entries.length).toBeGreaterThanOrEqual(0.98);
	});
});

describe("findLetterSoundGap", () => {
	it("returns null when the word splits", () => {
		expect(findLetterSoundGap("knight", toBasePhonemeIds("N AI1 T"))).toBeNull();
	});

	it("returns what is left after the furthest match", () => {
		expect(findLetterSoundGap("colonel", toBasePhonemeIds("K ER1 N AX0 L"))).toEqual({
			letters: "olonel",
			phonemes: ["ER", "N", "AX", "L"],
		});
		expect(findLetterSoundGap("tv", toBasePhonemeIds("T I1 V I1"))).toEqual({
			letters: "v",
			phonemes: ["I", "V", "I"],
		});
	});
});
