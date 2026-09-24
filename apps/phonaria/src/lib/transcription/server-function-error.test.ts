import { describe, expect, it } from "vitest";
import { TranscriptionError } from "./contract";
import { invokeTranscribeServerFunction, toRetryableLearnerError } from "./server-function-error";

describe("toRetryableLearnerError", () => {
	it("preserves Error instances including application failures", () => {
		const error = new TranscriptionError("retryable", "lookup timed out");
		expect(toRetryableLearnerError(error)).toBe(error);
	});

	it("converts non-JSON 5xx-style values into a thrown Error", () => {
		const error = toRetryableLearnerError("<html>error code: 1102</html>");
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe("Transcription lookup failed");
	});

	it("converts a Response-like platform failure into a thrown Error", () => {
		const error = toRetryableLearnerError({ status: 503, body: "error code: 1102" });
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe("Transcription lookup failed");
	});
});

describe("invokeTranscribeServerFunction", () => {
	it("returns a successful payload", async () => {
		await expect(invokeTranscribeServerFunction(async () => ["ok"])).resolves.toEqual(["ok"]);
	});

	it("maps a failed server-function call to a retryable learner error", async () => {
		await expect(
			invokeTranscribeServerFunction(async () => {
				throw "Internal Server Error";
			}),
		).rejects.toMatchObject({ message: "Transcription lookup failed" });
	});
});
