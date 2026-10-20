import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { PhonemeContrast, PhonemeSymbolId } from "@phonaria/phonetics-data";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RivalScore, Scorer, SoundEvidence, Transcript, WordEvidence } from "../contract";
import { LENIENT_MARGINS } from "../judge";
import {
	buildCatalogCases,
	caseForClip,
	type ClipLabel,
	type HarnessCase,
	pronunciationOf,
	targetWordFor,
} from "./cases";
import {
	evaluateCases,
	groupMetrics,
	metricsByGroup,
	type ScoredCase,
	type SourceKind,
	summarize,
	sweepMargins,
} from "./metrics";
import { harnessScorerFrom, scoreJobs } from "./scoring";

const CONTRASTS: readonly PhonemeContrast<"en-us">[] = [
	{ id: "i-ix", phonemeIds: ["I", "IX"], minimalPairs: [{ words: ["seat", "sit"] }] },
	{ id: "th-s", phonemeIds: ["TH", "S"], minimalPairs: [{ words: ["thin", "sin"] }] },
];

/** Keyed `<recording word> as <target word>`. */
type Plan = Record<string, { target: number; rivals: RivalScore[] } | "missing" | "unheard">;

function sound(phonemeId: PhonemeSymbolId, targetScore: number, rivals: RivalScore[] = []) {
	return {
		type: "scored",
		phonemeId,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore,
		rivals,
	} satisfies SoundEvidence;
}

function fakeScorer(plan: Plan, cases: readonly HarnessCase[]): Scorer {
	return {
		async score(audio, request) {
			const target = request.words[0].text;
			const key = `${new TextDecoder().decode(audio)} as ${target}`;
			const judged = plan[key];
			if (!judged) throw new Error(`No plan for ${key}`);
			if (judged === "unheard") return { words: [{ pronunciations: [] }] };
			const position = cases.find((c) => c.targetWord === target)?.position ?? -1;
			const evidence: WordEvidence = {
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: pronunciationOf(target).map((id, index) => {
							if (index !== position) return sound(id, 0.9);
							if (judged === "missing") return { type: "missing", phonemeId: id };
							return sound(id, judged.target, judged.rivals);
						}),
					},
				],
			};
			return { words: [evidence] };
		},
	};
}

const PLAN: Plan = {
	"seat as seat": { target: 0.9, rivals: [{ phonemeId: "IX", score: 0.2 }] },
	"sit as seat": { target: 0.1, rivals: [{ phonemeId: "IX", score: 0.9 }] },
	"sit as sit": { target: 0.5, rivals: [{ phonemeId: "I", score: 0.9 }] },
	"seat as sit": { target: 0.5, rivals: [{ phonemeId: "I", score: 0.55 }] },
	"thin as thin": "missing",
	"sin as thin": { target: 0.1, rivals: [{ phonemeId: "T", score: 1 }] },
	"sin as sin": "unheard",
	"thin as sin": { target: 0.9, rivals: [{ phonemeId: "TH", score: 0.3 }] },
};

let cacheDir: string;
beforeEach(async () => {
	cacheDir = await mkdtemp(path.join(tmpdir(), "harness-metrics-"));
});
afterEach(async () => {
	await rm(cacheDir, { recursive: true, force: true });
});

async function scoreCatalog(sourceId: string, sourceKind: SourceKind): Promise<ScoredCase[]> {
	const cases = buildCatalogCases(CONTRASTS);
	const scorer = harnessScorerFrom("fake", {}, fakeScorer(PLAN, cases));
	const { results } = await scoreJobs(
		scorer,
		cases.map((c) => ({
			audio: new TextEncoder().encode(c.recordingWord),
			request: { targetAccent: "en-us", words: [targetWordFor(c.targetWord)] },
		})),
		{ cacheDir },
	);
	return results.map((result, index) => {
		if (result.type !== "scored") throw new Error("Fake scorer failed");
		return {
			case: cases[index],
			recordingId: `${sourceId}/${cases[index].recordingWord}`,
			sourceId,
			sourceKind,
			evidence: result.evidence.words[0],
		};
	});
}

