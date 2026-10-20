import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
	EVIDENCE_LOG_OTHER_WORD,
	EVIDENCE_LOG_PATH,
	type EvidenceLogFetch,
	type EvidenceLogPayload,
	isLoggableWord,
	isLoggableWordList,
	sendEvidenceLog,
	withCatalogWordsOnly,
} from "./evidence-log";

const PAYLOAD: EvidenceLogPayload = {
	schemaVersion: 1,
	attemptedAt: 1_792_497_600_000,
	word: "ship",
	targetAccent: "en-us",
	evidence: { words: [{ pronunciations: [] }], transcript: null },
	verdicts: { judgedPhonemeIds: ["IX", "I"], gate: { type: "not-heard" }, judgement: null },
	next: "retried",
};

type DeepKeys<T> = T extends readonly (infer Item)[]
	? DeepKeys<Item>
	: T extends object
		? { [Key in keyof T]-?: Key | DeepKeys<T[Key]> }[keyof T]
		: never;

type DeepValues<T> = T extends readonly (infer Item)[]
	? DeepValues<Item>
	: T extends object
		? { [Key in keyof T]-?: DeepValues<T[Key]> }[keyof T]
		: T;

describe("EvidenceLogPayload", () => {
	it("has no audio fields at any depth", () => {
		expectTypeOf<
			Extract<
				DeepKeys<EvidenceLogPayload>,
				`${string}${"audio" | "wav" | "recording" | "blob"}${string}`
			>
		>().toEqualTypeOf<never>();
		expectTypeOf<
			Extract<DeepValues<EvidenceLogPayload>, ArrayBufferLike | ArrayBufferView | Blob>
		>().toEqualTypeOf<never>();
	});

	it("carries only the agreed fields at the top", () => {
		expectTypeOf<keyof EvidenceLogPayload>().toEqualTypeOf<
			"schemaVersion" | "attemptedAt" | "word" | "targetAccent" | "evidence" | "verdicts" | "next"
		>();
	});
});

describe("sendEvidenceLog", () => {
	it("posts the payload as JSON, kept alive so moving on can't cancel it", async () => {
		const fetch = vi.fn<EvidenceLogFetch>(async () => new Response(null, { status: 204 }));

		expect(await sendEvidenceLog(PAYLOAD, fetch)).toBe("sent");
		expect(fetch).toHaveBeenCalledWith(EVIDENCE_LOG_PATH, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(PAYLOAD),
			keepalive: true,
		});
	});

	it.each([
		[429, "rate_limited"],
		[404, "unavailable"],
		[503, "unavailable"],
		[400, "rejected"],
		[413, "rejected"],
		[502, "failed"],
	] as const)("reports a %i as %s", async (status, result) => {
		const fetch = vi.fn<EvidenceLogFetch>(async () => Response.json({}, { status }));
		expect(await sendEvidenceLog(PAYLOAD, fetch)).toBe(result);
	});

	it("never throws when the network fails", async () => {
		const fetch = vi.fn<EvidenceLogFetch>(async () => {
			throw new TypeError("offline");
		});
		expect(await sendEvidenceLog(PAYLOAD, fetch)).toBe("failed");
	});
});

const HEARD_A_NAME: EvidenceLogPayload = {
	...PAYLOAD,
	evidence: {
		words: [{ pronunciations: [] }],
		transcript: { words: ["alice", "ship", "2125550199"], confidence: 0.7 },
		insertedWords: ["alice", "sheep"],
	},
	verdicts: {
		judgedPhonemeIds: ["IX", "I"],
		gate: { type: "different-word", heard: ["alice", "ship", "2125550199"] },
		judgement: {
			pronunciationIndex: 0,
			sounds: [
				{
					position: 0,
					phonemeId: "SH",
					verdict: { type: "swapped", heard: "CH", heardWord: "chip" },
				},
				{
					position: 1,
					phonemeId: "IX",
					verdict: { type: "swapped", heard: "I", heardWord: "smith" },
				},
			],
		},
	},
};

