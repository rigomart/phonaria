#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GENERATED_WRANGLER_JSON } from "./assert-generated-worker-name";

export const PRODUCTION_CUSTOM_DOMAIN = "phonaria-lab.rigos.dev";

export type WranglerRoute = string | { pattern?: string; custom_domain?: boolean };

export function readGeneratedRoutes(wranglerJsonPath: string): WranglerRoute[] {
	const parsed: unknown = JSON.parse(readFileSync(wranglerJsonPath, "utf8"));
	if (typeof parsed !== "object" || parsed === null) {
		throw new Error(`Generated Wrangler config at ${wranglerJsonPath} is not an object.`);
	}
	if (!("routes" in parsed) || parsed.routes === undefined) return [];
	if (!Array.isArray(parsed.routes)) {
		throw new Error(`Generated Wrangler config at ${wranglerJsonPath} has a non-array routes.`);
	}
	return parsed.routes as WranglerRoute[];
}

function describeRoute(route: WranglerRoute): string {
	if (typeof route === "string") return route;
	return route.pattern ?? JSON.stringify(route);
}

export function assertProductionCustomDomain(routes: WranglerRoute[]): void {
	const expected = routes.length === 1 && routes[0];
	if (
		typeof expected === "object" &&
		expected.pattern === PRODUCTION_CUSTOM_DOMAIN &&
		expected.custom_domain === true
	) {
		return;
	}

	const actual = routes.length === 0 ? "none" : routes.map(describeRoute).join(", ");
	throw new Error(
		`Production must declare exactly ${PRODUCTION_CUSTOM_DOMAIN} as a custom domain; found: ${actual}.`,
	);
}

function runCli(): void {
	const [configPath] = process.argv.slice(2);
	const wranglerJsonPath = resolve(
		configPath ?? resolve(import.meta.dirname, "..", GENERATED_WRANGLER_JSON),
	);
	assertProductionCustomDomain(readGeneratedRoutes(wranglerJsonPath));
	console.log(`Production custom domain verified in ${wranglerJsonPath}.`);
}

if (import.meta.main) runCli();
