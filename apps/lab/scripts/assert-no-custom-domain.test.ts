import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertNoCustomDomain, readGeneratedRoutes } from "./assert-no-custom-domain";

function writeConfig(config: unknown): string {
	const path = join(mkdtempSync(join(tmpdir(), "lab-routes-")), "wrangler.json");
	writeFileSync(path, JSON.stringify(config));
	return path;
}

describe("readGeneratedRoutes", () => {
	it("treats an absent routes key as no routes", () => {
		expect(readGeneratedRoutes(writeConfig({ name: "phonaria-lab" }))).toEqual([]);
	});

	it("reads custom-domain route objects", () => {
		const path = writeConfig({
			name: "phonaria-lab",
			routes: [{ pattern: "phonaria-lab.rigos.dev", custom_domain: true }],
		});
		expect(readGeneratedRoutes(path)).toEqual([
			{ pattern: "phonaria-lab.rigos.dev", custom_domain: true },
		]);
	});

	it("rejects a non-array routes value rather than passing it through", () => {
		expect(() => readGeneratedRoutes(writeConfig({ routes: "phonaria-lab.rigos.dev" }))).toThrow(
			/non-array routes/,
		);
	});
});

describe("assertNoCustomDomain", () => {
	it("accepts a production build with no routes", () => {
		expect(() => assertNoCustomDomain([])).not.toThrow();
	});

	it("refuses a custom-domain route because deploying it would change DNS", () => {
		expect(() =>
			assertNoCustomDomain([{ pattern: "phonaria-lab.rigos.dev", custom_domain: true }]),
		).toThrow(/would create DNS records/);
	});

	it("names the offending route so the failure is actionable", () => {
		expect(() => assertNoCustomDomain(["phonaria-lab.rigos.dev/*"])).toThrow(
			/phonaria-lab\.rigos\.dev\/\*/,
		);
	});
});
