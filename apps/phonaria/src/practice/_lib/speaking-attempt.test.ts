import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import {
	azureEvidenceFromResponse,
	gateWord,
	judgeWord,
	type MissingSoundEvidence,
	type RecordingEvidence,
	type SoundEvidence,
	type SoundJudgement,
	type WavAudio,
} from "@phonaria/pronunciation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MISCUE_FIXTURES } from "../../../../../packages/pronunciation/src/azure/fixtures/miscue";
import { type MinimalPairPrompt, promptFor } from "./minimal-pair-prompt";
import {
	type AttemptResult,
	attemptReducer,
	deriveSpeakingView,
	outcomeFromJudgement,
	READY,
	type SoundResult,
	scoreAttempt,
	wordFinder,
} from "./speaking-attempt";

vi.mock("@phonaria/pronunciation", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@phonaria/pronunciation")>();
	return { ...actual, gateWord: vi.fn(actual.gateWord), judgeWord: vi.fn(actual.judgeWord) };
});

afterEach(() => {
	vi.mocked(gateWord).mockClear();
	vi.mocked(judgeWord).mockClear();
});

const AUDIO = new Uint8Array([82, 73, 70, 70]) as WavAudio;

function prompt(contrastId: string, word: string): MinimalPairPrompt {
	const found = promptFor(contrastId, word);
	if (!found) throw new Error(`no prompt for ${word}`);
	return found;
}

function scored(phonemeId: PhonemeSymbolId, targetScore = 1, rivals: SoundEvidence["rivals"] = []) {
	return {
		type: "scored",
		phonemeId,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore,
		rivals,
	} as const;
}

/** Evidence for one word's single pronunciation, with the judged sound's scores at `position`. */
function evidenceFor(
	ids: readonly PhonemeSymbolId[],
	position: number,
	judged: SoundEvidence | MissingSoundEvidence,
) {
	return {
		words: [
			{
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: ids.map((id, index) => (index === position ? judged : scored(id))),
					},
				],
			},
		],
	} satisfies RecordingEvidence;
}

function routeReturning(status: number, body: unknown) {
	return vi.fn(async (_input: string, _init: RequestInit) =>
		Response.json(body, { status, headers: { "Content-Type": "application/json" } }),
	);
}

const SHIP = prompt("i-ix", "ship");
const SHIP_IDS = ["SH", "IX", "P"] as const;

const IPA = { SH: "ʃ", I: "i", P: "p", S: "s" } as const;

function matched(position: number, id: keyof typeof IPA): SoundResult {
	return { position, sound: { id, ipa: IPA[id] }, verdict: { type: "match" } };
}

function shipSounds(vowel: SoundResult["verdict"]): SoundResult[] {
	return [
		matched(0, "SH"),
		{ position: 1, sound: { id: "IX", ipa: "ɪ" }, verdict: vowel },
		matched(2, "P"),
	];
}

