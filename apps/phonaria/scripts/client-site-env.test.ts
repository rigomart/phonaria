import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { clientSiteDefines, readWranglerVars } from "./client-site-env";

const wranglerConfig = resolve(import.meta.dirname, "../wrangler.jsonc");

describe("client site env", () => {
	it("bakes the build environment's values into the client", () => {
		expect(
			clientSiteDefines(
				{ SITE_URL: "https://pr-1.example.test", SITE_INDEXING_ENABLED: "0" },
				{ SITE_URL: "https://phonaria-preview.workers.dev", SITE_INDEXING_ENABLED: "1" },
			),
		).toEqual({
			"process.env.SITE_URL": '"https://pr-1.example.test"',
			"process.env.SITE_INDEXING_ENABLED": '"0"',
			"process.env.GOOGLE_SITE_VERIFICATION": '""',
		});
	});

	it("falls back to the Worker's vars, so a build without them still matches the Worker", () => {
		expect(clientSiteDefines({}, readWranglerVars(wranglerConfig, "production"))).toEqual({
			"process.env.SITE_URL": '"https://phonaria.rigos.dev"',
			"process.env.SITE_INDEXING_ENABLED": '"1"',
			"process.env.GOOGLE_SITE_VERIFICATION": '""',
		});
	});

	it("reads the top-level vars when no Cloudflare environment is named", () => {
		expect(readWranglerVars(wranglerConfig, undefined)).toMatchObject({
			SITE_URL: "http://localhost:3000",
			SITE_INDEXING_ENABLED: "0",
		});
	});

	it("rejects an unknown Cloudflare environment", () => {
		expect(() => readWranglerVars(wranglerConfig, "nope")).toThrow(/no "nope" environment/);
	});
});
