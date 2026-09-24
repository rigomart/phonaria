import { afterEach, describe, expect, it } from "vitest";
import { resolveDatabaseConfig, resolveTestDatabaseConfig } from "./config";

afterEach(() => {
	delete process.env.TURSO_DATABASE_URL;
	delete process.env.TURSO_AUTH_TOKEN;
	delete process.env.TURSO_TEST_DATABASE_URL;
	delete process.env.TURSO_TEST_AUTH_TOKEN;
});

describe("resolveDatabaseConfig", () => {
	it("reads runtime credentials from the provided env", () => {
		expect(
			resolveDatabaseConfig({
				TURSO_DATABASE_URL: "libsql://lab.example",
				TURSO_AUTH_TOKEN: "token",
			}),
		).toEqual({
			url: "libsql://lab.example",
			authToken: "token",
		});
	});

	it("throws when the runtime URL is missing", () => {
		expect(() => resolveDatabaseConfig({})).toThrow(/TURSO_DATABASE_URL/);
	});

	it("treats blank values as unset", () => {
		expect(() =>
			resolveDatabaseConfig({
				TURSO_DATABASE_URL: "   ",
				TURSO_AUTH_TOKEN: "token",
			}),
		).toThrow(/TURSO_DATABASE_URL/);
	});
});

describe("resolveTestDatabaseConfig", () => {
	it("returns explicit test credentials", () => {
		expect(
			resolveTestDatabaseConfig({
				TURSO_TEST_DATABASE_URL: "libsql://test.example",
				TURSO_TEST_AUTH_TOKEN: "test-token",
			}),
		).toEqual({
			url: "libsql://test.example",
			authToken: "test-token",
		});
	});

	it("does not fall back to production TURSO_* values", () => {
		expect(
			resolveTestDatabaseConfig({
				TURSO_DATABASE_URL: "libsql://prod.example",
				TURSO_AUTH_TOKEN: "prod-token",
			}),
		).toBeNull();
	});

	it("returns null when only one test value is present", () => {
		expect(
			resolveTestDatabaseConfig({
				TURSO_TEST_DATABASE_URL: "libsql://test.example",
			}),
		).toBeNull();
	});
});
