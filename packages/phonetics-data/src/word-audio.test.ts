import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EnglishCuratedTop1k } from "./data/en/curated-1k";
import { EnglishCuratedTop10k } from "./data/en/curated-10k";
import { EnglishWordAudio } from "./data/en/word-audio";
import { EnglishPhonemeContrasts } from "./languages/en/contrasts";
import { EnglishPhonemeSpellingPatterns } from "./languages/en/patterns";
import { EnglishPracticeSchwa } from "./languages/en/practice-schwa";
import type { WordAudioManifest } from "./languages/types";
import { getWordAudioForms, getWordAudioPath, loadWordAudioManifest } from "./word-audio";

const catalogWords = new Set(
	EnglishPhonemeContrasts.flatMap(({ minimalPairs }) => minimalPairs.flatMap(({ words }) => words)),
);
const practiceWords = new Set(EnglishPracticeSchwa.map(({ word }) => word));
const spellingWords = new Set(
	Object.values(EnglishPhonemeSpellingPatterns).flatMap(({ examples }) =>
		examples.map(({ spelled }) => spelled.replace(/[[\]]/g, "")),
	),
);
/** Every source audio-gen records from: the catalog, Practice, spelling and the curated tiers. */
const knownWords = new Set([
	...catalogWords,
	...practiceWords,
	...spellingWords,
	...Object.keys(EnglishCuratedTop1k.words),
	...Object.keys(EnglishCuratedTop10k.words),
]);

describe("loadWordAudioManifest", () => {
	it("loads the en-us manifest once per module, and none for an accent without recordings", async () => {
		expect(await loadWordAudioManifest("en-us")).toBe(EnglishWordAudio);
		expect(await loadWordAudioManifest("en-us")).toBe(EnglishWordAudio);
		expect(await loadWordAudioManifest("es-419")).toBeNull();
	});
});

describe("getWordAudioPath", () => {
	it("returns the bucket-relative path of a recorded word", () => {
		expect(getWordAudioPath(EnglishWordAudio, "en-us", "seat")).toBe(
			"audio/en-us/words/jenny/seat.ogg",
		);
	});

	it("ignores case and surrounding whitespace", () => {
		expect(getWordAudioPath(EnglishWordAudio, "en-us", "  SeAt ")).toBe(
			"audio/en-us/words/jenny/seat.ogg",
		);
	});

	it("returns null for a word without a recording", () => {
		expect(getWordAudioPath(EnglishWordAudio, "en-us", "notaword")).toBeNull();
		expect(getWordAudioPath(EnglishWordAudio, "en-us", "")).toBeNull();
	});
});

const withForms: WordAudioManifest = {
	voice: "jenny",
	words: ["either", "read", "seat"],
	forms: {
		either: [
			{ pronunciation: "I1 DH ER0" },
			{ n: 2, label: "also said", pronunciation: "AI1 DH ER0" },
		],
		lead: [{ n: 2, label: "the metal", pronunciation: "L E1 D" }],
		read: [
			{ label: "present tense", pronunciation: "R I1 D" },
			{ n: 2, label: "past tense", pronunciation: "R E1 D" },
		],
	},
};

describe("getWordAudioForms", () => {
	it("lists every form with its pronunciation, main form first", () => {
		expect(getWordAudioForms(withForms, "en-us", " Read")).toEqual([
			{ path: "audio/en-us/words/jenny/read.ogg", label: "present tense", pronunciation: "R I1 D" },
			{ path: "audio/en-us/words/jenny/read--2.ogg", label: "past tense", pronunciation: "R E1 D" },
		]);
		expect(getWordAudioForms(withForms, "en-us", "either")).toEqual([
			{ path: "audio/en-us/words/jenny/either.ogg", pronunciation: "I1 DH ER0" },
			{
				path: "audio/en-us/words/jenny/either--2.ogg",
				label: "also said",
				pronunciation: "AI1 DH ER0",
			},
		]);
	});

	it("lists an uploaded form even when the main recording isn't", () => {
		expect(getWordAudioPath(withForms, "en-us", "lead")).toBeNull();
		expect(getWordAudioForms(withForms, "en-us", "lead")).toEqual([
			{ path: "audio/en-us/words/jenny/lead--2.ogg", label: "the metal", pronunciation: "L E1 D" },
		]);
	});

	it("gives a word recorded once one recording without label or pronunciation, and an unrecorded word none", () => {
		expect(getWordAudioForms(withForms, "en-us", "seat")).toEqual([
			{ path: "audio/en-us/words/jenny/seat.ogg" },
		]);
		expect(getWordAudioForms(withForms, "en-us", "constructor")).toEqual([]);
	});
});

