import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { PronunciationLookup, WordJudgement } from "@phonaria/pronunciation";
import { describe, expect, it } from "vitest";
import type { ClipAudio } from "./clip-audio";
import { audioChecks, failedChecks, hearsTarget, median, scoreChecks } from "./clip-checks";

const dictionary: Record<string, PhonemeSymbolId[][]> = {
	read: [
		["R", "I", "D"],
		["R", "E", "D"],
	],
	red: [["R", "E", "D"]],
	every: [["E", "V", "R", "I"]],
	one: [["W", "AH", "N"]],
	won: [["W", "AH", "N"]],
	bed: [["B", "E", "D"]],
	riding: [["R", "AI", "D", "IX", "NG"]],
	ride: [["R", "AI", "D"]],
};
const lookup: PronunciationLookup = (word) => dictionary[word];
const transcript = (words: string[]) => ({ words, confidence: 0.9 });

describe("hearsTarget", () => {
	const readPast = { word: "read", pronunciation: ["R", "E", "D"] } as const;
	it("accepts the word itself and words that sound like the clip's own form", () => {
		expect(hearsTarget(transcript(["read"]), readPast, lookup)).toBe(true);
		expect(hearsTarget(transcript(["red"]), readPast, lookup)).toBe(true);
		expect(
			hearsTarget(transcript(["red"]), { word: "read", pronunciation: ["R", "I", "D"] }, lookup),
		).toBe(false);
		expect(
			hearsTarget(
				transcript(["every", "one"]),
				{ word: "everyone", pronunciation: ["E", "V", "R", "I", "W", "AH", "N"] },
				lookup,
			),
		).toBe(true);
	});
	it("hears a tapped /t/ as /d/ between vowels only", () => {
		const writing = { word: "writing", pronunciation: ["R", "AI", "T", "IX", "NG"] } as const;
		expect(hearsTarget(transcript(["riding"]), writing, lookup)).toBe(true);
		const write = { word: "write", pronunciation: ["R", "AI", "T"] } as const;
		expect(hearsTarget(transcript(["ride"]), write, lookup)).toBe(false);
	});
	it("rejects another word, an unknown word and no speech", () => {
		expect(hearsTarget(transcript(["bed"]), readPast, lookup)).toBe(false);
		expect(hearsTarget(transcript(["xiu"]), readPast, lookup)).toBe(false);
		expect(hearsTarget(null, readPast, lookup)).toBe(false);
		expect(hearsTarget(undefined, readPast, lookup)).toBe(false);
	});
});

describe("scoreChecks", () => {
	const target = { word: "read", pronunciation: ["R", "E", "D"] } as const;
	const judgement: WordJudgement = {
		pronunciationIndex: 0,
		sounds: [
			{ position: 0, phonemeId: "R", verdict: { type: "match" } },
			{ position: 1, phonemeId: "E", verdict: { type: "swapped", heard: "AE", heardWord: "rad" } },
			{ position: 2, phonemeId: "D", verdict: { type: "unclear", reason: "close-call" } },
		],
	};
	it("names swapped sounds and a low word score", () => {
		const checks = scoreChecks(
			{ transcript: transcript(["red"]), wordAccuracy: 0.6, judgement },
			target,
			lookup,
		);
		expect(failedChecks(checks)).toEqual(["no-swapped-sound", "word-accuracy"]);
		expect(checks["no-swapped-sound"]?.detail).toBe("/ɛ/ heard as /æ/ (rad)");
	});
	it("fails the sound check when no sound lined up", () => {
		const checks = scoreChecks(
			{ transcript: null, wordAccuracy: undefined, judgement: null },
			target,
			lookup,
		);
		expect(failedChecks(checks)).toEqual(["word-heard", "no-swapped-sound", "word-accuracy"]);
	});
});

describe("audioChecks", () => {
	const good: ClipAudio = {
		durationMs: 1826,
		speechMs: 470,
		leadingSilenceMs: 170,
		trailingSilenceMs: 1180,
		speechLevelDb: -19.5,
		peak: 0.6,
		clippedSamples: 0,
	};
	it("passes a clip like the published ones", () => {
		expect(failedChecks(audioChecks(good, 3, -19.6))).toEqual([]);
	});
	it("flags a short, cut-off, quiet, clipped clip", () => {
		const checks = audioChecks(
			{ ...good, speechMs: 300, trailingSilenceMs: 20, speechLevelDb: -30, clippedSamples: 12 },
			8,
			-19.6,
		);
		expect(failedChecks(checks)).toEqual(["duration", "edges", "loudness", "clipping"]);
	});
});

it("takes the median of finite values", () => {
	expect(median([3, 1, -Infinity, 2])).toBe(2);
	expect(median([4, 1, 2, 3])).toBe(2.5);
});
