import { describe, expect, it } from "vitest";
import { buildFeatureValueByPhoneme, type PhonemeArticulation } from "./phoneme-articulations";

// Hand-authored fixtures distinguish consonant, simple-vowel and diphthong fields.
const articulations = {
	P: {
		category: "consonant",
		features: { voicing: "voiceless", place: "bilabial", manner: "plosive" },
	},
	I: {
		category: "vowel",
		vowelType: "monophthong",
		features: { height: "close", backness: "front", roundness: "unrounded", tenseness: "tense" },
	},
	ER: {
		category: "vowel",
		vowelType: "monophthong",
		features: {
			height: "open-mid",
			backness: "central",
			roundness: "unrounded",
			tenseness: "tense",
			rhoticity: "r-colored",
		},
	},
	AI: {
		category: "vowel",
		vowelType: "diphthong",
		features: {
			height: "open",
			backness: "front",
			roundness: "unrounded",
			targetHeight: "near-close",
			targetBackness: "near-front",
			targetRoundness: "unrounded",
		},
	},
} satisfies Record<"P" | "I" | "ER" | "AI", PhonemeArticulation>;

describe("buildFeatureValueByPhoneme", () => {
	it("indexes applicable features without confusing diphthong starts and endpoints", () => {
		expect(buildFeatureValueByPhoneme(["P", "I", "ER", "AI"], articulations)).toEqual({
			voicing: { P: "voiceless" },
			place: { P: "bilabial" },
			manner: { P: "plosive" },
			height: { I: "close", ER: "open-mid", AI: "open" },
			backness: { I: "front", ER: "central", AI: "front" },
			roundness: { I: "unrounded", ER: "unrounded", AI: "unrounded" },
			tenseness: { I: "tense", ER: "tense" },
			rhoticity: { ER: "r-colored" },
		});
	});

	it("indexes only requested sounds even when more articulation data is available", () => {
		expect(buildFeatureValueByPhoneme(["P"], articulations)).toEqual({
			voicing: { P: "voiceless" },
			place: { P: "bilabial" },
			manner: { P: "plosive" },
			height: {},
			backness: {},
			roundness: {},
			tenseness: {},
			rhoticity: {},
		});
	});

	it("returns usable empty indexes for an empty inventory", () => {
		expect(buildFeatureValueByPhoneme([], {})).toEqual({
			voicing: {},
			place: {},
			manner: {},
			height: {},
			backness: {},
			roundness: {},
			tenseness: {},
			rhoticity: {},
		});
	});

	it("does not retain entries between independently built indexes", () => {
		const first = buildFeatureValueByPhoneme(["P"], articulations);
		first.voicing.P = "voiced";
		expect(buildFeatureValueByPhoneme(["P"], articulations).voicing).toEqual({ P: "voiceless" });
		expect(articulations.P.features.voicing).toBe("voiceless");
	});
});