describe("EnglishWordAudio", () => {
	it("lists each form of a word once with its pronunciation, labelling every extra form", () => {
		for (const [word, forms] of Object.entries(EnglishWordAudio.forms ?? {})) {
			expect(word).toMatch(/^[a-z]+$/);
			expect(forms.length).toBeGreaterThan(0);
			expect(new Set(forms.map(({ n }) => n)).size).toBe(forms.length);
			for (const { n, label, pronunciation } of forms) {
				expect(pronunciation).toMatch(/^[A-Z]+[0-2]?( [A-Z]+[0-2]?)*$/);
				if (n === undefined) expect(EnglishWordAudio.words).toContain(word);
				else {
					expect(n).toBeGreaterThanOrEqual(2);
					expect(label?.trim()).toBeTruthy();
				}
			}
		}
	});

	it("gives a heteronym's main recording its own pronunciation, not the dictionary's first (#378)", () => {
		expect(EnglishCuratedTop1k.words.read[0]).toBe("R E1 D");
		expect(getWordAudioForms(EnglishWordAudio, "en-us", "read")).toEqual([
			{ path: "audio/en-us/words/jenny/read.ogg", label: "present tense", pronunciation: "R I1 D" },
			{ path: "audio/en-us/words/jenny/read--2.ogg", label: "past tense", pronunciation: "R E1 D" },
		]);
		expect(getWordAudioForms(EnglishWordAudio, "en-us", "seat")).toEqual([
			{ path: "audio/en-us/words/jenny/seat.ogg" },
		]);
	});

	it("lists each word once, and only words from a source audio-gen records", () => {
		const recorded = new Set(EnglishWordAudio.words);
		expect(recorded.size).toBe(EnglishWordAudio.words.length);
		const listed = [...recorded, ...Object.keys(EnglishWordAudio.forms ?? {})];
		expect(listed.filter((word) => !knownWords.has(word))).toEqual([]);
	});

	it("keeps every catalog, Practice and spelling word recorded", () => {
		const recorded = new Set(EnglishWordAudio.words);
		expect([...catalogWords].filter((word) => !recorded.has(word))).toEqual([]);
		expect([...practiceWords].filter((word) => !recorded.has(word))).toEqual([]);
		expect([...spellingWords].filter((word) => !recorded.has(word))).toEqual([]);
	});
});

describe("word-audio manifest boundary", () => {
	it("is imported only through its subpath and the dynamic loader, never by the package entry", () => {
		const root = import.meta.dirname;
		const sources = readdirSync(root, { recursive: true, encoding: "utf8" })
			.filter((file) => /\.tsx?$/.test(file) && !/\.test(-d)?\.ts$/.test(file))
			.map((file) => ({ file, source: readFileSync(path.join(root, file), "utf8") }));
		expect(
			sources.filter(({ source }) => source.includes("word-audio.json")).map(({ file }) => file),
		).toEqual([path.join("data", "en", "word-audio.ts")]);
		expect(
			sources
				.filter(({ source }) => /from\s+["'][^"']*data\/en\/word-audio["']/.test(source))
				.map(({ file }) => file),
		).toEqual([]);
	});
});
