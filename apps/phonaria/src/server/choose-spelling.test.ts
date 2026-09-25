import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpellingContextValidationError } from "@/lib/transcription/spelling-context-service";

const stubs = vi.hoisted(() => ({
	getRequestHeader: vi.fn(),
	getWorkerEnv: vi.fn(),
	setResponseStatus: vi.fn(),
	chooseSpellingOnWorker: vi.fn(),
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

vi.mock("@/server/cloudflare/env", () => ({ getWorkerEnv: stubs.getWorkerEnv }));
vi.mock("@/server/spelling-context", () => ({
	chooseSpellingOnWorker: stubs.chooseSpellingOnWorker,
}));

const { chooseSpellingInContextFn } = await import("./choose-spelling");

describe("chooseSpellingInContextFn", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		stubs.getRequestHeader.mockReturnValue("203.0.113.10");
		stubs.getWorkerEnv.mockReturnValue({ SPELLING_CONTEXT_RATE_LIMIT: { limit: vi.fn() } });
	});

	it("rate-limits by connecting IP", async () => {
		stubs.chooseSpellingOnWorker.mockResolvedValue({ status: "unavailable" });

		await expect(chooseSpellingInContextFn({ data: { text: "x" } })).resolves.toEqual({
			status: "unavailable",
		});
		expect(stubs.chooseSpellingOnWorker).toHaveBeenCalledWith(
			{ text: "x" },
			expect.objectContaining({ SPELLING_CONTEXT_RATE_LIMIT: expect.any(Object) }),
			{ rateLimitKey: "203.0.113.10" },
		);
	});

	it("answers malformed input with HTTP 400", async () => {
		const error = new SpellingContextValidationError("Invalid spelling context request");
		stubs.chooseSpellingOnWorker.mockRejectedValue(error);

		await expect(chooseSpellingInContextFn({ data: {} })).rejects.toBe(error);
		expect(stubs.setResponseStatus).toHaveBeenCalledWith(400);
	});
});
