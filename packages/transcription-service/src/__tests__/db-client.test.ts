import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	TranscriptionConfigError,
	type TranscriptionDatabaseError,
} from "../contract";
import {
	createDbClient,
	createDbClientFromEnv,
	getDefaultDbClient,
	resetDefaultDbClient,
} from "../db/client";

describe("lazy database configuration", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		resetDefaultDbClient();
		// Clear env vars
		delete process.env.TURSO_DATABASE_URL;
		delete process.env.TURSO_AUTH_TOKEN;
	});

	afterEach(() => {
		process.env = originalEnv;
		resetDefaultDbClient();
	});

	it("does not throw at import time when env vars are missing", () => {
		// This test verifies that importing the module doesn't throw
		expect(() => {
			// biome-ignore lint/correctness/noUnusedVariables: Testing import side effects
			const { createDbClient } = require("../db/client");
		}).not.toThrow();
	});

	it("throws only when creating a client with missing URL", () => {
		expect(() => {
			createDbClient({ url: "" });
		}).toThrow(TranscriptionConfigError);
	});

	it("throws only when accessing default client without env vars", () => {
		expect(() => {
			getDefaultDbClient();
		}).toThrow(TranscriptionConfigError);
	});

	it("creates client successfully with valid config", () => {
		const client = createDbClient({
			url: "file:test.db",
			authToken: undefined,
		});

		expect(client).toBeDefined();
		expect(client.select).toBeDefined();
	});

	it("creates client from env vars when set", () => {
		process.env.TURSO_DATABASE_URL = "file:test.db";

		const client = createDbClientFromEnv();

		expect(client).toBeDefined();
	});

	it("caches the default client across calls", () => {
		process.env.TURSO_DATABASE_URL = "file:test.db";

		const client1 = getDefaultDbClient();
		const client2 = getDefaultDbClient();

		expect(client1).toBe(client2);
	});

	it("resets default client when requested", () => {
		process.env.TURSO_DATABASE_URL = "file:test.db";

		const client1 = getDefaultDbClient();
		resetDefaultDbClient();
		const client2 = getDefaultDbClient();

		expect(client1).not.toBe(client2);
	});

	it("provides clear error message when URL is missing", () => {
		try {
			createDbClient({ url: "" });
			expect.fail("Should have thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(TranscriptionConfigError);
			expect((error as TranscriptionConfigError).message).toContain("URL");
		}
	});

	it("provides clear error message when env var is missing", () => {
		delete process.env.TURSO_DATABASE_URL;

		try {
			getDefaultDbClient();
			expect.fail("Should have thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(TranscriptionConfigError);
			expect((error as TranscriptionConfigError).message).toContain(
				"TURSO_DATABASE_URL",
			);
		}
	});
});

describe("createDbClient", () => {
	it("accepts URL without auth token", () => {
		const client = createDbClient({
			url: "file:test.db",
		});

		expect(client).toBeDefined();
	});

	it("accepts URL with auth token", () => {
		const client = createDbClient({
			url: "libsql://test.turso.io",
			authToken: "test-token",
		});

		expect(client).toBeDefined();
	});
});
