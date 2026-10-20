import { azureEvidenceFromResponse, type RecordingEvidence } from "@phonaria/pronunciation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeWav } from "@/lib/recording/wav";
import { MISCUE_FIXTURES } from "../../../../packages/pronunciation/src/azure/fixtures/miscue";
import silenceAsShip from "../../../../packages/pronunciation/src/azure/fixtures/silence-as-ship.json";
import {
	MAX_SPEECH_BYTES,
	type SpeechErrorBody,
	type SpeechWorkerEnv,
	scoreSpeechOnWorker,
} from "./speech-scoring";

const KEY = "test-speech-key";

function allowingEnv(overrides: Partial<SpeechWorkerEnv> = {}): SpeechWorkerEnv {
	return {
		AZURE_SPEECH_KEY: KEY,
		AZURE_SPEECH_REGION: "eastus",
		SPEECH_RATE_LIMIT: { limit: async () => ({ success: true }) },
		...overrides,
	};
}

function wav(seconds: number): Uint8Array {
	return encodeWav(new Float32Array(Math.round(seconds * 16_000)).fill(0.1));
}

function scoreRequest({
	word = "ship",
	targetAccent = "en-us",
	body = wav(1),
	headers = {},
}: {
	word?: string;
	targetAccent?: string;
	body?: Uint8Array;
	headers?: Record<string, string>;
} = {}): Request {
	const url = new URL("https://phonaria.test/api/speech/score");
	url.searchParams.set("word", word);
	url.searchParams.set("targetAccent", targetAccent);
	return new Request(url, {
		method: "POST",
		headers: { "Content-Type": "audio/wav", "cf-connecting-ip": "203.0.113.7", ...headers },
		body: body.slice(),
	});
}

const shipAsShip = MISCUE_FIXTURES.ship.assessment;
const shipHeard = MISCUE_FIXTURES.ship.recognition;

function azureReturning(response: unknown, status = 200) {
	return azureAnswering([response], status);
}

function isAssessment(init: RequestInit | undefined): boolean {
	return "Pronunciation-Assessment" in ((init?.headers ?? {}) as Record<string, string>);
}

/**
 * Answers assessments with `assessments` in turn, and plain recognition with
 * `recognition`, both with `status` unless `recognitionStatus` is set.
 */
function azureAnswering(
	assessments: readonly unknown[],
	status = 200,
	{
		recognition = shipHeard as unknown,
		recognitionStatus = status,
	}: { recognition?: unknown; recognitionStatus?: number } = {},
) {
	let call = 0;
	const azure = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
		isAssessment(init)
			? Response.json(assessments[Math.min(call++, assessments.length - 1)], { status })
			: Response.json(recognition, { status: recognitionStatus }),
	);
	// Bun's `typeof fetch` adds `preconnect`, which the scorer never calls.
	return azure as typeof azure & typeof fetch;
}

function assessmentCalls(azure: ReturnType<typeof azureAnswering>): number {
	return azure.mock.calls.filter(([, init]) => isAssessment(init)).length;
}

const EMPTY_SUCCESS = { RecognitionStatus: "Success", NBest: [{ Words: [{ Word: "ship" }] }] };

const SHIP_REQUEST = {
	targetAccent: "en-us",
	words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
} as const;

const SHIP_EVIDENCE: RecordingEvidence = azureEvidenceFromResponse(
	shipAsShip,
	SHIP_REQUEST,
	shipHeard,
);

async function errorCode(response: Response): Promise<string> {
	return ((await response.json()) as SpeechErrorBody).error.code;
}