describe("withCatalogWordsOnly", () => {
	const OTHER_3 = [EVIDENCE_LOG_OTHER_WORD, EVIDENCE_LOG_OTHER_WORD, EVIDENCE_LOG_OTHER_WORD];

	it("turns every word of a longer transcript and every inserted word into the placeholder, keeping counts and confidence", () => {
		const logged = withCatalogWordsOnly(HEARD_A_NAME);

		expect(logged.evidence.transcript).toEqual({ words: OTHER_3, confidence: 0.7 });
		expect(logged.evidence.insertedWords).toEqual([
			EVIDENCE_LOG_OTHER_WORD,
			EVIDENCE_LOG_OTHER_WORD,
		]);
		expect(logged.verdicts.gate).toEqual({ type: "different-word", heard: OTHER_3 });
		expect(logged.verdicts.judgement?.sounds.map(({ verdict }) => verdict)).toEqual([
			{ type: "swapped", heard: "CH", heardWord: "chip" },
			{ type: "swapped", heard: "I", heardWord: EVIDENCE_LOG_OTHER_WORD },
		]);
		expect(JSON.stringify(logged)).not.toMatch(/alice|smith|2125550199/);
	});

	it.each([
		["Sue Park", ["sue", "park"]],
		["Pat Lane", ["pat", "lane"]],
	])("never keeps a name spelled with catalog words, such as %s", (_name, words) => {
		const logged = withCatalogWordsOnly({
			...HEARD_A_NAME,
			evidence: { words: [{ pronunciations: [] }], transcript: { words, confidence: 0.9 } },
			verdicts: { gate: { type: "different-word", heard: words }, judgement: null },
		});

		expect(logged.evidence.transcript?.words).toEqual([
			EVIDENCE_LOG_OTHER_WORD,
			EVIDENCE_LOG_OTHER_WORD,
		]);
		expect(logged.verdicts.gate).toEqual({
			type: "different-word",
			heard: [EVIDENCE_LOG_OTHER_WORD, EVIDENCE_LOG_OTHER_WORD],
		});
	});

	it("keeps a one-word transcript that is a catalog word, which re-judging needs", () => {
		const oneWord = (word: string) =>
			withCatalogWordsOnly({
				...PAYLOAD,
				evidence: {
					words: [{ pronunciations: [] }],
					transcript: { words: [word], confidence: 0.8 },
				},
				verdicts: { gate: { type: "different-word", heard: [word] }, judgement: null },
			});

		expect(oneWord("sheep").evidence.transcript?.words).toEqual(["sheep"]);
		expect(oneWord("sheep").verdicts.gate).toEqual({ type: "different-word", heard: ["sheep"] });
		expect(oneWord("alice").evidence.transcript?.words).toEqual([EVIDENCE_LOG_OTHER_WORD]);
	});

	it("accepts a word list only as one loggable word or placeholders only", () => {
		expect(isLoggableWordList(["sheep"])).toBe(true);
		expect(isLoggableWordList([EVIDENCE_LOG_OTHER_WORD, EVIDENCE_LOG_OTHER_WORD])).toBe(true);
		expect(isLoggableWordList([])).toBe(true);
		expect(isLoggableWordList(["sue", "park"])).toBe(false);
		expect(isLoggableWordList([EVIDENCE_LOG_OTHER_WORD, "ship"])).toBe(false);
		expect(isLoggableWordList(["alice"])).toBe(false);
	});

	it("leaves a payload with no transcript, gate words or swaps as it was", () => {
		expect(withCatalogWordsOnly(PAYLOAD)).toEqual(PAYLOAD);
	});

	it("accepts only catalog words and the placeholder", () => {
		expect(["ship", "chip", EVIDENCE_LOG_OTHER_WORD].every(isLoggableWord)).toBe(true);
		expect(["alice", "Ship", "2125550199", "other", ""].some(isLoggableWord)).toBe(false);
	});

	it("is applied before sending, so a name never leaves the browser", async () => {
		const fetch = vi.fn<EvidenceLogFetch>(async () => new Response(null, { status: 204 }));

		await sendEvidenceLog(HEARD_A_NAME, fetch);

		const body = String(fetch.mock.calls[0][1].body);
		expect(JSON.parse(body)).toEqual(withCatalogWordsOnly(HEARD_A_NAME));
		expect(body).not.toMatch(/alice|smith|2125550199/);
	});
});
