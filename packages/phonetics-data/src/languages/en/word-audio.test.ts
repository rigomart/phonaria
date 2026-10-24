import { describe, expect, it } from "vitest";
import { getWordAudioPath } from "../../registries/registries";
import { EnglishPhonemeContrasts } from "./contrasts";
import { EnglishPhonemeSpellingPatterns } from "./patterns";
import { EnglishPracticeSchwa } from "./practice-schwa";
import { EnglishWordAudio } from "./word-audio";

const catalogWords = new Set(
	EnglishPhonemeContrasts.flatMap(({ minimalPairs }) => minimalPairs.flatMap(({ words }) => words)),
);
const practiceWords = new Set(EnglishPracticeSchwa.map(({ word }) => word));
const supportedWords = new Set([
	...catalogWords,
	...practiceWords,
	...Object.values(EnglishPhonemeSpellingPatterns).flatMap(({ examples }) =>
		examples.map(({ spelled }) => spelled.replace(/[[\]]/g, "")),
	),
]);

describe("getWordAudioPath", () => {
	it("returns the bucket-relative path of a recorded word", () => {
		expect(getWordAudioPath("en-us", "seat")).toBe("audio/en-us/words/jenny/seat.ogg");
	});

	it("ignores case and surrounding whitespace", () => {
		expect(getWordAudioPath("en-us", "  SeAt ")).toBe("audio/en-us/words/jenny/seat.ogg");
	});

	it("returns null for a word without a recording", () => {
		expect(getWordAudioPath("en-us", "notaword")).toBeNull();
		expect(getWordAudioPath("en-us", "")).toBeNull();
	});

	it("returns null for an accent without recordings", () => {
		expect(getWordAudioPath("es-419", "seat")).toBeNull();
	});
});

describe("EnglishWordAudio", () => {
	it("keeps full catalog and Practice coverage and allows recorded spelling examples", () => {
		const recorded = new Set(EnglishWordAudio.words);
		expect(recorded.size).toBe(EnglishWordAudio.words.length);
		expect([...recorded].filter((word) => !supportedWords.has(word))).toEqual([]);
		expect([...catalogWords].filter((word) => !recorded.has(word))).toEqual([]);
		expect([...practiceWords].filter((word) => !recorded.has(word))).toEqual([]);
	});
});
