import { describe, expect, it } from "vitest";
import {
	MAX_TRANSCRIPTION_WORDS,
	TranscriptionError,
	transcriptionWordsInputSchema,
	transcriptionWordsOutputSchema,
} from "./contract";

describe("transcriptionWordsInputSchema", () => {
	it("accepts a single non-empty word", () => {
		expect(transcriptionWordsInputSchema.safeParse({ words: ["hello"] }).success).toBe(true);
	});

	it("accepts the 200-word limit", () => {
		const words = Array.from({ length: MAX_TRANSCRIPTION_WORDS }, (_, i) => `w${i}`);
		expect(transcriptionWordsInputSchema.safeParse({ words }).success).toBe(true);
	});

	it("rejects an empty word list", () => {
		const result = transcriptionWordsInputSchema.safeParse({ words: [] });
		expect(result.success).toBe(false);
	});

	it("rejects more than 200 words", () => {
		const words = Array.from({ length: MAX_TRANSCRIPTION_WORDS + 1 }, (_, i) => `w${i}`);
		expect(transcriptionWordsInputSchema.safeParse({ words }).success).toBe(false);
	});

	it("rejects empty strings in the list", () => {
		expect(transcriptionWordsInputSchema.safeParse({ words: ["hello", ""] }).success).toBe(false);
	});

	it("accepts a word at the 64-character limit", () => {
		expect(transcriptionWordsInputSchema.safeParse({ words: ["a".repeat(64)] }).success).toBe(true);
	});

	it("rejects a word longer than 64 characters", () => {
		expect(transcriptionWordsInputSchema.safeParse({ words: ["a".repeat(65)] }).success).toBe(
			false,
		);
	});

	it("rejects a missing words field", () => {
		expect(transcriptionWordsInputSchema.safeParse({}).success).toBe(false);
	});

	it("rejects a non-array words value", () => {
		expect(transcriptionWordsInputSchema.safeParse({ words: "hello" }).success).toBe(false);
	});

	it("rejects a non-object payload", () => {
		expect(transcriptionWordsInputSchema.safeParse(null).success).toBe(false);
		expect(transcriptionWordsInputSchema.safeParse("hello").success).toBe(false);
	});
});

describe("transcriptionWordsOutputSchema", () => {
	it("accepts a cmudict word payload", () => {
		const result = transcriptionWordsOutputSchema.safeParse([
			{
				word: "hello",
				variants: [
					[
						{
							phonemes: [{ ipa: "h", phonemeId: "H", cmuToken: "HH" }],
							stress: "none",
						},
					],
				],
				source: "cmudict",
			},
		]);
		expect(result.success).toBe(true);
	});
});

describe("TranscriptionError", () => {
	it("marks validation failures as not retryable", () => {
		const error = new TranscriptionError("validation", "too many words");
		expect(error.kind).toBe("validation");
		expect(error.retryable).toBe(false);
		expect(error.name).toBe("TranscriptionError");
	});

	it("marks database and retryable failures as retryable", () => {
		expect(new TranscriptionError("database", "query failed").retryable).toBe(true);
		expect(new TranscriptionError("retryable", "timeout").retryable).toBe(true);
	});

	it("marks rate-limit failures as retryable HTTP 429 errors", () => {
		const error = new TranscriptionError("rate_limit", "Too many transcription requests");

		expect(error.retryable).toBe(true);
		expect(error.status).toBe(429);
	});
});
