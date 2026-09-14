import { describe, expect, it } from "vitest";
import { PLACEHOLDER_STAGING_ORIGIN, resolveStagingOrigin } from "./resolve-staging-origin";

describe("resolveStagingOrigin", () => {
	it("keeps an explicit account-scoped staging URL", () => {
		expect(
			resolveStagingOrigin("https://phonaria-lab-staging.mirdor-dev.workers.dev", "mirdor-dev"),
		).toBe("https://phonaria-lab-staging.mirdor-dev.workers.dev");
	});

	it("rewrites the wrangler placeholder with the account subdomain", () => {
		expect(resolveStagingOrigin(PLACEHOLDER_STAGING_ORIGIN, "mirdor-dev")).toBe(
			"https://phonaria-lab-staging.mirdor-dev.workers.dev",
		);
		expect(resolveStagingOrigin(undefined, "mirdor-dev.workers.dev")).toBe(
			"https://phonaria-lab-staging.mirdor-dev.workers.dev",
		);
	});

	it("falls back to workers.dev when no override or subdomain is set", () => {
		expect(resolveStagingOrigin()).toBe(PLACEHOLDER_STAGING_ORIGIN);
		expect(resolveStagingOrigin("  ")).toBe(PLACEHOLDER_STAGING_ORIGIN);
	});
});
