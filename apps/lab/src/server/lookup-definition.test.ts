import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefinitionError } from "@/lib/definition/contract";

const stubs = vi.hoisted(() => ({
	getRequestHeader: vi.fn(),
	getWorkerEnv: vi.fn(),
	setResponseStatus: vi.fn(),
	lookupDefinitionOnWorker: vi.fn(),
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
vi.mock("@/server/definition", () => ({
	lookupDefinitionOnWorker: stubs.lookupDefinitionOnWorker,
}));

const { lookupDefinitionFn } = await import("./lookup-definition");

describe("lookupDefinitionFn", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		stubs.getRequestHeader.mockReturnValue("203.0.113.10");
		stubs.getWorkerEnv.mockReturnValue({
			DEFINITION_RATE_LIMIT: { limit: vi.fn() },
		});
	});

	it("returns rate-limit failures as HTTP 429 responses", async () => {
		const error = new DefinitionError(
			"rate_limit",
			"Too many definition requests. Please try again shortly.",
		);
		stubs.lookupDefinitionOnWorker.mockRejectedValue(error);

		await expect(lookupDefinitionFn({ data: { word: "hello" } })).rejects.toBe(error);

		expect(stubs.lookupDefinitionOnWorker).toHaveBeenCalledWith(
			{ word: "hello" },
			expect.objectContaining({ DEFINITION_RATE_LIMIT: expect.any(Object) }),
			{ rateLimitKey: "203.0.113.10" },
		);
		expect(stubs.setResponseStatus).toHaveBeenCalledWith(429);
	});
});
