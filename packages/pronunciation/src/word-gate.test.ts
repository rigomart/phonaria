import { type PhonemeSymbolId, toBasePhonemeIds } from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { azureEvidenceFromResponse } from "./azure/evidence";
import { MISCUE_FIXTURES } from "./azure/fixtures/miscue";
import type { ScoringRequest, Transcript, WordEvidence } from "./contract";
import { gateWord, type PronunciationLookup, type WordGateInput } from "./word-gate";

const SHIP: ScoringRequest = {
	targetAccent: "en-us",
	words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
};
const JUDGED = new Set<PhonemeSymbolId>(["IX", "I"]);

const dictionary: PronunciationLookup = (word) =>
	EnglishCuratedTop10k.words[word]?.map((variant) => toBasePhonemeIds(variant));

function gate(overrides: Partial<WordGateInput> & Pick<WordGateInput, "evidence" | "transcript">) {
	return gateWord({
		target: SHIP.words[0],
		judgedPhonemeIds: JUDGED,
		targetAccent: "en-us",
		pronunciationsOf: dictionary,
		...overrides,
	});
}

function gateFixture(said: keyof typeof MISCUE_FIXTURES) {
	const { assessment, recognition } = MISCUE_FIXTURES[said];
	const recording = azureEvidenceFromResponse(assessment, SHIP, recognition);
	return gate({ evidence: recording.words[0], transcript: recording.transcript });
}

/** Ship's evidence with the given accuracies for the word and for SH, IX and P. */
function shipEvidence(word: number, [sh, ix, p]: readonly [number, number, number]): WordEvidence {
	const sound = (phonemeId: PhonemeSymbolId, accuracy: number) => ({
		type: "scored" as const,
		phonemeId,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore: 1,
		rivals: [],
		accuracy,
	});
	return {
		accuracy: word,
		pronunciations: [
			{ pronunciationIndex: 0, sounds: [sound("SH", sh), sound("IX", ix), sound("P", p)] },
		],
	};
}

const heard = (confidence: number, ...words: string[]): Transcript => ({ words, confidence });

describe("gateWord on saved Azure responses", () => {
	it("judges ship said as ship", () => {
		expect(gateFixture("ship")).toEqual({ type: "judged" });
	});

	it("judges sheep said for ship, so the judge can name the swap", () => {
		expect(gateFixture("sheep")).toEqual({ type: "judged" });
	});

	it("names an unrelated word Azure marked the target omitted for", () => {
		expect(gateFixture("kid")).toEqual({ type: "different-word", heard: ["kid"] });
	});

	it("names ships, a word with an added sound", () => {
		expect(gateFixture("ships")).toEqual({ type: "different-word", heard: ["ships"] });
	});

	it("names a phrase", () => {
		expect(gateFixture("a ship")).toEqual({ type: "different-word", heard: ["a", "ship"] });
	});

	it("hears nothing in silence", () => {
		expect(gateFixture("silence")).toEqual({ type: "not-heard" });
	});
});

describe("gateWord", () => {
	const good = shipEvidence(0.95, [0.9, 0.9, 0.9]);

	it("judges the target and its homophones by pronunciation, not spelling", () => {
		const target = { text: "buy", acceptedPronunciations: [["B", "AI"] as PhonemeSymbolId[]] };
		const judged = new Set<PhonemeSymbolId>(["AI", "EI"]);
		for (const word of ["buy", "by", "bye"]) {
			expect(
				gate({ target, judgedPhonemeIds: judged, evidence: good, transcript: heard(0.9, word) }),
			).toEqual({ type: "judged" });
		}
	});

	it("judges a word one judged contrast swap away, but not one an unjudged swap away", () => {
		expect(
			gate({ evidence: shipEvidence(0.9, [0.9, 0.9, 0.5]), transcript: heard(0.9, "sheep") }),
		).toEqual({ type: "judged" });
		expect(
			gate({ evidence: shipEvidence(0.9, [0.9, 0.9, 0.5]), transcript: heard(0.9, "chip") }),
		).toEqual({ type: "different-word", heard: ["chip"] });
	});

	it("judges another word when the scoring says the target was said well", () => {
		expect(gate({ evidence: good, transcript: heard(0.9, "chip") })).toEqual({ type: "judged" });
	});

	it("rejects another word with a low word accuracy, however unsure the transcript", () => {
		expect(
			gate({ evidence: shipEvidence(0.29, [0.9, 0.9, 0.9]), transcript: heard(0.1, "chip") }),
		).toEqual({ type: "different-word", heard: ["chip"] });
	});

	it("rejects another word with a low unjudged sound only when the transcript is confident", () => {
		const lowP = shipEvidence(0.8, [0.9, 0.9, 0.59]);
		expect(gate({ evidence: lowP, transcript: heard(0.5, "chip") })).toEqual({
			type: "different-word",
			heard: ["chip"],
		});
		expect(gate({ evidence: lowP, transcript: heard(0.49, "chip") })).toEqual({ type: "judged" });
	});

	it("never rejects for a low judged sound, which is the judge's to call", () => {
		expect(
			gate({ evidence: shipEvidence(0.8, [0.9, 0.1, 0.9]), transcript: heard(0.9, "shop") }),
		).toEqual({ type: "judged" });
	});

	it("names nothing when the target was omitted but the transcript is the target", () => {
		expect(
			gate({ evidence: { pronunciations: [], omitted: true }, transcript: heard(0.9, "ship") }),
		).toEqual({ type: "different-word", heard: [] });
	});

	it("rejects several words, even when one is the target", () => {
		expect(gate({ evidence: good, transcript: heard(0.9, "ship", "ship") })).toEqual({
			type: "different-word",
			heard: ["ship", "ship"],
		});
	});

	it("counts an empty transcript as no speech", () => {
		expect(gate({ evidence: good, transcript: heard(0) })).toEqual({ type: "not-heard" });
	});

	it("falls back on omission and word accuracy without a transcript", () => {
		expect(gate({ evidence: good, transcript: undefined })).toEqual({ type: "judged" });
		expect(gate({ evidence: shipEvidence(0.2, [0.9, 0.9, 0.9]), transcript: undefined })).toEqual({
			type: "different-word",
			heard: [],
		});
		expect(
			gate({ evidence: { pronunciations: [], omitted: true }, transcript: undefined }),
		).toEqual({ type: "different-word", heard: [] });
	});

	it("judges evidence from a scorer that reports no accuracy or omission", () => {
		expect(gate({ evidence: { pronunciations: [] }, transcript: undefined })).toEqual({
			type: "judged",
		});
	});

	it("takes its thresholds from the margins", () => {
		const margins = { wordAccuracy: 0.9, soundAccuracy: 0, transcriptConfidence: 1 };
		expect(gate({ evidence: good, transcript: heard(0.9, "chip"), margins })).toEqual({
			type: "judged",
		});
		expect(
			gate({ evidence: shipEvidence(0.85, [1, 1, 1]), transcript: heard(0.9, "chip"), margins }),
		).toEqual({ type: "different-word", heard: ["chip"] });
	});
});
