import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import {
	azureEvidenceFromResponse,
	type MissingSoundEvidence,
	type RecordingEvidence,
	type SoundEvidence,
	type WavAudio,
} from "@phonaria/pronunciation";
import { describe, expect, it, vi } from "vitest";
import { MISCUE_FIXTURES } from "../../../../../packages/pronunciation/src/azure/fixtures/miscue";
import { type MinimalPairPrompt, promptFor } from "./minimal-pair-prompt";
import {
	type AttemptResult,
	attemptReducer,
	deriveSpeakingView,
	READY,
	scoreAttempt,
} from "./speaking-attempt";

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
			outcome: { verdict: "match" },
		});
	});

	it("names the heard sound and the pair word it makes", async () => {
		const fetch = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, scored("IX", 0.02, [{ phonemeId: "I", score: 1 }])),
		);
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: { verdict: "swapped", heard: { id: "I", ipa: "i" }, heardWord: "sheep" },
		});
	});

	it("names no word when the heard sound is another contrast's partner", async () => {
		const bat = prompt("e-ae", "bat");
		const fetch = routeReturning(
			200,
			evidenceFor(["B", "AE", "T"], 1, scored("AE", 0.02, [{ phonemeId: "AH", score: 1 }])),
		);
		expect(await scoreAttempt(bat, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: { verdict: "swapped", heard: { id: "AH", ipa: "ʌ" }, heardWord: null },
		});
	});

	it("is a close call when the target and its partner are near a tie", async () => {
		const fetch = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, scored("IX", 0.9, [{ phonemeId: "I", score: 0.9 }])),
		);
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: { verdict: "unclear", reason: "close-call" },
		});
	});

	it("is another sound when a sound outside the contrast wins", async () => {
		const fetch = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, scored("IX", 0.2, [{ phonemeId: "E", score: 1 }])),
		);
		expect(await scoreAttempt(SHIP, AUDIO, fetch)).toEqual({
			type: "outcome",
			outcome: { verdict: "unclear", reason: "other-sound" },
		});
	});

	it("has no evidence when the judge has nothing to judge", async () => {
		const silence = routeReturning(200, { words: [{ pronunciations: [] }] });
		expect(await scoreAttempt(SHIP, AUDIO, silence)).toEqual({
			type: "outcome",
			outcome: { verdict: "unclear", reason: "no-evidence" },
		});

		const noWords = routeReturning(200, { words: [] });
		expect(await scoreAttempt(SHIP, AUDIO, noWords)).toEqual({
			type: "outcome",
			outcome: { verdict: "unclear", reason: "no-evidence" },
		});

		const missing = routeReturning(
			200,
			evidenceFor(SHIP_IDS, 1, { type: "missing", phonemeId: "IX" }),
		);
		expect(await scoreAttempt(SHIP, AUDIO, missing)).toEqual({
			type: "outcome",
			outcome: { verdict: "unclear", reason: "no-evidence" },
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
		["kid", { verdict: "different-word", heard: ["kid"] }],
		["ships", { verdict: "different-word", heard: ["ships"] }],
		["a ship", { verdict: "different-word", heard: ["a", "ship"] }],
		["silence", { verdict: "not-heard" }],
	] as const)("turns %s said for ship into %j", async (said, outcome) => {
		expect(await scoreAttempt(SHIP, AUDIO, routeFor(said), noDictionary)).toEqual({
			type: "outcome",
			outcome,
		});
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
		expect(await scoreAttempt(buy, AUDIO, buyHeardAs("by"), load)).toEqual({
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

describe("attemptReducer", () => {
	const result: AttemptResult = { type: "outcome", outcome: { verdict: "match" } };

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
				result: { type: "outcome", outcome: { verdict: "unclear", reason: "close-call" } },
			}),
		).toEqual({ phase: "outcome", outcome: { verdict: "unclear", reason: "close-call" } });
		expect(
			deriveSpeakingView(idle, {
				status: "scored",
				result: { type: "failure", failure: "rate_limited" },
			}),
		).toEqual({ phase: "failure", failure: "rate_limited" });
	});
});
