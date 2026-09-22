#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GENERATED_WRANGLER_JSON } from "./assert-generated-worker-name";

export const PRODUCTION_CUSTOM_DOMAINS = ["phonaria.rigos.dev", "phonaria-lab.rigos.dev"] as const;

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
	const remainingDomains = new Set<string>(PRODUCTION_CUSTOM_DOMAINS);
	const validRoutes =
		routes.length === PRODUCTION_CUSTOM_DOMAINS.length &&
		routes.every(
			(route) =>
				typeof route === "object" &&
				route.custom_domain === true &&
				typeof route.pattern === "string" &&
				remainingDomains.delete(route.pattern),
		);
	if (validRoutes && remainingDomains.size === 0) {
		return;
	}

	const actual = routes.length === 0 ? "none" : routes.map(describeRoute).join(", ");
	throw new Error(
		`Production must declare exactly ${PRODUCTION_CUSTOM_DOMAINS.join(", ")} as custom domains; found: ${actual}.`,
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
