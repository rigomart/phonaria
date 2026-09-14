import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { prepareProductionDeployment } from "./prepare-production-deployment";

const productionRoute = { pattern: "phonaria-lab.rigos.dev", custom_domain: true };

function writeConfig(config: unknown): string {
	const configPath = join(mkdtempSync(join(tmpdir(), "lab-production-")), "wrangler.json");
	writeFileSync(configPath, JSON.stringify(config));
	return configPath;
}

function readConfig(configPath: string): Record<string, unknown> {
	return JSON.parse(readFileSync(configPath, "utf8"));
}

describe("prepareProductionDeployment", () => {
	it("preserves the checked-in custom domain for a public-domain deployment", () => {
		const configPath = writeConfig({ name: "phonaria-lab", routes: [productionRoute] });

		prepareProductionDeployment(configPath, "public-domain");

		expect(readConfig(configPath).routes).toEqual([productionRoute]);
	});

	it("removes the custom domain only from the worker-origin deploy artifact", () => {
		const configPath = writeConfig({
			name: "phonaria-lab",
			workers_dev: true,
			routes: [productionRoute],
		});

		prepareProductionDeployment(configPath, "worker-origin");

		expect(readConfig(configPath)).toEqual({ name: "phonaria-lab", workers_dev: true });
	});

	it("refuses to mutate an unexpected route configuration", () => {
		const configPath = writeConfig({
			name: "phonaria-lab",
			routes: [{ pattern: "other.rigos.dev", custom_domain: true }],
		});

		expect(() => prepareProductionDeployment(configPath, "worker-origin")).toThrow(
			/must declare exactly/,
		);
	});

	it("rejects unknown deployment targets", () => {
		const configPath = writeConfig({ name: "phonaria-lab", routes: [productionRoute] });

		expect(() => prepareProductionDeployment(configPath, "preview")).toThrow(
			/Unknown production deployment target/,
		);
	});
});