describe("harness metrics", () => {
	it("categorizes each case from the judge's verdict on the differing sound", async () => {
		const results = evaluateCases(await scoreCatalog("tts:fake", "tts"));
		const categories = Object.fromEntries(
			results.map((r) => [`${r.case.recordingWord} as ${r.case.targetWord}`, r.category]),
		);
		expect(categories).toEqual({
			"seat as seat": "match",
			"sit as seat": "named",
			"sit as sit": "false-flag",
			"seat as sit": "unclear",
			"thin as thin": "no-evidence",
			"sin as thin": "misnamed",
			"sin as sin": "no-evidence",
			"thin as sin": "missed",
		});
	});

	it("counts and rates over each kind of case", async () => {
		const metrics = summarize(evaluateCases(await scoreCatalog("tts:fake", "tts")));
		expect(metrics.correct).toEqual({
			total: 4,
			match: 1,
			"false-flag": 1,
			unclear: 0,
			"no-evidence": 2,
			rejected: 0,
		});
		expect(metrics.swap).toEqual({
			total: 4,
			named: 1,
			misnamed: 1,
			missed: 1,
			unclear: 1,
			"no-evidence": 0,
			rejected: 0,
		});
		expect(metrics.rates).toEqual({
			falseFlag: 0.25,
			falseFlagRecordings: 0.25,
			otherSoundFlagged: 0,
			correctUnclear: 0,
			swapNamed: 0.25,
			swapMisnamed: 0.25,
			swapMissed: 0.25,
			swapUnclear: 0.25,
			unclear: 1 / 8,
			noEvidence: 2 / 8,
			falseReject: 0,
			wrongWordAccepted: null,
		});
	});

	it("describes the evidence shape and what beat a correct target", async () => {
		const { shape } = summarize(evaluateCases(await scoreCatalog("tts:fake", "tts")));
		expect(shape).toEqual({
			scored: 6,
			targetOnly: 0,
			partnerListed: 5,
			targetTop: 2,
			tieAtTop: 0,
			partnerTop: 3,
			otherTop: 1,
			beatenBy: { I: 1 },
		});
	});

	it("ranks contrasts by false flags and keeps sources apart", async () => {
		const scored = [
			...(await scoreCatalog("tts:fake", "tts")),
			...(await scoreCatalog("real:ana", "real")),
		];
		const results = evaluateCases(scored);
		expect(groupMetrics(results).worstContrasts).toEqual(["i-ix", "th-s"]);
		const groups = metricsByGroup(results);
		expect(Object.keys(groups).sort()).toEqual(["all", "real", "real:ana", "tts", "tts:fake"]);
		expect(groups.all.overall.correct.total).toBe(8);
		expect(groups.real.overall.correct.total).toBe(4);
		expect(groups["tts:fake"].byContrast["i-ix"].rates.falseFlag).toBe(0.5);
	});

	it("rejudges the same evidence under other margins", async () => {
		const scored = await scoreCatalog("tts:fake", "tts");
		const [strict] = sweepMargins(scored, [{ ...LENIENT_MARGINS, swap: 0.5 }]);
		expect(strict.groups.all.falseFlag, "sit as sit, 0.4 behind, is no longer flagged").toBe(0);
		expect(strict.groups.all.swapNamed, "sit as seat, 0.8 behind, is still named").toBe(0.25);
	});
});

describe("harness metrics with the word gate", () => {
	const seatEvidence = (accuracy: number): WordEvidence => ({
		accuracy,
		pronunciations: [
			{
				pronunciationIndex: 0,
				sounds: [
					{ ...sound("S", 0.9), accuracy },
					sound("I", 0.9, [{ phonemeId: "IX", score: 0.1 }]),
					{ ...sound("T", 0.9), accuracy },
				],
			},
		],
	});
	const clip = (
		kind: ClipLabel["kind"],
		said: string,
		evidence: WordEvidence,
		transcript: Transcript | null,
	): ScoredCase => ({
		case: caseForClip({ target: "seat", partner: "sit", kind, said }, CONTRASTS),
		recordingId: `${kind}/${said}/${transcript?.words.join(" ")}`,
		sourceId: "tts:fake",
		sourceKind: "tts",
		evidence,
		transcript,
	});

	it("counts gated recordings as false rejects or wrong words stopped", () => {
		const results = evaluateCases([
			clip("correct", "seat", seatEvidence(0.9), { words: ["seat"], confidence: 0.9 }),
			clip("swap", "sit", seatEvidence(0.9), { words: ["set"], confidence: 0.9 }),
			clip("swap", "sit", seatEvidence(0.2), { words: ["set"], confidence: 0.9 }),
			clip(
				"unrelated",
				"phone",
				{ pronunciations: [], omitted: true },
				{
					words: ["phone"],
					confidence: 0.7,
				},
			),
			clip("phrase", "a seat", seatEvidence(0.8), { words: ["a", "seat"], confidence: 0.8 }),
			clip("added-sounds", "seats", seatEvidence(0.8), { words: ["seats"], confidence: 0.1 }),
			clip("silence", "silence", { pronunciations: [], omitted: true }, null),
			clip("nonword", "/siθ/", seatEvidence(0.8), { words: ["seeth"], confidence: 0.1 }),
		]);
		expect(results.map((result) => result.category)).toEqual([
			"match",
			"missed",
			"rejected",
			"rejected",
			"rejected",
			"accepted",
			"rejected",
			"accepted",
		]);
		expect(results[2].outcome).toEqual({
			type: "rejected",
			gate: { type: "different-word", heard: ["set"] },
		});

		const metrics = summarize(results);
		expect(metrics.rates.falseReject).toBe(1 / 3);
		expect(metrics.wrongWord).toEqual({
			total: 5,
			rejected: 3,
			accepted: 2,
			byKind: {
				unrelated: { total: 1, accepted: 0 },
				phrase: { total: 1, accepted: 0 },
				"added-sounds": { total: 1, accepted: 1 },
				silence: { total: 1, accepted: 0 },
				nonword: { total: 1, accepted: 1 },
			},
		});
		expect(metrics.rates.wrongWordAccepted, "nonwords left out").toBe(1 / 4);
		expect(metrics.shape.scored, "wrong words stay out of the evidence shape").toBe(2);
	});
});

