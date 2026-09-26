import { describe, expect, it } from "vitest";
import { PLACEHOLDER_STAGING_ORIGIN, resolveStagingOrigin } from "./resolve-staging-origin";

describe("resolveStagingOrigin", () => {
	it("keeps an explicit account-scoped staging URL", () => {
		expect(
			resolveStagingOrigin("https://phonaria-staging.mirdor-dev.workers.dev", "mirdor-dev"),
		).toBe("https://phonaria-staging.mirdor-dev.workers.dev");
	});

	it("rejects an origin for the retired staging Worker", () => {
		expect(() =>
			resolveStagingOrigin("https://phonaria-lab-staging.mirdor-dev.workers.dev", "mirdor-dev"),
		).toThrow(/phonaria-staging\.mirdor-dev\.workers\.dev/);
	});

	it.each([
		"phonaria-staging.mirdor-dev.workers.dev",
		"http://staging.example.com",
	])("rejects an invalid explicit staging URL: %s", (override) => {
		expect(() => resolveStagingOrigin(override, "mirdor-dev")).toThrow(/absolute HTTPS URL/);
	});

	it("rewrites the wrangler placeholder with the account subdomain", () => {
		expect(resolveStagingOrigin(PLACEHOLDER_STAGING_ORIGIN, "mirdor-dev")).toBe(
			"https://phonaria-staging.mirdor-dev.workers.dev",
		);
		expect(resolveStagingOrigin(undefined, "mirdor-dev.workers.dev")).toBe(
			"https://phonaria-staging.mirdor-dev.workers.dev",
		);
	});

	it("rejects a deployment origin that lacks the account subdomain", () => {
		expect(() => resolveStagingOrigin()).toThrow(/STAGING_URL/);
		expect(() => resolveStagingOrigin("  ")).toThrow(/WORKERS_DEV_SUBDOMAIN/);
	});
});
