import { beforeEach, describe, expect, it, vi } from "vitest";
import { TranscriptionError } from "@/lib/transcription/contract";

const stubs = vi.hoisted(() => ({
	createClient: vi.fn(),
	getRequestHeader: vi.fn(),
	getWorkerEnv: vi.fn(),
	setResponseStatus: vi.fn(),
	transcribeWordsOnWorker: vi.fn(),
}));

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		validator: () => ({
			handler: (handler: (options: { data: unknown }) => unknown) => handler,
		}),
	}),
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequestHeader: stubs.getRequestHeader,
	setResponseStatus: stubs.setResponseStatus,
}));

vi.mock("@libsql/client/web", () => ({ createClient: stubs.createClient }));
vi.mock("@/server/cloudflare/env", () => ({ getWorkerEnv: stubs.getWorkerEnv }));
vi.mock("@/server/transcription", () => ({
	transcribeWordsOnWorker: stubs.transcribeWordsOnWorker,
}));

const { transcribeWordsFn } = await import("./transcribe");

describe("transcribeWordsFn", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		stubs.getRequestHeader.mockReturnValue("203.0.113.10");
		stubs.getWorkerEnv.mockReturnValue({
			TURSO_DATABASE_URL: "libsql://lab.example",
			TURSO_AUTH_TOKEN: "token",
			TRANSCRIPTION_RATE_LIMIT: { limit: vi.fn() },
		});
	});

	it("returns rate-limit failures as HTTP 429 responses", async () => {
		const error = new TranscriptionError(
			"rate_limit",
			"Too many transcription requests. Please try again shortly.",
		);
		stubs.transcribeWordsOnWorker.mockRejectedValue(error);

		await expect(transcribeWordsFn({ data: { words: ["aardvark"] } })).rejects.toBe(error);

		expect(stubs.transcribeWordsOnWorker).toHaveBeenCalledWith(
			{ words: ["aardvark"] },
			expect.objectContaining({ TRANSCRIPTION_RATE_LIMIT: expect.any(Object) }),
			{ createClient: stubs.createClient, rateLimitKey: "203.0.113.10" },
		);
		expect(stubs.setResponseStatus).toHaveBeenCalledWith(429);
	});
});
