import { afterEach, describe, expect, it, vi } from "vitest";
import { getGoogleSiteVerification, getSiteUrl, isIndexingEnabled } from "./site";

afterEach(() => {
	delete process.env.SITE_URL;
	delete process.env.SITE_INDEXING_ENABLED;
	delete process.env.GOOGLE_SITE_VERIFICATION;
	// NODE_ENV is typed read-only, so production is simulated with stubEnv.
	vi.unstubAllEnvs();
});

describe("getSiteUrl", () => {
	it("returns the configured origin", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		expect(getSiteUrl()).toBe("https://phonaria.rigos.dev");
	});

	it("strips a trailing slash", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev/";
		expect(getSiteUrl()).toBe("https://phonaria.rigos.dev");
	});

	it("falls back to localhost outside production", () => {
		expect(getSiteUrl()).toBe("http://localhost:3000");
		process.env.SITE_URL = "";
		expect(getSiteUrl()).toBe("http://localhost:3000");
	});

	it("throws in production when unset", () => {
		vi.stubEnv("NODE_ENV", "production");
		expect(() => getSiteUrl()).toThrow(/SITE_URL/);
	});

	it("throws when the value is not an absolute URL", () => {
		process.env.SITE_URL = "phonaria.rigos.dev";
		expect(() => getSiteUrl()).toThrow(/not an absolute URL/);
	});

	it("uses the configured origin in production", () => {
		vi.stubEnv("NODE_ENV", "production");
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		expect(getSiteUrl()).toBe("https://phonaria.rigos.dev");
	});
});

describe("isIndexingEnabled", () => {
	it("treats '1' and 'true' (any case) as enabled", () => {
		for (const value of ["1", "true", "TRUE", "True"]) {
			process.env.SITE_INDEXING_ENABLED = value;
			expect(isIndexingEnabled()).toBe(true);
		}
	});

	it("defaults to off when unset, empty, or another value", () => {
		expect(isIndexingEnabled()).toBe(false);
		for (const value of ["", "0", "false", "yes"]) {
			process.env.SITE_INDEXING_ENABLED = value;
			expect(isIndexingEnabled()).toBe(false);
		}
	});

	it("stays independent of the site URL", () => {
		process.env.SITE_URL = "https://phonaria.rigos.dev";
		expect(isIndexingEnabled()).toBe(false);
	});
});

describe("getGoogleSiteVerification", () => {
	it("returns the configured token", () => {
		process.env.GOOGLE_SITE_VERIFICATION = "token-123";
		expect(getGoogleSiteVerification()).toBe("token-123");
	});

	it("is undefined when unset or empty", () => {
		expect(getGoogleSiteVerification()).toBeUndefined();
		process.env.GOOGLE_SITE_VERIFICATION = "";
		expect(getGoogleSiteVerification()).toBeUndefined();
	});
});
