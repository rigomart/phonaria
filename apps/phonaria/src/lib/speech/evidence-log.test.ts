import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
	EVIDENCE_LOG_PATH,
	type EvidenceLogFetch,
	type EvidenceLogPayload,
	sendEvidenceLog,
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
