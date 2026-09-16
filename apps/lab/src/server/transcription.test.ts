import { describe, expect, it, vi } from "vitest";
import type { G2PWord } from "@/lib/g2p/model";
import { TranscriptionError } from "@/lib/transcription/contract";
import { type TranscriptionWorkerEnv, transcribeWordsOnWorker } from "./transcription";

function word(value: string): G2PWord {
	return {
		word: value,
		variants: [[{ phonemes: [{ cmuToken: "AH", phonemeId: null }], stress: "none" }]],
		source: "cmudict",
	};
}

function allowingEnv(overrides: Partial<TranscriptionWorkerEnv> = {}): TranscriptionWorkerEnv {
	return {
		TRANSCRIPTION_RATE_LIMIT: { limit: async () => ({ success: true }) },
		...overrides,
	};
}

describe("transcribeWordsOnWorker", () => {
	it("fails closed without a configured rate-limit binding", async () => {
		const processWords = vi.fn(async () => [word("hello")]);
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: ["hello"] }, {} as TranscriptionWorkerEnv, {
				processWords,
				log,
			}),
		).rejects.toMatchObject({
			kind: "retryable",
			retryable: true,
			message: "Transcription service is temporarily unavailable.",
		});
		expect(processWords).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "transcription_failed",
			details: { kind: "retryable", retryable: true },
		});
	});

	it("returns words from the shared service without opening Turso on validation failure", async () => {
		const processWords = vi.fn(async () => [word("hello")]);
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: [] }, allowingEnv(), { processWords, log }),
		).rejects.toMatchObject({
			kind: "validation",
			retryable: false,
		});
		expect(processWords).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith({
			level: "warn",
			message: "transcription_failed",
			details: { kind: "validation", retryable: false },
		});
		expect(JSON.stringify(log.mock.calls[0]?.[0])).not.toMatch(/TURSO_|libsql:\/\//);
	});

	it("opens the database only after validation passes", async () => {
		const processWords = vi.fn(async () => [word("aardvark")]);
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: ["aardvark"] }, allowingEnv(), {
				processWords,
				log,
			}),
		).resolves.toEqual([word("aardvark")]);
		expect(processWords).toHaveBeenCalledWith(["aardvark"]);
		expect(log).not.toHaveBeenCalled();
	});

	it("allows an ordinary request through the configured rate limiter", async () => {
		const processWords = vi.fn(async () => [word("aardvark")]);
		const limit = vi.fn(async () => ({ success: true }));

		await expect(
			transcribeWordsOnWorker(
				{ words: ["aardvark"] },
				{ TRANSCRIPTION_RATE_LIMIT: { limit } },
				{ processWords, rateLimitKey: "203.0.113.10" },
			),
		).resolves.toEqual([word("aardvark")]);
		expect(limit).toHaveBeenCalledWith({ key: "203.0.113.10" });
	});

	it("rejects a limited request before calling the processor", async () => {
		const processWords = vi.fn(async () => [word("aardvark")]);
		const limit = vi.fn(async () => ({ success: false }));
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker(
				{ words: ["aardvark"] },
				{ TRANSCRIPTION_RATE_LIMIT: { limit } },
				{ processWords, rateLimitKey: "203.0.113.10", log },
			),
		).rejects.toMatchObject({
			kind: "rate_limit",
			retryable: true,
			status: 429,
			message: "Too many transcription requests. Please try again shortly.",
		});
		expect(processWords).not.toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith({
			level: "warn",
			message: "transcription_failed",
			details: { kind: "rate_limit", retryable: true },
		});
	});

	it("rejects an oversized word without calling the processor", async () => {
		const processWords = vi.fn(async () => [word("hello")]);
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: ["a".repeat(65)] }, allowingEnv(), {
				processWords,
				log,
			}),
		).rejects.toMatchObject({
			kind: "validation",
			retryable: false,
		});
		expect(processWords).not.toHaveBeenCalled();
	});

	it("logs a sanitized database failure and does not include credentials", async () => {
		const processWords = vi.fn(async () => {
			throw new Error("SQLITE_ERROR: no such table: words");
		});
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: ["aardvark"] }, allowingEnv(), {
				processWords,
				log,
			}),
		).rejects.toBeInstanceOf(TranscriptionError);

		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "transcription_failed",
			details: { kind: "database", retryable: true },
		});
		const payload = JSON.stringify(log.mock.calls[0]?.[0]);
		expect(payload).not.toMatch(/aardvark/);
		expect(payload).not.toMatch(/TURSO_/);
		expect(payload).not.toMatch(/libsql:\/\//);
		expect(payload).not.toMatch(/SQLITE_ERROR/);
	});

	it("maps missing Worker Turso bindings to a database error", async () => {
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: ["aardvark"] }, allowingEnv(), { log }),
		).rejects.toMatchObject({
			kind: "database",
			retryable: true,
		});
		expect(log).toHaveBeenCalledWith(
			expect.objectContaining({
				level: "error",
				message: "transcription_failed",
				details: expect.objectContaining({ kind: "database" }),
			}),
		);
	});

	it("maps retryable lookup failures", async () => {
		const processWords = vi.fn(async () => {
			throw new Error("fetch failed: network timeout");
		});
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: ["aardvark"] }, allowingEnv(), {
				processWords,
				log,
			}),
		).rejects.toMatchObject({
			kind: "retryable",
			retryable: true,
		});
		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "transcription_failed",
			details: { kind: "retryable", retryable: true },
		});
	});
});
