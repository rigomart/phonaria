import { describe, expect, it } from "vitest";
import { getWordAudioForms, getWordAudioPath } from "../../registries/registries";
import { findWordAudioForms, findWordAudioPath } from "../../registries/word-audio";
import type { WordAudioManifest } from "../types";
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

const withForms: WordAudioManifest = {
	voice: "jenny",
	words: ["either", "read", "seat"],
	forms: {
		either: [{ n: 2, label: "also said" }],
		lead: [{ n: 2, label: "the metal" }],
		read: [{ label: "present tense" }, { n: 2, label: "past tense" }],
	},
};

describe("getWordAudioForms", () => {
	it("lists every labelled form, main form first", () => {
		expect(findWordAudioForms(withForms, "en-us", " Read")).toEqual([
			{ path: "audio/en-us/words/jenny/read.ogg", label: "present tense" },
			{ path: "audio/en-us/words/jenny/read--2.ogg", label: "past tense" },
		]);
		expect(findWordAudioForms(withForms, "en-us", "either")).toEqual([
			{ path: "audio/en-us/words/jenny/either.ogg" },
			{ path: "audio/en-us/words/jenny/either--2.ogg", label: "also said" },
		]);
	});

	it("lists an uploaded form even when the main recording isn't", () => {
		expect(findWordAudioPath(withForms, "en-us", "lead")).toBeNull();
		expect(findWordAudioForms(withForms, "en-us", "lead")).toEqual([
			{ path: "audio/en-us/words/jenny/lead--2.ogg", label: "the metal" },
		]);
	});

	it("gives a word recorded once one unlabelled recording, and an unrecorded word none", () => {
		expect(findWordAudioForms(withForms, "en-us", "seat")).toEqual([
			{ path: "audio/en-us/words/jenny/seat.ogg" },
		]);
		expect(findWordAudioForms(withForms, "en-us", "constructor")).toEqual([]);
		expect(getWordAudioForms("en-us", "seat")).toEqual([
			{ path: getWordAudioPath("en-us", "seat") },
		]);
		expect(getWordAudioForms("en-us", "notaword")).toEqual([]);
		expect(getWordAudioForms("es-419", "seat")).toEqual([]);
	});
});

describe("EnglishWordAudio", () => {
	it("labels each form of a word once, as the manifest command writes them", () => {
		for (const [word, forms] of Object.entries(EnglishWordAudio.forms ?? {})) {
			expect(word).toMatch(/^[a-z]+$/);
			expect(forms.length).toBeGreaterThan(0);
			expect(new Set(forms.map(({ n }) => n)).size).toBe(forms.length);
			for (const { n, label } of forms) {
				expect(label.trim()).not.toBe("");
				if (n === undefined) expect(EnglishWordAudio.words).toContain(word);
				else expect(n).toBeGreaterThanOrEqual(2);
			}
		}
	});

	it("keeps full catalog and Practice coverage and allows recorded spelling examples", () => {
		const recorded = new Set(EnglishWordAudio.words);
		expect(recorded.size).toBe(EnglishWordAudio.words.length);
		expect([...recorded].filter((word) => !supportedWords.has(word))).toEqual([]);
		expect([...catalogWords].filter((word) => !recorded.has(word))).toEqual([]);
		expect([...practiceWords].filter((word) => !recorded.has(word))).toEqual([]);
	});
});
