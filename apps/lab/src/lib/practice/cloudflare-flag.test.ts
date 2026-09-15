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

	it("sends Practice routes to the Worker first", () => {
		expect(wrangler).toContain('"/practice"');
		expect(wrangler).toContain('"/practice/*"');
	});

	it("attaches only the production environment to the public Lab domain", () => {
		const productionStart = wrangler.indexOf('"production": {');
		expect(productionStart).toBeGreaterThan(-1);
		const productionConfig = wrangler.slice(productionStart);
		// The custom domain is production's only origin; the workers.dev origin
		// existed for the cutover window and is no longer published.
		expect(productionConfig).not.toContain('"workers_dev"');
		expect(productionConfig).toContain(
			'"routes": [{ "pattern": "phonaria-lab.rigos.dev", "custom_domain": true }]',
		);
		expect(wrangler.slice(0, productionStart)).not.toContain('"custom_domain": true');
	});
});