describe("scoreAttempt", () => {
	it("posts the WAV to the scoring route for the prompt's word", async () => {
		const fetch = routeReturning(200, evidenceFor(SHIP_IDS, 1, scored("IX")));
		await scoreAttempt(SHIP, AUDIO, fetch);

		expect(fetch).toHaveBeenCalledTimes(1);
		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe("/api/speech/score?word=ship&targetAccent=en-us");
		expect(init.method).toBe("POST");
		expect(init.headers).toEqual({ "Content-Type": "audio/wav" });
		expect(init.body).toBe(AUDIO);
	});

	it("confirms a match on the target sound", async () => {
		const fetch = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, scored("IX", 1, [{ phonemeId: "I", score: 0.1 }])),
		);
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: { verdict: "match", sounds: shipSounds({ type: "match" }) },
		});
	});

	it("judges every sound of the word, naming words from the data at hand", async () => {
		const fetch = routeReturning(200, evidenceFor(SHIP_IDS, 1, scored("IX")));
		await scoreAttempt(SHIP, AUDIO, fetch);

		expect(vi.mocked(gateWord).mock.calls[0][0].judgedPhonemeIds).toBeUndefined();
		expect(judgeWord).toHaveBeenCalledTimes(1);
		const [input] = vi.mocked(judgeWord).mock.calls[0];
		expect(input.judgedPhonemeIds).toBeUndefined();
		expect(input.findWord?.(["SH", "I", "P"])).toBe("sheep");
	});

	it("names the heard sound and the pair word it makes", async () => {
		const fetch = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, scored("IX", 0.02, [{ phonemeId: "I", score: 1 }])),
		);
		const heard = { id: "I", ipa: "i" } as const;
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: {
				verdict: "swapped",
				heard,
				heardWord: "sheep",
				sounds: shipSounds({ type: "swapped", heard, heardWord: "sheep" }),
			},
		});
	});

	it("names the word the judge found when the heard sound is another contrast's partner", async () => {
		const bat = prompt("e-ae", "bat");
		const heard = { id: "AH", ipa: "ʌ" } as const;
		vi.mocked(judgeWord).mockReturnValueOnce({
			pronunciationIndex: 0,
			sounds: [
				{ position: 0, phonemeId: "B", verdict: { type: "match" } },
				{
					position: 1,
					phonemeId: "AE",
					verdict: { type: "swapped", heard: "AH", heardWord: "but" },
				},
				{ position: 2, phonemeId: "T", verdict: { type: "match" } },
			],
		});
		const fetch = routeReturning(
			200,
			evidenceFor(["B", "AE", "T"], 1, scored("AE", 0.02, [{ phonemeId: "AH", score: 1 }])),
		);
		expect(await scoreAttempt(bat, AUDIO, fetch)).toMatchObject({
			type: "outcome",
			outcome: { verdict: "swapped", heard, heardWord: "but" },
		});
	});

	it("is a close call when the target and its partner are near a tie", async () => {
		const fetch = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, scored("IX", 0.9, [{ phonemeId: "I", score: 0.9 }])),
		);
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: {
				verdict: "unclear",
				reason: "close-call",
				sounds: shipSounds({ type: "unclear", reason: "close-call" }),
			},
		});
	});

	it("is another sound when a sound outside the contrast wins", async () => {
		const fetch = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, scored("IX", 0.2, [{ phonemeId: "E", score: 1 }])),
		);
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: {
				verdict: "unclear",
				reason: "other-sound",
				sounds: shipSounds({ type: "unclear", reason: "other-sound" }),
			},
		});
	});

	it("has no evidence when the judge has nothing to judge", async () => {
		const silence = routeReturning(200, { words: [{ pronunciations: [] }] });
		expect(await scoreAttempt(SHIP, AUDIO, silence)).toEqual({
			type: "outcome",
			outcome: { verdict: "unclear", reason: "no-evidence", sounds: [] },
		});

		const noWords = routeReturning(200, { words: [] });
		expect(await scoreAttempt(SHIP, AUDIO, noWords)).toEqual({
			type: "outcome",
			outcome: { verdict: "unclear", reason: "no-evidence", sounds: [] },
		});

		const missing = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, { type: "missing", phonemeId: "IX" }),
		);
		expect(await scoreAttempt(SHIP, AUDIO, missing)).toEqual({
			type: "outcome",
			outcome: {
				verdict: "unclear",
				reason: "no-evidence",
				sounds: shipSounds({ type: "unclear", reason: "no-evidence" }),
			},
		});
	});

	it.each([
		[429, "rate_limited"],
		[503, "unavailable"],
		[502, "scoring_failed"],
		[400, "scoring_failed"],
		[413, "scoring_failed"],
		[404, "scoring_failed"],
	] as const)("turns status %i into %s", async (status, failure) => {
		const fetch = routeReturning(status, { error: { code: "x", message: "x" } });
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({ type: "failure", failure });
	});

	it("fails cleanly when the request throws or the body isn't evidence", async () => {
		const offline = vi.fn(async () => {
			throw new TypeError("Failed to fetch");
		});
		expect(await scoreAttempt(SHIP, AUDIO, offline)).toEqual({
			type: "failure",
			failure: "scoring_failed",
		});

		const html = vi.fn(async () => new Response("<html>", { status: 200 }));
		expect(await scoreAttempt(SHIP, AUDIO, html)).toEqual({
			type: "failure",
			failure: "scoring_failed",
		});

		const wrongShape = routeReturning(200, { ok: true });
		expect(await scoreAttempt(SHIP, AUDIO, wrongShape)).toEqual({
			type: "failure",
			failure: "scoring_failed",
		});
	});
});

