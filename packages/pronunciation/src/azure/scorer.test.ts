import { describe, expect, it, vi } from "vitest";
import type { ScoringRequest } from "../contract";
import { MISCUE_FIXTURES } from "./fixtures/miscue";
import sheepAsShip from "./fixtures/sheep-as-ship.json";
import { createAzureScorer, requestAzureAssessment, requestAzureRecognition } from "./scorer";

const audio = new Uint8Array([82, 73, 70, 70]);
const SHIP: ScoringRequest = {
	targetAccent: "en-us",
	words: [{ text: "ship", acceptedPronunciations: [["SH", "IX", "P"]] }],
};

function jsonFetch(body: unknown, status = 200) {
	return vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
		Response.json(body, { status }),
	);
}

function decodeAssessmentHeader(init: RequestInit | undefined): unknown {
	const headers = init?.headers as Record<string, string> | undefined;
	const header = headers?.["Pronunciation-Assessment"] ?? "";
	const bytes = Uint8Array.from(atob(header), (char) => char.charCodeAt(0));
	return JSON.parse(new TextDecoder().decode(bytes));
}

describe("requestAzureAssessment", () => {
	it("posts the WAV to the short-audio endpoint with the assessment header", async () => {
		const fetch = jsonFetch(sheepAsShip);
		await requestAzureAssessment(audio, SHIP, { key: "test-key", region: "eastus", fetch });

		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe(
			"https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed",
		);
		expect(init).toMatchObject({
			method: "POST",
			body: audio,
			headers: {
				"Ocp-Apim-Subscription-Key": "test-key",
				"Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
				Accept: "application/json",
			},
		});
		expect(decodeAssessmentHeader(init)).toEqual({
			ReferenceText: "ship",
			GradingSystem: "HundredMark",
			Granularity: "Phoneme",
			Dimension: "Comprehensive",
			PhonemeAlphabet: "IPA",
			NBestPhonemeCount: 10,
			EnableMiscue: true,
		});
	});

	it("joins the target words with spaces and encodes text outside Latin-1", async () => {
		const fetch = jsonFetch(sheepAsShip);
		await requestAzureAssessment(
			audio,
			{
				targetAccent: "en-us",
				words: [
					{ text: "café", acceptedPronunciations: [] },
					{ text: "naïve—ok", acceptedPronunciations: [] },
				],
			},
			{ key: "k", region: "westus2", nBestPhonemeCount: 3, fetch },
		);
		expect(decodeAssessmentHeader(fetch.mock.calls[0][1])).toMatchObject({
			ReferenceText: "café naïve—ok",
			NBestPhonemeCount: 3,
		});
	});

	it("reports an HTTP failure by status without echoing the key", async () => {
		const fetch = jsonFetch({ error: "denied" }, 401);
		const failure = requestAzureAssessment(audio, SHIP, { key: "secret", region: "eastus", fetch });
		await expect(failure).rejects.toThrow("HTTP 401");
		await expect(failure).rejects.not.toThrow("secret");
	});

	it("reports a network failure", async () => {
		const fetch = vi.fn(async () => {
			throw new TypeError("network down");
		});
		await expect(
			requestAzureAssessment(audio, SHIP, { key: "k", region: "eastus", fetch }),
		).rejects.toThrow(/request failed/);
	});

	it("rejects bad settings before calling Azure", async () => {
		const fetch = jsonFetch(sheepAsShip);
		const attempts = [
			requestAzureAssessment(audio, SHIP, { key: "", region: "eastus", fetch }),
			requestAzureAssessment(audio, SHIP, { key: "k", region: "east us", fetch }),
			requestAzureAssessment(
				audio,
				{ ...SHIP, targetAccent: "es-419" },
				{ key: "k", region: "eastus", fetch },
			),
			requestAzureAssessment(audio, { ...SHIP, words: [] }, { key: "k", region: "eastus", fetch }),
			requestAzureAssessment(audio, SHIP, {
				key: "k",
				region: "eastus",
				nBestPhonemeCount: 0,
				fetch,
			}),
		];
		for (const attempt of attempts) await expect(attempt).rejects.toThrow();
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("requestAzureRecognition", () => {
	it("posts the WAV to the same endpoint with no assessment header", async () => {
		const fetch = jsonFetch(MISCUE_FIXTURES.ships.recognition);
		const response = await requestAzureRecognition(audio, "en-us", {
			key: "test-key",
			region: "eastus",
			fetch,
		});

		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe(
			"https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed",
		);
		expect(init?.body).toBe(audio);
		expect(init?.headers).not.toHaveProperty("Pronunciation-Assessment");
		expect(response.NBest?.[0]?.Lexical).toBe("ships");
	});
});

/** Answers the assessment and the plain recognition by whether the assessment header is set. */
function azureFetch(said: keyof typeof MISCUE_FIXTURES, recognitionStatus = 200) {
	const { assessment, recognition } = MISCUE_FIXTURES[said];
	return vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
		const assessing = "Pronunciation-Assessment" in ((init?.headers ?? {}) as object);
		return assessing
			? Response.json(assessment)
			: Response.json(recognition, { status: recognitionStatus });
	});
}

describe("createAzureScorer", () => {
	it("returns one word's evidence per target word, with the transcript", async () => {
		const fetch = azureFetch("sheep");
		const scorer = createAzureScorer({ key: "k", region: "eastus", fetch });
		const recording = await scorer.score(audio, SHIP);

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(recording.words).toHaveLength(1);
		expect(recording.words[0].pronunciations[0].sounds[1]).toMatchObject({
			phonemeId: "IX",
			targetScore: 0.02,
		});
		expect(recording.transcript?.words).toEqual(["sheep"]);
	});

	it("leaves the transcript out when only the recognition fails", async () => {
		const scorer = createAzureScorer({
			key: "k",
			region: "eastus",
			fetch: azureFetch("ship", 500),
		});
		const recording = await scorer.score(audio, SHIP);
		expect(recording).not.toHaveProperty("transcript");
		expect(recording.words[0].pronunciations).toHaveLength(1);
	});

	it("fails when the assessment fails", async () => {
		const scorer = createAzureScorer({ key: "k", region: "eastus", fetch: jsonFetch({}, 401) });
		await expect(scorer.score(audio, SHIP)).rejects.toThrow("HTTP 401");
	});
});
