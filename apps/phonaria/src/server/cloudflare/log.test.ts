import { afterEach, describe, expect, it, vi } from "vitest";
import { logWorkerEvent } from "./log";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("logWorkerEvent", () => {
	it("redacts credentials and omits long learner input", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		logWorkerEvent({
			level: "error",
			message: "turso read failed",
			details: {
				authToken: "secret-token",
				TURSO_DATABASE_URL: "libsql://example.turso.io",
				input: "a".repeat(200),
				status: 500,
			},
		});
		expect(error).toHaveBeenCalledTimes(1);
		const payload = JSON.parse(String(error.mock.calls[0]?.[0]));
		expect(payload.source).toBe("phonaria");
		expect(payload.details.authToken).toBe("[redacted]");
		expect(payload.details.TURSO_DATABASE_URL).toBe("[redacted]");
		expect(payload.details.input).toBe("[omitted]");
		expect(payload.details.status).toBe(500);
	});
});
