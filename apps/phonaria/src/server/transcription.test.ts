import { createClient as createWebClient } from "@libsql/client/web";
import { describe, expect, it, vi } from "vitest";
import { createDatabase } from "@/db/drizzle";
import type { G2PWord } from "@/lib/g2p/model";
import { TranscriptionError } from "@/lib/transcription/contract";
import {
	TRANSCRIPTION_DATABASE_MESSAGE,
	TRANSCRIPTION_RETRYABLE_MESSAGE,
} from "@/lib/transcription/service";
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

	it("logs why the database failed, without the learner's words or credentials", async () => {
		const processWords = vi.fn(async () => {
			throw Object.assign(new Error('Failed query: select "word" from "words"\nparams: AARDVARK'), {
				query: 'select "word" from "words"',
				params: ["AARDVARK"],
				cause: new Error("SQLITE_ERROR: no such table: words (libsql://db-example.turso.io)"),
			});
		});
		const log = vi.fn();

		const failure = transcribeWordsOnWorker({ words: ["aardvark"] }, allowingEnv(), {
			processWords,
			log,
		});
		await expect(failure).rejects.toBeInstanceOf(TranscriptionError);
		await expect(failure).rejects.toMatchObject({
			kind: "database",
			message: TRANSCRIPTION_DATABASE_MESSAGE,
		});

		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "transcription_failed",
			details: {
				kind: "database",
				retryable: true,
				reason: "Error: SQLITE_ERROR: no such table: words ([url]",
			},
		});
		const payload = JSON.stringify(log.mock.calls[0]?.[0]);
		expect(payload).not.toMatch(/aardvark/i);
		expect(payload).not.toMatch(/TURSO_/);
		expect(payload).not.toMatch(/libsql:\/\//);
		expect(payload).not.toMatch(/select/i);
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
			details: {
				kind: "retryable",
				retryable: true,
				reason: "Error: fetch failed: network timeout",
			},
		});
	});

	it("gives up on a Turso request that hangs and reports a retryable failure", async () => {
		const hangingFetch = vi.fn(
			(_input: RequestInfo | URL, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
				}),
		);
		vi.stubGlobal("fetch", hangingFetch);
		const log = vi.fn();

		try {
			await expect(
				transcribeWordsOnWorker(
					{ words: ["aardvark"] },
					allowingEnv({
						TURSO_DATABASE_URL: "libsql://db-example.turso.io",
						TURSO_AUTH_TOKEN: "token",
					}),
					{
						openDatabase: (config) =>
							createDatabase(config, {
								readOnly: true,
								createClient: createWebClient,
								requestTimeoutMs: 20,
							}),
						log,
					},
				),
			).rejects.toMatchObject({
				kind: "retryable",
				retryable: true,
				message: TRANSCRIPTION_RETRYABLE_MESSAGE,
			});
		} finally {
			vi.unstubAllGlobals();
		}

		expect(hangingFetch).toHaveBeenCalled();
		expect(log).toHaveBeenCalledWith({
			level: "error",
			message: "transcription_failed",
			details: expect.objectContaining({
				kind: "retryable",
				reason: expect.stringMatching(/^TimeoutError/),
			}),
		});
	});
});