describe("scoreAttempt's word gate", () => {
	const SHIP_REQUEST = {
		targetAccent: "en-us",
		words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
	} as const;

	/** The route's answer for a saved Azure pair of responses scored against ship. */
	function routeFor(said: keyof typeof MISCUE_FIXTURES) {
		const { assessment, recognition } = MISCUE_FIXTURES[said];
		return routeReturning(200, azureEvidenceFromResponse(assessment, SHIP_REQUEST, recognition));
	}

	const noDictionary = vi.fn(async () => {
		throw new Error("not needed");
	});

	it.each([
		["ship", { verdict: "match" }],
		["sheep", { verdict: "swapped", heard: { id: "I", ipa: "i" }, heardWord: "sheep" }],
	] as const)("judges %s said for ship as %j", async (said, outcome) => {
		const result = await scoreAttempt(SHIP, AUDIO, routeFor(said), noDictionary);
		expect(result).toMatchObject({ type: "outcome", outcome });
		expect(
			result.type === "outcome" && "sounds" in result.outcome && result.outcome.sounds,
		).toEqual([
			expect.objectContaining({ position: 0, sound: { id: "SH", ipa: "ʃ" } }),
			expect.objectContaining({ position: 1, sound: { id: "IX", ipa: "ɪ" } }),
			expect.objectContaining({ position: 2, sound: { id: "P", ipa: "p" } }),
		]);
	});

	it.each([
		["kid", { verdict: "different-word", heard: ["kid"] }],
		["ships", { verdict: "different-word", heard: ["ships"] }],
		["a ship", { verdict: "different-word", heard: ["a", "ship"] }],
		["silence", { verdict: "not-heard" }],
	] as const)("turns %s said for ship into %j, judging no sound", async (said, outcome) => {
		expect(await scoreAttempt(SHIP, AUDIO, routeFor(said), noDictionary)).toEqual({
			type: "outcome",
			outcome,
		});
		expect(judgeWord).not.toHaveBeenCalled();
	});

	it("doesn't load the dictionary for catalog words or several words", async () => {
		const load = vi.fn(async () => ({ words: {} }));
		await scoreAttempt(SHIP, AUDIO, routeFor("ship"), load);
		await scoreAttempt(SHIP, AUDIO, routeFor("a ship"), load);
		expect(load).not.toHaveBeenCalled();
	});

	/** buy, said well, transcribed as `word` with a confident transcript and one low sound. */
	function buyHeardAs(word: string) {
		const sound = (phonemeId: "B" | "AI", accuracy: number) => ({
			...scored(phonemeId),
			accuracy,
		});
		return routeReturning(200, {
			words: [
				{
					accuracy: 0.9,
					pronunciations: [{ pronunciationIndex: 0, sounds: [sound("B", 0.5), sound("AI", 1)] }],
				},
			],
			transcript: { words: [word], confidence: 0.9 },
		});
	}

	it("counts a homophone of the word from the curated dictionary as the word", async () => {
		const buy = prompt("ai-ei", "buy");
		const load = vi.fn(async () => ({ words: { by: ["B AI1"] } }));
		expect(await scoreAttempt(buy, AUDIO, buyHeardAs("by"), load)).toMatchObject({
			type: "outcome",
			outcome: { verdict: "match" },
		});
		expect(load).toHaveBeenCalledTimes(1);
	});

	it("falls back on catalog words when the dictionary doesn't load", async () => {
		const buy = prompt("ai-ei", "buy");
		expect(await scoreAttempt(buy, AUDIO, buyHeardAs("by"), noDictionary)).toEqual({
			type: "outcome",
			outcome: { verdict: "different-word", heard: ["by"] },
		});
	});
});

describe("outcomeFromJudgement", () => {
	const SLEEP = prompt("i-ix", "sleep");

	function judgement(sounds: SoundJudgement[]) {
		return { pronunciationIndex: 0, sounds };
	}

	it("keeps every sound's verdict, in word order, and leads with the contrast sound", () => {
		const outcome = outcomeFromJudgement(
			SLEEP,
			judgement([
				{ position: 0, phonemeId: "S", verdict: { type: "match" } },
				{ position: 1, phonemeId: "L", verdict: { type: "unclear", reason: "close-call" } },
				{ position: 2, phonemeId: "I", verdict: { type: "match" } },
				{ position: 3, phonemeId: "P", verdict: { type: "swapped", heard: "B" } },
			]),
		);
		expect(outcome).toEqual({
			verdict: "match",
			sounds: [
				matched(0, "S"),
				{
					position: 1,
					sound: { id: "L", ipa: "l" },
					verdict: { type: "unclear", reason: "close-call" },
				},
				matched(2, "I"),
				{
					position: 3,
					sound: { id: "P", ipa: "p" },
					verdict: { type: "swapped", heard: { id: "B", ipa: "b" }, heardWord: null },
				},
			],
		});
	});

	it("keeps the word the judge found for any swapped sound", () => {
		const outcome = outcomeFromJudgement(
			SHIP,
			judgement([
				{
					position: 0,
					phonemeId: "SH",
					verdict: { type: "swapped", heard: "S", heardWord: "sip" },
				},
				{ position: 1, phonemeId: "IX", verdict: { type: "match" } },
				{ position: 2, phonemeId: "P", verdict: { type: "match" } },
			]),
		);
		expect(outcome).toMatchObject({
			verdict: "match",
			sounds: [
				{ verdict: { type: "swapped", heard: { id: "S", ipa: "s" }, heardWord: "sip" } },
				{},
				{},
			],
		});
	});

	it("leads with the contrast sound's swap and the word the judge found for it", () => {
		const outcome = outcomeFromJudgement(
			SLEEP,
			judgement([
				{
					position: 2,
					phonemeId: "I",
					verdict: { type: "swapped", heard: "IX", heardWord: "slip" },
				},
			]),
		);
		expect(outcome).toMatchObject({
			verdict: "swapped",
			heard: { id: "IX", ipa: "ɪ" },
			heardWord: "slip",
			sounds: [{ verdict: { heardWord: "slip" } }],
		});
	});

	it("has no evidence for the contrast sound when the judge didn't reach it, keeping the rest", () => {
		const outcome = outcomeFromJudgement(
			SHIP,
			judgement([
				{ position: 0, phonemeId: "SH", verdict: { type: "match" } },
				{ position: 2, phonemeId: "P", verdict: { type: "match" } },
			]),
		);
		expect(outcome).toEqual({
			verdict: "unclear",
			reason: "no-evidence",
			sounds: [matched(0, "SH"), matched(2, "P")],
		});
		expect(outcomeFromJudgement(SHIP, null)).toEqual({
			verdict: "unclear",
			reason: "no-evidence",
			sounds: [],
		});
	});
});

