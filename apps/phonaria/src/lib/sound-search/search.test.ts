import type { CuratedWordData } from "@phonaria/phonetics-data/data/en/curated-1k";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import {
	buildExampleWords,
	buildSoundIndex,
	formatSoundsParam,
	MAX_PICKED_SOUNDS,
	normalizeSoundsParam,
	parseSoundsParam,
	searchBySounds,
	soundsToIpa,
} from "./search";

function words(entries: Record<string, string[]>): CuratedWordData {
	return {
		meta: {
			version: "test",
			tier: "test",
			wordCount: Object.keys(entries).length,
			generatedAt: "",
			license: "",
			attribution: "",
			sources: { wordfreq: "", cmudict: "" },
		},
		words: entries,
	};
}

// Frequency order: the first key is the most common word.
const index = buildSoundIndex(
	words({
		thing: ["TH IX1 NG"],
		think: ["TH IX1 NG K"],
		this: ["DH IX1 S"],
		thin: ["TH IX1 N"],
		read: ["R I1 D", "R E1 D"],
		red: ["R E1 D"],
		ing: ["IX1 NG"],
	}),
);

describe("searchBySounds", () => {
	it("returns the words that start with the picked sounds, most common first", () => {
		const result = searchBySounds(index, ["TH", "IX"]);
		expect(result.matches.map((match) => match.word)).toEqual(["thing", "think", "thin"]);
		expect(result.exactCount).toBe(0);
	});

	it("puts a word whose whole pronunciation is the picked sounds first", () => {
		const result = searchBySounds(index, ["TH", "IX", "NG"]);
		expect(result.matches.map((match) => [match.word, match.exact])).toEqual([
			["thing", true],
			["think", false],
		]);
		expect(result.exactCount).toBe(1);
	});

	it("ignores stress", () => {
		expect(searchBySounds(index, ["IX", "NG"]).matches.map((match) => match.word)).toEqual(["ing"]);
	});

	it("matches any of a word's pronunciations and keeps the one that matched", () => {
		const result = searchBySounds(index, ["R", "E"]);
		expect(result.matches.map((match) => [match.word, match.pronunciation.join(" ")])).toEqual([
			["read", "R E D"],
			["red", "R E D"],
		]);
	});

	it("counts how many words each next sound leaves", () => {
		const result = searchBySounds(index, ["TH", "IX"]);
		expect(Object.fromEntries(result.next)).toEqual({ NG: 2, N: 1 });
	});

	it("counts every first sound when nothing is picked", () => {
		const result = searchBySounds(index, []);
		expect(result.matches).toHaveLength(7);
		expect(result.next.get("TH")).toBe(3);
		expect(result.next.has("NG")).toBe(false);
	});

	it("finds no word and no next sound for a sequence nothing starts with", () => {
		const result = searchBySounds(index, ["NG"]);
		expect(result.matches).toEqual([]);
		expect(result.next.size).toBe(0);
	});
});

describe("against the 10k list", () => {
	const top10k = buildSoundIndex(EnglishCuratedTop10k);

	it("finds think for /θɪ/ and leaves out this, which starts with /ð/", () => {
		const found = searchBySounds(top10k, ["TH", "IX"]).matches.map((match) => match.word);
		expect(found).toContain("think");
		expect(found).toContain("thing");
		expect(found).not.toContain("this");
	});

	it("answers /θɪŋk/ with think first", () => {
		expect(searchBySounds(top10k, ["TH", "IX", "NG", "K"]).matches[0]).toMatchObject({
			word: "think",
			exact: true,
		});
	});
});

describe("buildExampleWords", () => {
	it("prefers a word that starts with the sound, else one that has it", () => {
		const examples = buildExampleWords(index);
		expect(examples.get("TH")).toBe("thing");
		expect(examples.get("NG")).toBe("thing");
		expect(examples.get("DH")).toBe("this");
	});

	it("skips one-letter words and words with apostrophes", () => {
		const examples = buildExampleWords(
			buildSoundIndex(words({ i: ["AI1"], "i'm": ["AI1 M"], ice: ["AI1 S"] })),
		);
		expect(examples.get("AI")).toBe("ice");
	});
});

describe("sounds param", () => {
	it("round-trips picked sounds", () => {
		expect(parseSoundsParam(formatSoundsParam(["TH", "IX"]))).toEqual(["TH", "IX"]);
		expect(formatSoundsParam(["TH", "IX"])).toBe("TH-IX");
	});

	it("drops IDs outside the en-us inventory", () => {
		expect(parseSoundsParam("TH-XX-EE-IX")).toEqual(["TH", "IX"]);
	});

	it("keeps an empty value, which means sound mode with nothing picked", () => {
		expect(normalizeSoundsParam("")).toBe("");
		expect(normalizeSoundsParam(undefined)).toBeUndefined();
		expect(normalizeSoundsParam(3)).toBeUndefined();
	});

	it("caps how many sounds a URL can pick", () => {
		const long = Array.from({ length: 30 }, () => "S").join("-");
		expect(parseSoundsParam(long)).toHaveLength(MAX_PICKED_SOUNDS);
	});

	it("writes the sounds in IPA", () => {
		expect(soundsToIpa(["TH", "IX", "NG", "K"])).toBe("θɪŋk");
	});
});
