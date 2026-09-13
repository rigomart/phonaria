import { describe, expect, it, vi } from "vitest";
import type { G2PWord } from "@/lib/g2p/model";
import { TranscriptionError } from "@/lib/transcription/contract";

vi.mock("@/lib/g2p/service", () => ({
	processWords: vi.fn(),
}));

const { processWords } = await import("@/lib/g2p/service");
const { transcribeWordsAction } = await import("./transcribe");

function word(value: string): G2PWord {
	return {
		word: value,
		variants: [[{ phonemes: [{ cmuToken: "AH", phonemeId: null }], stress: "none" }]],
		source: "cmudict",
	};
}

describe("transcribeWordsAction", () => {
	it("returns words from the shared service", async () => {
		vi.mocked(processWords).mockResolvedValue([word("hello")]);

		await expect(transcribeWordsAction({ words: ["hello"] })).resolves.toEqual([word("hello")]);
		expect(processWords).toHaveBeenCalledWith(["hello"]);
	});

	it("throws a validation error for malformed input", async () => {
		vi.mocked(processWords).mockClear();

		await expect(transcribeWordsAction({ words: [] })).rejects.toBeInstanceOf(TranscriptionError);
		await expect(transcribeWordsAction({ words: [] })).rejects.toMatchObject({
			kind: "validation",
			retryable: false,
		});
		expect(processWords).not.toHaveBeenCalled();
	});

	it("throws a retryable error when the lookup times out", async () => {
		vi.mocked(processWords).mockRejectedValue(new Error("network timeout"));

		await expect(transcribeWordsAction({ words: ["hello"] })).rejects.toMatchObject({
			kind: "retryable",
			retryable: true,
		});
	});

	it("throws a database error when the lookup fails", async () => {
		vi.mocked(processWords).mockRejectedValue(new Error("SQLITE_ERROR: disk I/O error"));

		await expect(transcribeWordsAction({ words: ["hello"] })).rejects.toMatchObject({
			kind: "database",
			retryable: true,
		});
	});
});