describe("scoreSpeechOnWorker", () => {
	beforeEach(() => {
		process.env.FLAG_SPEECH = "1";
	});

	afterEach(() => {
		delete process.env.FLAG_SPEECH;
	});

	it("returns 404 without touching Azure when FLAG_SPEECH is off", async () => {
		process.env.FLAG_SPEECH = "0";
		const fetch = azureReturning(shipAsShip);
		const limit = vi.fn(async () => ({ success: true }));
		const log = vi.fn();

		const response = await scoreSpeechOnWorker(
			scoreRequest(),
			allowingEnv({ SPEECH_RATE_LIMIT: { limit } }),
			{ fetch, log },
		);

		expect(response.status).toBe(404);
		expect(fetch).not.toHaveBeenCalled();
		expect(limit).not.toHaveBeenCalled();
		expect(log).not.toHaveBeenCalled();
	});

	it("answers 405 to anything but POST, and 404 to it when FLAG_SPEECH is off", async () => {
		const get = () => new Request("https://phonaria.test/api/speech/score?word=ship");
		const fetch = azureReturning(shipAsShip);

		const response = await scoreSpeechOnWorker(get(), allowingEnv(), { fetch, log: vi.fn() });
		expect(response.status).toBe(405);
		expect(response.headers.get("Allow")).toBe("POST");

		process.env.FLAG_SPEECH = "0";
		expect((await scoreSpeechOnWorker(get(), allowingEnv(), { fetch })).status).toBe(404);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("passes Azure's evidence and transcript for a catalog word through as JSON", async () => {
		const fetch = azureReturning(shipAsShip);
		const log = vi.fn();
		const audio = wav(1);
		let clock = 1_000;

		const response = await scoreSpeechOnWorker(scoreRequest({ body: audio }), allowingEnv(), {
			fetch,
			log,
			now: () => (clock += 250),
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(SHIP_EVIDENCE.words[0]?.pronunciations).toHaveLength(1);
		expect(SHIP_EVIDENCE.transcript?.words).toEqual(["ship"]);
		expect(await response.json()).toEqual(SHIP_EVIDENCE);

		expect(fetch, "one assessment and one plain recognition").toHaveBeenCalledTimes(2);
		expect(assessmentCalls(fetch)).toBe(1);
		for (const [url, init] of fetch.mock.calls) {
			expect(String(url)).toMatch(/^https:\/\/eastus\.stt\.speech\.microsoft\.com\//);
			expect(init?.body).toEqual(audio);
		}
		expect(log).toHaveBeenCalledWith({
			level: "info",
			message: "speech_scoring",
			details: { word: "ship", status: 200, ms: 250 },
		});
	});

	it("counts both Azure calls as one attempt against the rate limit", async () => {
		const limit = vi.fn(async () => ({ success: true }));
		const fetch = azureReturning(shipAsShip);

		await scoreSpeechOnWorker(scoreRequest(), allowingEnv({ SPEECH_RATE_LIMIT: { limit } }), {
			fetch,
			log: vi.fn(),
		});

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(limit).toHaveBeenCalledTimes(1);
	});

	it("retries the assessment once when Azure answers Success with no assessment", async () => {
		const fetch = azureAnswering([EMPTY_SUCCESS, shipAsShip]);

		const response = await scoreSpeechOnWorker(scoreRequest(), allowingEnv(), {
			fetch,
			log: vi.fn(),
		});

		expect(assessmentCalls(fetch)).toBe(2);
		expect(fetch).toHaveBeenCalledTimes(3);
		expect(await response.json()).toEqual(SHIP_EVIDENCE);
	});

	it("returns empty evidence when the retry is empty too", async () => {
		const fetch = azureAnswering([EMPTY_SUCCESS, { RecognitionStatus: "Success" }]);

		const response = await scoreSpeechOnWorker(scoreRequest(), allowingEnv(), {
			fetch,
			log: vi.fn(),
		});

		expect(assessmentCalls(fetch)).toBe(2);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			words: [{ pronunciations: [] }],
			insertedWords: [],
			transcript: SHIP_EVIDENCE.transcript,
		});
	});

	it("doesn't retry a recording Azure heard no speech in", async () => {
		const fetch = azureAnswering([silenceAsShip], 200, {
			recognition: { RecognitionStatus: "InitialSilenceTimeout" },
		});

		const response = await scoreSpeechOnWorker(scoreRequest(), allowingEnv(), {
			fetch,
			log: vi.fn(),
		});

		expect(assessmentCalls(fetch)).toBe(1);
		expect(await response.json()).toEqual({ words: [{ pronunciations: [] }], transcript: null });
	});

	it("tells silence from a word Azure didn't hear under miscue", async () => {
		const { assessment, recognition } = MISCUE_FIXTURES.silence;
		const response = await scoreSpeechOnWorker(scoreRequest(), allowingEnv(), {
			fetch: azureAnswering([assessment], 200, { recognition }),
			log: vi.fn(),
		});

		expect(await response.json()).toEqual({
			words: [{ pronunciations: [], omitted: true }],
			insertedWords: [],
			transcript: null,
		});
	});

	it("returns the evidence without a transcript when only the recognition fails, and logs it", async () => {
		const log = vi.fn();
		const response = await scoreSpeechOnWorker(scoreRequest(), allowingEnv(), {
			fetch: azureAnswering([shipAsShip], 200, { recognitionStatus: 500 }),
			log,
		});

		expect(response.status).toBe(200);
		const evidence = (await response.json()) as RecordingEvidence;
		expect(evidence).not.toHaveProperty("transcript");
		expect(evidence.words).toEqual(azureEvidenceFromResponse(shipAsShip, SHIP_REQUEST).words);
		expect(log).toHaveBeenCalledWith(
			expect.objectContaining({
				level: "info",
				details: expect.objectContaining({ status: 200, transcript: "failed" }),
			}),
		);
	});

	it("matches the word case-insensitively", async () => {
		const response = await scoreSpeechOnWorker(scoreRequest({ word: " Ship " }), allowingEnv(), {
			fetch: azureReturning(shipAsShip),
			log: vi.fn(),
		});
		expect(response.status).toBe(200);
	});

	it.each([
		["the key", { AZURE_SPEECH_KEY: undefined }],
		["the region", { AZURE_SPEECH_REGION: "  " }],
		["the rate-limit binding", { SPEECH_RATE_LIMIT: undefined }],
	])("answers 503 without calling Azure when %s is missing", async (_, overrides) => {
		const fetch = azureReturning(shipAsShip);
		const log = vi.fn();

		const response = await scoreSpeechOnWorker(
			scoreRequest(),
			allowingEnv(overrides as Partial<SpeechWorkerEnv>),
			{ fetch, log },
		);

		expect(response.status).toBe(503);
		expect(await errorCode(response)).toBe("unavailable");
		expect(fetch).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith(
			expect.objectContaining({
				level: "error",
				details: expect.objectContaining({ status: 503 }),
			}),
		);
	});

	it("keys the rate limit by client IP and answers 429 when it is exceeded", async () => {
		const limit = vi.fn(async () => ({ success: false }));
		const fetch = azureReturning(shipAsShip);

		const response = await scoreSpeechOnWorker(
			scoreRequest(),
			allowingEnv({ SPEECH_RATE_LIMIT: { limit } }),
			{ fetch, log: vi.fn() },
		);

		expect(limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
		expect(response.status).toBe(429);
		expect(response.headers.get("Retry-After")).toBe("60");
		expect(await errorCode(response)).toBe("rate_limited");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("shares one anonymous bucket when the client IP is unknown", async () => {
		const limit = vi.fn(async () => ({ success: true }));
		const request = scoreRequest();
		request.headers.delete("cf-connecting-ip");

		await scoreSpeechOnWorker(request, allowingEnv({ SPEECH_RATE_LIMIT: { limit } }), {
			fetch: azureReturning(shipAsShip),
			log: vi.fn(),
		});

		expect(limit).toHaveBeenCalledWith({ key: "anonymous" });
	});

	it("rejects a word outside the minimal-pair catalog without logging it", async () => {
		const fetch = azureReturning(shipAsShip);
		const log = vi.fn();

		const response = await scoreSpeechOnWorker(scoreRequest({ word: "aardvark" }), allowingEnv(), {
			fetch,
			log,
		});

		expect(response.status).toBe(400);
		expect(await errorCode(response)).toBe("invalid_word");
		expect(fetch).not.toHaveBeenCalled();
		expect(JSON.stringify(log.mock.calls)).not.toContain("aardvark");
	});

	it.each(["constructor", "__proto__", ""])("rejects %j as a word", async (word) => {
		const response = await scoreSpeechOnWorker(scoreRequest({ word }), allowingEnv(), {
			fetch: azureReturning(shipAsShip),
			log: vi.fn(),
		});
		expect(await errorCode(response)).toBe("invalid_word");
	});

	it("rejects target accents other than en-us", async () => {
		const response = await scoreSpeechOnWorker(
			scoreRequest({ targetAccent: "es-419" }),
			allowingEnv(),
			{ fetch: azureReturning(shipAsShip), log: vi.fn() },
		);
		expect(response.status).toBe(400);
		expect(await errorCode(response)).toBe("unsupported_accent");
	});

	it("rejects a body that isn't sent as audio/wav", async () => {
		const response = await scoreSpeechOnWorker(
			scoreRequest({ headers: { "Content-Type": "text/plain" } }),
			allowingEnv(),
			{ fetch: azureReturning(shipAsShip), log: vi.fn() },
		);
		expect(response.status).toBe(415);
		expect(await errorCode(response)).toBe("unsupported_audio");
	});

	it("rejects a WAV that isn't 16 kHz mono 16-bit PCM", async () => {
		const stereo = wav(1);
		const stereoHeader = new DataView(stereo.buffer);
		stereoHeader.setUint16(22, 2, true);
		stereoHeader.setUint32(28, 64_000, true);
		stereoHeader.setUint16(32, 4, true);
		const resampled = wav(1);
		const resampledHeader = new DataView(resampled.buffer);
		resampledHeader.setUint32(24, 44_100, true);
		resampledHeader.setUint32(28, 88_200, true);

		for (const body of [stereo, resampled]) {
			const response = await scoreSpeechOnWorker(scoreRequest({ body }), allowingEnv(), {
				fetch: azureReturning(shipAsShip),
				log: vi.fn(),
			});
			expect(response.status).toBe(415);
			expect(await errorCode(response)).toBe("unsupported_audio");
		}
	});

	it.each([
		["bytes that aren't a WAV file", new TextEncoder().encode("not audio")],
		["a WAV file with no samples", wav(0)],
	])("rejects %s", async (_, body) => {
		const fetch = azureReturning(shipAsShip);
		const response = await scoreSpeechOnWorker(scoreRequest({ body }), allowingEnv(), {
			fetch,
			log: vi.fn(),
		});
		expect(response.status).toBe(400);
		expect(await errorCode(response)).toBe("invalid_audio");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("accepts a recording of exactly five seconds", async () => {
		const response = await scoreSpeechOnWorker(scoreRequest({ body: wav(5) }), allowingEnv(), {
			fetch: azureReturning(shipAsShip),
			log: vi.fn(),
		});
		expect(response.status).toBe(200);
	});

	it("rejects a recording that understates its data size to pass the time limit", async () => {
		const body = wav(5.02);
		new DataView(body.buffer).setUint32(40, 32_000, true);
		const fetch = azureReturning(shipAsShip);

		const response = await scoreSpeechOnWorker(scoreRequest({ body }), allowingEnv(), {
			fetch,
			log: vi.fn(),
		});

		expect(body.length).toBe(160_684);
		expect(response.status).toBe(400);
		expect(await errorCode(response)).toBe("invalid_audio");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("rejects a recording longer than five seconds that fits the byte cap", async () => {
		const body = wav(5.01);
		expect(body.length).toBeLessThanOrEqual(MAX_SPEECH_BYTES);

		const response = await scoreSpeechOnWorker(scoreRequest({ body }), allowingEnv(), {
			fetch: azureReturning(shipAsShip),
			log: vi.fn(),
		});
		expect(response.status).toBe(413);
		expect(await errorCode(response)).toBe("audio_too_long");
	});

	it("rejects an upload over the byte cap, declared or not", async () => {
		const body = new Uint8Array(MAX_SPEECH_BYTES + 1);
		const requests = [
			scoreRequest({ body }),
			scoreRequest({ body: wav(1), headers: { "Content-Length": String(MAX_SPEECH_BYTES + 1) } }),
		];

		for (const request of requests) {
			const fetch = azureReturning(shipAsShip);
			const response = await scoreSpeechOnWorker(request, allowingEnv(), { fetch, log: vi.fn() });
			expect(response.status).toBe(413);
			expect(await errorCode(response)).toBe("audio_too_long");
			expect(fetch).not.toHaveBeenCalled();
		}
	});

	it("answers 502 when the assessment fails, even with a transcript", async () => {
		const response = await scoreSpeechOnWorker(scoreRequest(), allowingEnv(), {
			fetch: azureAnswering([{}], 500, { recognitionStatus: 200 }),
			log: vi.fn(),
		});
		expect(response.status).toBe(502);
	});

	it("answers 502 when Azure fails, and never logs the key", async () => {
		const log = vi.fn();

		const response = await scoreSpeechOnWorker(scoreRequest(), allowingEnv(), {
			fetch: azureReturning({ error: "unauthorized" }, 401),
			log,
		});

		expect(response.status).toBe(502);
		expect(await errorCode(response)).toBe("scoring_failed");
		expect(log).toHaveBeenCalledWith(
			expect.objectContaining({
				level: "error",
				details: expect.objectContaining({ word: "ship", status: 502 }),
			}),
		);
		expect(JSON.stringify(log.mock.calls)).not.toContain(KEY);
	});
});
