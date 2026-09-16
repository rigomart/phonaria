import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const wrangler = readFileSync(resolve(import.meta.dirname, "../../../wrangler.jsonc"), "utf8");

function envVarsBlock(envName: string): string {
	const marker = `"${envName}": {`;
	const start = wrangler.indexOf(marker);
	expect(start, `${envName} environment`).toBeGreaterThan(-1);
	const varsStart = wrangler.indexOf('"vars": {', start);
	expect(varsStart, `${envName} vars`).toBeGreaterThan(start);
	const varsEnd = wrangler.indexOf("}", varsStart);
	return wrangler.slice(varsStart, varsEnd);
}

describe("Cloudflare Practice flag", () => {
	it("enables Practice on staging and preview and keeps production off", () => {
		expect(envVarsBlock("staging")).toContain('"FLAG_PRACTICE": "1"');
		expect(envVarsBlock("preview")).toContain('"FLAG_PRACTICE": "1"');
		expect(envVarsBlock("production")).toContain('"FLAG_PRACTICE": "0"');
	});

	it("sends every application and legacy document route to the Worker first", () => {
		expect(wrangler).not.toContain('"run_worker_first": true');
		for (const route of [
			"/",
			"/credits",
			"/credits/",
			"/ipa-chart",
			"/ipa-chart/*",
			"/practice",
			"/practice/*",
			"/robots.txt",
			"/sitemap.xml",
			"/en",
			"/en/*",
			"/es",
			"/es/*",
		]) {
			expect(wrangler, route).toContain(`"${route}"`);
		}
	});

	it("attaches only production to the main and legacy redirect domains", () => {
		const productionStart = wrangler.indexOf('"production": {');
		expect(productionStart).toBeGreaterThan(-1);
		const productionConfig = wrangler.slice(productionStart);
		// The custom domains are production's only origins; the workers.dev origin
		// existed for the earlier cutover window and is no longer published.
		expect(productionConfig).not.toContain('"workers_dev"');
		expect(productionConfig).toContain(
			'{ "pattern": "phonaria.rigos.dev", "custom_domain": true }',
		);
		expect(productionConfig).toContain(
			'{ "pattern": "phonaria-lab.rigos.dev", "custom_domain": true }',
		);
		expect(wrangler.slice(0, productionStart)).not.toContain('"custom_domain": true');
	});

	it("publishes the final indexed site identity in production", () => {
		const productionStart = wrangler.indexOf('"production": {');
		const productionConfig = wrangler.slice(productionStart);
		expect(productionConfig).toContain('"SITE_URL": "https://phonaria.rigos.dev"');
		expect(productionConfig).toContain('"SITE_INDEXING_ENABLED": "1"');
	});
});
