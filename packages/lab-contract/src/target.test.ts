import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extraHttpHeaders, listTargetNames, loadTargetFromEnv, TargetConfigError } from "./target";

const originalEnv = { ...process.env };

afterEach(() => {
	for (const key of Object.keys(process.env)) {
		if (!(key in originalEnv)) delete process.env[key];
	}
	Object.assign(process.env, originalEnv);
	delete process.env.LAB_CONTRACT_TARGET;
	delete process.env.LAB_CONTRACT_BASE_URL;
	delete process.env.LAB_CONTRACT_CANONICAL_ORIGIN;
	delete process.env.LAB_CONTRACT_START_LOCAL;
	delete process.env.CF_ACCESS_CLIENT_ID;
	delete process.env.CF_ACCESS_CLIENT_SECRET;
});

describe("loadTargetFromEnv", () => {
	it("defaults to the public Cloudflare production profile", () => {
		const target = loadTargetFromEnv({});
		expect(target.name).toBe("cloudflare-production");
		expect(target.baseUrl).toBe("https://phonaria-lab.rigos.dev");
		expect(target.practiceEnabled).toBe(false);
		expect(target.indexingEnabled).toBe(false);
		expect(target.capabilities.practiceSession).toBe(false);
		expect(target.skipReasons.practiceSession).toMatch(/Practice stays disabled/);
	});

	it("rejects unknown target names", () => {
		expect(() => loadTargetFromEnv({ LAB_CONTRACT_TARGET: "not-a-target" })).toThrow(
			TargetConfigError,
		);
	});

	it("requires a base URL override for staging", () => {
		expect(() => loadTargetFromEnv({ LAB_CONTRACT_TARGET: "cloudflare-staging" })).toThrow(
			/LAB_CONTRACT_BASE_URL/,
		);
	});

	it("applies base URL and canonical overrides", () => {
		const target = loadTargetFromEnv({
			LAB_CONTRACT_TARGET: "cloudflare-staging",
			LAB_CONTRACT_BASE_URL: "https://preview.example.test/",
			LAB_CONTRACT_CANONICAL_ORIGIN: "https://preview.example.test/",
			CF_ACCESS_CLIENT_ID: "id",
			CF_ACCESS_CLIENT_SECRET: "secret",
		});
		expect(target.baseUrl).toBe("https://preview.example.test");
		expect(target.expectedCanonicalOrigin).toBe("https://preview.example.test");
		expect(target.practiceEnabled).toBe(true);
	});

	it("lists the shipped target profiles", () => {
		expect(listTargetNames()).toEqual(["cloudflare-production", "cloudflare-staging", "local"]);
	});

	it("fails when a disabled capability has no skip reason", () => {
		const dir = mkdtempSync(join(tmpdir(), "lab-contract-"));
		writeFileSync(
			join(dir, "broken.json"),
			JSON.stringify({
				name: "broken",
				baseUrl: "https://example.test",
				expectedCanonicalOrigin: "https://example.test",
				practiceEnabled: false,
				indexingEnabled: false,
				bucketAssetsAvailable: true,
				authentication: { type: "none" },
				capabilities: {
					controlledServiceFailure: false,
					controlledWordlistFailure: false,
					practiceSession: false,
				},
				skipReasons: {},
			}),
		);

		expect(() => loadTargetFromEnv({ LAB_CONTRACT_TARGET: "broken" }, dir)).toThrow(
			/without skipReasons/,
		);
	});
});

describe("extraHttpHeaders", () => {
	it("returns Cloudflare Access headers when credentials are present", () => {
		const target = loadTargetFromEnv({
			LAB_CONTRACT_TARGET: "cloudflare-staging",
			LAB_CONTRACT_BASE_URL: "https://preview.example.test",
		});
		expect(
			extraHttpHeaders(target, {
				CF_ACCESS_CLIENT_ID: "id",
				CF_ACCESS_CLIENT_SECRET: "secret",
			}),
		).toEqual({
			"CF-Access-Client-Id": "id",
			"CF-Access-Client-Secret": "secret",
		});
	});

	it("fails closed when Access credentials are missing", () => {
		const target = loadTargetFromEnv({
			LAB_CONTRACT_TARGET: "cloudflare-staging",
			LAB_CONTRACT_BASE_URL: "https://preview.example.test",
		});
		expect(() => extraHttpHeaders(target, {})).toThrow(/Cloudflare Access credentials/);
	});
});
