import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({
	env: {},
}));

import { type LabWorkerEnv, readWorkerString } from "./env";

describe("readWorkerString", () => {
	it("returns defined non-empty binding values", () => {
		const env: LabWorkerEnv = {
			TURSO_DATABASE_URL: "libsql://lab.example",
			TURSO_AUTH_TOKEN: "token",
		};
		expect(readWorkerString(env, "TURSO_DATABASE_URL")).toBe("libsql://lab.example");
		expect(readWorkerString(env, "TURSO_AUTH_TOKEN")).toBe("token");
	});

	it("treats missing and blank values as unset", () => {
		const env: LabWorkerEnv = {
			TURSO_DATABASE_URL: "  ",
			SITE_URL: undefined,
		};
		expect(readWorkerString(env, "TURSO_DATABASE_URL")).toBeUndefined();
		expect(
			readWorkerString({ ...env, TURSO_DATABASE_URL: "" }, "TURSO_DATABASE_URL"),
		).toBeUndefined();
		expect(readWorkerString(env, "SITE_URL")).toBeUndefined();
	});
});
