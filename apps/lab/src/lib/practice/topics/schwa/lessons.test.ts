import { describe, expect, it } from "vitest";
import type { AlignmentOp } from "../../scoring";
import type { LessonWordResult } from "../types";
import { SchwaTopic } from "./index";
import { selectSchwaLessons } from "./lessons";

const match = (sound: string): AlignmentOp => ({ kind: "match", sound });
const sub = (target: string, source: string): AlignmentOp => ({
	kind: "substitution",
	target,
	source,
});
const omit = (target: string): AlignmentOp => ({ kind: "omission", target });
const insert = (source: string): AlignmentOp => ({ kind: "insertion", source });

const scored = (word: string, ops: AlignmentOp[]): LessonWordResult => ({
	word,
	blank: false,
	ops,
});
const blank = (word: string, ops: AlignmentOp[]): LessonWordResult => ({
	word,
	blank: true,
	ops,
});

describe("selectSchwaLessons", () => {
	it("returns nothing for an empty session", () => {
		expect(selectSchwaLessons([])).toEqual([]);
	});

	it("triggers schwa-omitted on an omission of AX", () => {
		const notes = selectSchwaLessons([scored("about", [omit("AX"), match("B")])]);
		expect(notes).toEqual([
			{
				id: "schwa-omitted",
				title: "The schwa you skipped",
				body: "Say the word slowly and count the beats. Every syllable needs a vowel, and in the syllables nobody stresses, that vowel is usually the quiet /ə/. It's easy to swallow — but it's there.",
				words: ["about"],
			},
		]);
	});

	it("triggers schwa-vs-strut on AX substituted with AH", () => {
		const notes = selectSchwaLessons([scored("support", [sub("AX", "AH")])]);
		expect(notes).toEqual([
			{
				id: "schwa-vs-strut",
				title: "Stressed out: /ə/ vs. /ʌ/",
				body: "You reached for /ʌ/ (as in *cup*). It's the closest full vowel to schwa, but it only shows up in stressed syllables — /ə/ never carries stress. If the syllable is the quiet one, go with /ə/.",
				words: ["support"],
			},
		]);
	});

	it("triggers schwa-vs-kit on AX substituted with IX", () => {
		const notes = selectSchwaLessons([scored("chicken", [sub("AX", "IX")])]);
		expect(notes).toEqual([
			{
				id: "schwa-vs-kit",
				title: "So close: /ə/ vs. /ɪ/",
				body: "You picked /ɪ/ (as in *kit*) where the answer wants /ə/. Honestly, these two blur together in unstressed syllables — even dictionaries argue about it. The dictionary we grade against hears /ə/ here, so when you're torn, let the mumble win.",
				words: ["chicken"],
			},
		]);
	});

	it("triggers schwa-spelling on AX substituted with any other vowel", () => {
		const notes = selectSchwaLessons([scored("holiday", [sub("AX", "OW")])]);
		expect(notes).toEqual([
			{
				id: "schwa-spelling",
				title: "The letter is bluffing",
				body: "You gave the vowel its full spelling sound — the one the letter advertises. In unstressed syllables, English quietly swaps that vowel for /ə/, no matter what's written. Trust the stress, not the spelling.",
				words: ["holiday"],
			},
		]);
	});

	it("triggers schwa-misplaced on AX substituted for another sound or inserted", () => {
		const expected = {
			id: "schwa-misplaced",
			title: "Schwa in the wrong seat",
			body: "You used /ə/ where the word doesn't have one — either in a stressed syllable, which keeps its full vowel, or as an extra beat the word doesn't have. Schwa only lives in unstressed syllables that are really there.",
		};
		expect(selectSchwaLessons([scored("record", [sub("EH", "AX")])])).toEqual([
			{ ...expected, words: ["record"] },
		]);
		expect(selectSchwaLessons([scored("film", [insert("AX")])])).toEqual([
			{ ...expected, words: ["film"] },
		]);
	});

	it("triggers blank-word on a blank word", () => {
		const notes = selectSchwaLessons([blank("banana", [omit("B"), omit("AX")])]);
		expect(notes).toEqual([
			{
				id: "blank-word",
				title: "About the blank one",
				body: "You left this word blank — that's fine. Its pronunciation is up in the list, and every symbol is tappable if you want to explore it. Next time, take a guess: even a wrong answer shows you which sounds you already hear.",
				words: ["banana"],
			},
		]);
	});

	it("excludes blank words from the op-keyed patterns even when their ops would qualify", () => {
		const notes = selectSchwaLessons([
			blank("sofa", [omit("S"), omit("OW"), omit("F"), omit("AX")]),
		]);
		expect(notes.map((note) => note.id)).toEqual(["blank-word"]);
	});

	it("emits notes in fixed catalog order regardless of trigger order", () => {
		const notes = selectSchwaLessons([
			blank("banana", [omit("AX")]),
			scored("film", [insert("AX")]),
			scored("holiday", [sub("AX", "OW")]),
			scored("chicken", [sub("AX", "IX")]),
			scored("support", [sub("AX", "AH")]),
			scored("about", [omit("AX")]),
		]);
		expect(notes.map((note) => note.id)).toEqual([
			"schwa-omitted",
			"schwa-vs-strut",
			"schwa-vs-kit",
			"schwa-spelling",
			"schwa-misplaced",
			"blank-word",
		]);
	});

	it("lists every triggering word in session order within one note", () => {
		const notes = selectSchwaLessons([
			scored("about", [omit("AX")]),
			scored("support", [sub("AX", "AH")]),
			scored("banana", [omit("AX")]),
		]);
		expect(notes.find((note) => note.id === "schwa-omitted")?.words).toEqual(["about", "banana"]);
	});

	it("names a word at most once per note even with two qualifying ops", () => {
		const notes = selectSchwaLessons([scored("banana", [omit("AX"), match("N"), omit("AX")])]);
		expect(notes).toHaveLength(1);
		expect(notes[0].words).toEqual(["banana"]);
	});

	it("ignores ops that match no pattern", () => {
		const notes = selectSchwaLessons([
			scored("cat", [match("AX"), sub("K", "T"), omit("K"), insert("T")]),
		]);
		expect(notes).toEqual([]);
	});
});

describe("SchwaTopic lesson wiring", () => {
	it("exposes the reveal display strings", () => {
		expect(SchwaTopic.display.topicStatLabel).toBe("schwas placed");
		expect(SchwaTopic.display.lessonsHeading).toBe("About those schwas");
	});

	it("selects lessons through selectSchwaLessons", () => {
		expect(SchwaTopic.selectLessons).toBe(selectSchwaLessons);
	});
});
