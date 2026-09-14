import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	assertProductionCustomDomain,
	readGeneratedRoutes,
} from "./assert-production-custom-domain";

function writeConfig(config: unknown): string {
	const configPath = join(mkdtempSync(join(tmpdir(), "lab-routes-")), "wrangler.json");
	writeFileSync(configPath, JSON.stringify(config));
	return configPath;
}

describe("readGeneratedRoutes", () => {
	it("treats an absent routes key as no routes", () => {
		expect(readGeneratedRoutes(writeConfig({ name: "phonaria-lab" }))).toEqual([]);
	});

	it("reads custom-domain route objects", () => {
		const configPath = writeConfig({
			name: "phonaria-lab",
			routes: [{ pattern: "phonaria-lab.rigos.dev", custom_domain: true }],
		});
		expect(readGeneratedRoutes(configPath)).toEqual([
			{ pattern: "phonaria-lab.rigos.dev", custom_domain: true },
		]);
	});

	it("rejects a non-array routes value", () => {
		expect(() => readGeneratedRoutes(writeConfig({ routes: "phonaria-lab.rigos.dev" }))).toThrow(
			/non-array routes/,
		);
	});
});

describe("assertProductionCustomDomain", () => {
	it("accepts only the production Lab custom domain", () => {
		expect(() =>
			assertProductionCustomDomain([{ pattern: "phonaria-lab.rigos.dev", custom_domain: true }]),
		).not.toThrow();
	});

	it("rejects a production build without the custom domain", () => {
		expect(() => assertProductionCustomDomain([])).toThrow(/must declare exactly/);
	});

	it("rejects wildcard and non-custom-domain routes", () => {
		expect(() => assertProductionCustomDomain(["phonaria-lab.rigos.dev/*"])).toThrow(
			/must declare exactly/,
		);
		expect(() =>
			assertProductionCustomDomain([{ pattern: "phonaria-lab.rigos.dev", custom_domain: false }]),
		).toThrow(/must declare exactly/);
	});

	it("rejects extra routes", () => {
		expect(() =>
			assertProductionCustomDomain([
				{ pattern: "phonaria-lab.rigos.dev", custom_domain: true },
				{ pattern: "other.rigos.dev", custom_domain: true },
			]),
		).toThrow(/other\.rigos\.dev/);
	});
});