describe("wordFinder", () => {
	it("names the pair partner before any homophone", () => {
		expect(wordFinder(prompt("m-n", "sum"))(["S", "AH", "N"])).toBe("sun");
		expect(wordFinder(SHIP)(["S", "AH", "N"])).toBe("son");
		const pin = prompt("p-b", "pin");
		expect(wordFinder(pin, { words: { been: ["B IX1 N"] } })(["B", "IX", "N"])).toBe("bin");
	});

	it("names catalog words, then common words, then words in a loaded dictionary", () => {
		const findWord = wordFinder(SHIP, { words: { knight: ["N AI1 T"], sheen: ["SH I1 N"] } });
		expect(findWord(["SH", "I", "P"])).toBe("sheep");
		expect(findWord(["B", "AH", "T"])).toBe("but");
		expect(findWord(["SH", "I", "N"])).toBe("sheen");
		expect(findWord(["N", "AI", "T"]), "the catalog's spelling comes first").toBe("night");
		expect(findWord(["SH", "IX", "B"])).toBeUndefined();
	});

	it("names only catalog and common words without a loaded dictionary", () => {
		const findWord = wordFinder(SHIP);
		expect(findWord(["B", "AH", "T"])).toBe("but");
		expect(findWord(["SH", "I", "N"])).toBeUndefined();
	});
});

describe("attemptReducer", () => {
	const result: AttemptResult = { type: "outcome", outcome: { verdict: "match", sounds: [] } };

	it("keeps the result of the attempt being scored", () => {
		const scoring = attemptReducer(READY, { type: "submitted", id: 1 });
		expect(attemptReducer(scoring, { type: "scored", id: 1, result })).toEqual({
			status: "scored",
			result,
		});
	});

	it("drops a result that arrives after a reset or a newer attempt", () => {
		const reset = attemptReducer(attemptReducer(READY, { type: "submitted", id: 1 }), {
			type: "reset",
		});
		expect(attemptReducer(reset, { type: "scored", id: 1, result })).toBe(reset);

		const newer = attemptReducer(READY, { type: "submitted", id: 2 });
		expect(attemptReducer(newer, { type: "scored", id: 1, result })).toBe(newer);
	});
});

describe("deriveSpeakingView", () => {
	const idle = { status: "idle" } as const;

	it("reports microphone problems before anything is sent", () => {
		expect(deriveSpeakingView({ status: "denied" }, READY)).toEqual({
			phase: "failure",
			failure: "denied",
		});
		expect(deriveSpeakingView({ status: "unsupported" }, READY)).toEqual({
			phase: "failure",
			failure: "unsupported",
		});
	});

	it("follows the recorder, then the scoring", () => {
		expect(deriveSpeakingView(idle, READY)).toEqual({ phase: "ready" });
		expect(deriveSpeakingView({ status: "requesting-permission" }, READY)).toEqual({
			phase: "requesting-permission",
		});
		expect(deriveSpeakingView({ status: "recording" }, READY)).toEqual({ phase: "recording" });
		expect(deriveSpeakingView({ status: "done", audio: AUDIO, durationSeconds: 1 }, READY)).toEqual(
			{ phase: "scoring" },
		);
		expect(deriveSpeakingView(idle, { status: "scoring", id: 1 })).toEqual({ phase: "scoring" });
	});

	it("shows a scored outcome or a route failure", () => {
		expect(
			deriveSpeakingView(idle, {
				status: "scored",
				result: {
					type: "outcome",
					outcome: { verdict: "unclear", reason: "close-call", sounds: [] },
				},
			}),
		).toEqual({
			phase: "outcome",
			outcome: { verdict: "unclear", reason: "close-call", sounds: [] },
		});
		expect(
			deriveSpeakingView(idle, {
				status: "scored",
				result: { type: "failure", failure: "rate_limited" },
			}),
		).toEqual({ phase: "failure", failure: "rate_limited" });
	});
});
