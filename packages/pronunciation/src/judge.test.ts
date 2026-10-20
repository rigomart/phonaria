import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { describe, expect, it } from "vitest";
import type {
	MissingSoundEvidence,
	RivalScore,
	Scorer,
	RecordingEvidence,
	ScoringRequest,
	SoundEvidence,
} from "./contract";
import { judgeWord } from "./judge";

// The i-ix contrast: IX is /ɪ/ as in "ship", I is /i/ as in "sheep".
const SHIP_SHEEP = new Set<PhonemeSymbolId>(["IX", "I"]);
const audio = new Uint8Array(44);

function scored(phonemeId: PhonemeSymbolId, targetScore: number, rivals: RivalScore[] = []) {
	return {
		type: "scored",
		phonemeId,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore,
		rivals,
	} satisfies SoundEvidence;
}

function missing(phonemeId: PhonemeSymbolId): MissingSoundEvidence {
	return { type: "missing", phonemeId };
}

function fakeScorer(evidence: RecordingEvidence): Scorer {
	return { score: async () => evidence };
}

async function judgeShip(vowel: SoundEvidence | MissingSoundEvidence) {
	const request: ScoringRequest = {
		targetAccent: "en-us",
		words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
	};
	const recording = await fakeScorer({
		words: [
			{
				pronunciations: [
					{ pronunciationIndex: 0, sounds: [scored("SH", 0.9), vowel, scored("P", 0.9)] },
				],
			},
		],
	}).score(audio, request);
	const [evidence] = recording.words;
	return judgeWord({ evidence, judgedPhonemeIds: SHIP_SHEEP, targetAccent: "en-us" });
}

describe("judgeWord", () => {
	it("matches when the target clearly wins", async () => {
		const judgement = await judgeShip(scored("IX", 0.9, [{ phonemeId: "I", score: 0.3 }]));
		expect(judgement?.sounds).toEqual([
			{ position: 1, phonemeId: "IX", verdict: { type: "match" } },
		]);
	});

	it("names the partner when the partner clearly wins", async () => {
		const judgement = await judgeShip(scored("IX", 0.2, [{ phonemeId: "I", score: 0.9 }]));
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "swapped", heard: "I" });
	});

	it("is a close call when the target and its partner are within the margins", async () => {
		for (const partnerScore of [0.62, 0.58, 0.79]) {
			const judgement = await judgeShip(
				scored("IX", 0.6, [{ phonemeId: "I", score: partnerScore }]),
			);
			expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "close-call" });
		}
	});

	it("is unclear when a rival that is not a contrast partner wins", async () => {
		const judgement = await judgeShip(
			scored("IX", 0.2, [
				{ phonemeId: "I", score: 0.3 },
				{ phonemeId: "E", score: 0.9 },
			]),
		);
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "other-sound" });
	});

	it("is another sound when a rival that is not a partner is close behind the target", async () => {
		const judgement = await judgeShip(scored("IX", 0.6, [{ phonemeId: "E", score: 0.58 }]));
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "other-sound" });
	});

	it("is unclear when a partner ties for the win with a rival that is not a partner", async () => {
		for (const rivals of [
			[
				{ phonemeId: "I", score: 0.9 },
				{ phonemeId: "E", score: 0.9 },
			],
			[
				{ phonemeId: "E", score: 0.9 },
				{ phonemeId: "I", score: 0.9 },
			],
		] satisfies RivalScore[][]) {
			const judgement = await judgeShip(scored("IX", 0.2, rivals));
			expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "other-sound" });
		}
	});

	it("counts a difference exactly on a margin as reaching it", async () => {
		const match = await judgeShip(scored("IX", 0.35, [{ phonemeId: "I", score: 0.3 }]));
		expect(match?.sounds[0]?.verdict).toEqual({ type: "match" });
		const swapped = await judgeShip(scored("IX", 0.5, [{ phonemeId: "I", score: 0.7 }]));
		expect(swapped?.sounds[0]?.verdict).toEqual({ type: "swapped", heard: "I" });
	});

	it("is unclear when a judged sound has no evidence", async () => {
		const judgement = await judgeShip(missing("IX"));
		expect(judgement?.sounds[0]?.verdict).toEqual({ type: "unclear", reason: "no-evidence" });
	});

	it("matches on the target score alone when there are no rivals", async () => {
		expect((await judgeShip(scored("IX", 0.8)))?.sounds[0]?.verdict).toEqual({ type: "match" });
		expect((await judgeShip(scored("IX", 0.3)))?.sounds[0]?.verdict).toEqual({
			type: "unclear",
			reason: "other-sound",
		});
	});

	it("judges against the accepted pronunciation the evidence fits best", () => {
		const judgement = judgeWord({
			evidence: {
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: [scored("B", 0.8), scored("IX", 0.3, [{ phonemeId: "I", score: 0.9 }])],
					},
					{
						pronunciationIndex: 1,
						sounds: [scored("B", 0.8), scored("I", 0.9, [{ phonemeId: "IX", score: 0.3 }])],
					},
				],
			},
			judgedPhonemeIds: SHIP_SHEEP,
			targetAccent: "en-us",
		});
		expect(judgement).toEqual({
			pronunciationIndex: 1,
			sounds: [{ position: 1, phonemeId: "I", verdict: { type: "match" } }],
		});
	});

	it("leaves sounds outside the judged set without a verdict", async () => {
		const judgement = await judgeShip(scored("IX", 0.9));
		expect(judgement?.sounds.map((sound) => sound.phonemeId)).toEqual(["IX"]);
	});

	it("gives each occurrence of a judged sound its own verdict", () => {
		const judgement = judgeWord({
			evidence: {
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: [
							scored("V", 0.9),
							scored("IX", 0.9, [{ phonemeId: "I", score: 0.2 }]),
							scored("Z", 0.9),
							scored("IX", 0.2, [{ phonemeId: "I", score: 0.9 }]),
							scored("T", 0.9),
						],
					},
				],
			},
			judgedPhonemeIds: SHIP_SHEEP,
			targetAccent: "en-us",
		});
		expect(judgement?.sounds).toEqual([
			{ position: 1, phonemeId: "IX", verdict: { type: "match" } },
			{ position: 3, phonemeId: "IX", verdict: { type: "swapped", heard: "I" } },
		]);
	});

	it("returns null when no accepted pronunciation could be lined up", () => {
		expect(
			judgeWord({
				evidence: { pronunciations: [] },
				judgedPhonemeIds: SHIP_SHEEP,
				targetAccent: "en-us",
			}),
		).toBeNull();
	});
});
