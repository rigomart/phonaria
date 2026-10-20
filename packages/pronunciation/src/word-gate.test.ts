import { type PhonemeSymbolId, toBasePhonemeIds } from "@phonaria/phonetics-data";
import { EnglishCuratedTop10k } from "@phonaria/phonetics-data/data/en/curated-10k";
import { describe, expect, it } from "vitest";
import { azureEvidenceFromResponse } from "./azure/evidence";
import { MISCUE_FIXTURES } from "./azure/fixtures/miscue";
import type { RivalScore, ScoringRequest, Transcript, WordEvidence } from "./contract";
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

function gateFixture(
	said: keyof typeof MISCUE_FIXTURES,
	judgedPhonemeIds: ReadonlySet<PhonemeSymbolId> | undefined,
) {
	const { assessment, recognition } = MISCUE_FIXTURES[said];
	const recording = azureEvidenceFromResponse(assessment, SHIP, recognition);
	return gate({ evidence: recording.words[0], transcript: recording.transcript, judgedPhonemeIds });
}

type ShipSound = "SH" | "IX" | "P";

/**
 * Ship's evidence with the given accuracies for the word and for SH, IX and P.
 * Target scores are 1 unless given.
 */
function shipEvidence(
	word: number,
	[sh, ix, p]: readonly [number, number, number],
	rivals: Partial<Record<ShipSound, RivalScore[]>> = {},
	targetScores: Partial<Record<ShipSound, number>> = {},
): WordEvidence {
	const sound = (phonemeId: ShipSound, accuracy: number) => ({
		type: "scored" as const,
		phonemeId,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore: targetScores[phonemeId] ?? 1,
		rivals: rivals[phonemeId] ?? [],
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
		expect(gateFixture("ship", JUDGED)).toEqual({ type: "judged" });
	});

	it("judges sheep said for ship, so the judge can name the swap", () => {
		expect(gateFixture("sheep", JUDGED)).toEqual({ type: "judged" });
	});

	it("names an unrelated word Azure marked the target omitted for", () => {
		expect(gateFixture("kid", JUDGED)).toEqual({ type: "different-word", heard: ["kid"] });
	});

	it("names ships, a word with an added sound", () => {
		expect(gateFixture("ships", JUDGED)).toEqual({ type: "different-word", heard: ["ships"] });
	});

	it("names a phrase", () => {
		expect(gateFixture("a ship", JUDGED)).toEqual({ type: "different-word", heard: ["a", "ship"] });
	});

	it("hears nothing in silence", () => {
		expect(gateFixture("silence", JUDGED)).toEqual({ type: "not-heard" });
	});
});

describe("gateWord on saved Azure responses, with every sound judged", () => {
	const every = (said: keyof typeof MISCUE_FIXTURES) => gateFixture(said, undefined);

	it("decides as it does with the contrast sounds judged", () => {
		expect(every("ship")).toEqual({ type: "judged" });
		expect(every("sheep")).toEqual({ type: "judged" });
		expect(every("kid")).toEqual({ type: "different-word", heard: ["kid"] });
		expect(every("ships")).toEqual({ type: "different-word", heard: ["ships"] });
		expect(every("a ship")).toEqual({ type: "different-word", heard: ["a", "ship"] });
		expect(every("silence")).toEqual({ type: "not-heard" });
	});
});

describe("gateWord with every sound judged", () => {
	const every = (overrides: Pick<WordGateInput, "evidence" | "transcript">) =>
		gate({ ...overrides, judgedPhonemeIds: undefined });

	it("judges a word one contrast swap away on any sound, for the judge to name", () => {
		expect(
			every({ evidence: shipEvidence(0.9, [0.4, 0.9, 0.5]), transcript: heard(0.9, "chip") }),
		).toEqual({ type: "judged" });
	});

	it("rejects another word with a low sound where no partner or variant scored as well", () => {
		const lowP = shipEvidence(0.8, [0.9, 0.9, 0.5], { P: [{ phonemeId: "S", score: 1 }] });
		expect(every({ evidence: lowP, transcript: heard(0.9, "shift") })).toEqual({
			type: "different-word",
			heard: ["shift"],
		});
		const lowIX = shipEvidence(0.8, [0.9, 0.1, 0.9]);
		expect(every({ evidence: lowIX, transcript: heard(0.9, "shop") })).toEqual({
			type: "different-word",
			heard: ["shop"],
		});
	});

	it("rejects ships for ship when /s/ tops the low /p/, even with /b/ above /p/", () => {
		const ships = shipEvidence(
			0.7,
			[0.9, 0.9, 0.16],
			{
				P: [
					{ phonemeId: "B", score: 0.02 },
					{ phonemeId: "S", score: 1 },
				],
			},
			{ P: 0.01 },
		);
		expect(every({ evidence: ships, transcript: heard(0.9, "ships") })).toEqual({
			type: "different-word",
			heard: ["ships"],
		});
	});

	it("leaves a low sound to the judge when a contrast partner scored at least as well", () => {
		const partnerTop = shipEvidence(0.8, [0.9, 0.3, 0.9], {
			IX: [
				{ phonemeId: "E", score: 1 },
				{ phonemeId: "I", score: 1 },
			],
		});
		expect(every({ evidence: partnerTop, transcript: heard(0.9, "shep") })).toEqual({
			type: "judged",
		});
	});

	it("leaves a low sound to the judge when an allowed variant scored at least as well", () => {
		const sound = (phonemeId: PhonemeSymbolId, accuracy: number, rivals: RivalScore[] = []) => ({
			type: "scored" as const,
			phonemeId,
			startSeconds: 0,
			endSeconds: 0.1,
			targetScore: rivals.length > 0 ? 0.2 : 1,
			rivals,
			accuracy,
		});
		const water = (t: ReturnType<typeof sound>): WordEvidence => ({
			accuracy: 0.8,
			pronunciations: [
				{
					pronunciationIndex: 0,
					sounds: [sound("W", 0.9), sound("O", 0.9), t, sound("ER", 0.9)],
				},
			],
		});
		const target = {
			text: "water",
			acceptedPronunciations: [["W", "O", "T", "ER"]] as PhonemeSymbolId[][],
		};
		const gateWater = (evidence: WordEvidence) =>
			gate({ target, evidence, transcript: heard(0.9, "wanna"), judgedPhonemeIds: undefined });
		expect(gateWater(water(sound("T", 0.3, [{ phonemeId: "RX", score: 1 }])))).toEqual({
			type: "judged",
		});
		expect(gateWater(water(sound("T", 0.3, [{ phonemeId: "N", score: 1 }])))).toEqual({
			type: "different-word",
			heard: ["wanna"],
		});
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
