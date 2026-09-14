#!/usr/bin/env bun
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { GENERATED_WRANGLER_JSON } from "./assert-generated-worker-name";
import {
	assertProductionCustomDomain,
	readGeneratedRoutes,
} from "./assert-production-custom-domain";

export type ProductionDeploymentTarget = "worker-origin" | "public-domain";

function isProductionDeploymentTarget(value: string): value is ProductionDeploymentTarget {
	return value === "worker-origin" || value === "public-domain";
}

export function prepareProductionDeployment(configPath: string, target: string): void {
	if (!isProductionDeploymentTarget(target)) {
		throw new Error(`Unknown production deployment target: ${target}`);
	}

	assertProductionCustomDomain(readGeneratedRoutes(configPath));
	if (target === "public-domain") return;

	const config: Record<string, unknown> = JSON.parse(readFileSync(configPath, "utf8"));
	delete config.routes;
	writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

function runCli(): void {
	const [target, configPath] = process.argv.slice(2);
	if (!target) {
		throw new Error("Usage: prepare-production-deployment.ts <worker-origin|public-domain>");
	}
	const wranglerJsonPath = resolve(
		configPath ?? resolve(import.meta.dirname, "..", GENERATED_WRANGLER_JSON),
	);
	prepareProductionDeployment(wranglerJsonPath, target);
	console.log(`Prepared ${target} deployment in ${wranglerJsonPath}.`);
}

if (import.meta.main) runCli();
