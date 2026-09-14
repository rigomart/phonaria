import { describe, expect, it, vi } from "vitest";
import type { G2PWord } from "@/lib/g2p/model";
import { TranscriptionError } from "@/lib/transcription/contract";
import { transcribeWordsOnWorker } from "./transcription";

function word(value: string): G2PWord {
	return {
		word: value,
		variants: [[{ phonemes: [{ cmuToken: "AH", phonemeId: null }], stress: "none" }]],
		source: "cmudict",
	};
}

describe("transcribeWordsOnWorker", () => {
	it("returns words from the shared service without opening Turso on validation failure", async () => {
		const processWords = vi.fn(async () => [word("hello")]);
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: [] }, {}, { processWords, log }),
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
			transcribeWordsOnWorker({ words: ["aardvark"] }, {}, { processWords, log }),
		).resolves.toEqual([word("aardvark")]);
		expect(processWords).toHaveBeenCalledWith(["aardvark"]);
		expect(log).not.toHaveBeenCalled();
	});

	it("logs a sanitized database failure and does not include credentials", async () => {
		const processWords = vi.fn(async () => {
			throw new Error("SQLITE_ERROR: no such table: words");
		});
		const log = vi.fn();

		await expect(
			transcribeWordsOnWorker({ words: ["aardvark"] }, {}, { processWords, log }),
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
			transcribeWordsOnWorker({ words: ["aardvark"] }, {}, { log }),
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
			transcribeWordsOnWorker({ words: ["aardvark"] }, {}, { processWords, log }),
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