describe("harness metrics with every sound judged", () => {
	const contrasts: readonly PhonemeContrast<"en-us">[] = [
		{ id: "i-ix", phonemeIds: ["I", "IX"], minimalPairs: [{ words: ["seat", "sit"] }] },
		{ id: "t-d", phonemeIds: ["T", "D"], minimalPairs: [{ words: ["seat", "seed"] }] },
	];
	const seatCases = buildCatalogCases(contrasts).filter((c) => c.targetWord === "seat");

	function scoredWithSAsSh(harnessCase: HarnessCase): ScoredCase {
		const { position, partnerPhonemeId, kind } = harnessCase;
		const sounds = pronunciationOf(harnessCase.targetWord).map((id, index) => {
			if (id === "S") return sound("S", 0.1, [{ phonemeId: "SH", score: 1 }]);
			if (index !== position) return sound(id, 0.9);
			return kind === "correct"
				? sound(id, 0.9, [{ phonemeId: partnerPhonemeId, score: 0.1 }])
				: sound(id, 0.1, [{ phonemeId: partnerPhonemeId, score: 0.9 }]);
		});
		return {
			case: harnessCase,
			recordingId: `take-1/${harnessCase.recordingWord}`,
			sourceId: "tts:fake",
			sourceKind: "tts",
			evidence: { pronunciations: [{ pronunciationIndex: 0, sounds }] },
		};
	}
	const scored = seatCases.map(scoredWithSAsSh);

	it("flags a correct recording on any sound, and counts a take in two contrasts once", () => {
		const results = evaluateCases(scored, LENIENT_MARGINS, "every");
		expect(results.map((r) => `${r.case.recordingWord} as seat: ${r.category}`)).toEqual([
			"seat as seat: false-flag",
			"sit as seat: named",
			"seat as seat: false-flag",
			"seed as seat: named",
		]);
		const metrics = summarize(results);
		expect(metrics.correctRecordings).toEqual({ total: 1, flagged: 1 });
		expect(metrics.rates.falseFlag).toBe(1);
		expect(metrics.rates.otherSoundFlagged).toBe(1);
		expect(metrics.falselyFlagged).toEqual({ "S as SH": 4 });
	});

	it("counts each take of a word as its own recording", () => {
		const takes = seatCases
			.filter((c) => c.kind === "correct")
			.flatMap((harnessCase) => {
				const flagged = scoredWithSAsSh(harnessCase);
				const clean: ScoredCase = {
					...flagged,
					recordingId: `take-2/${harnessCase.recordingWord}`,
					evidence: {
						pronunciations: [
							{
								pronunciationIndex: 0,
								sounds: pronunciationOf("seat").map((id) => sound(id, 0.9)),
							},
						],
					},
				};
				return [flagged, clean];
			});
		const metrics = summarize(evaluateCases(takes, LENIENT_MARGINS, "every"));
		expect(metrics.correct.total, "two takes in two contrasts").toBe(4);
		expect(metrics.correctRecordings).toEqual({ total: 2, flagged: 1 });
		expect(metrics.rates.falseFlagRecordings).toBe(1 / 2);
	});

	it("names the word a flagged sound makes", () => {
		const [outcome] = evaluateCases(scored, LENIENT_MARGINS, "every").map((r) => r.outcome);
		expect(outcome.type !== "rejected" && outcome.otherFlags).toEqual([
			{
				position: 0,
				phonemeId: "S",
				verdict: { type: "swapped", heard: "SH", heardWord: "sheet" },
			},
		]);
	});

	it("judges only the contrast sound in contrast mode, as the baseline did", () => {
		const metrics = summarize(evaluateCases(scored, LENIENT_MARGINS, "contrast"));
		expect(metrics.rates.falseFlag).toBe(0);
		expect(metrics.rates.swapNamed).toBe(1);
		expect(metrics.otherSoundFlagged).toBe(0);
		expect(metrics.falselyFlagged).toEqual({});
	});
});
