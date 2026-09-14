#!/usr/bin/env bun
/**
 * Attaching a custom domain creates the DNS record, so a `routes` entry in the
 * flattened Wrangler config is the cutover. Refuse it until #206.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GENERATED_WRANGLER_JSON } from "./assert-generated-worker-name";

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

export function describeRoute(route: WranglerRoute): string {
	if (typeof route === "string") return route;
	return route.pattern ?? JSON.stringify(route);
}

export function assertNoCustomDomain(routes: WranglerRoute[]): void {
	if (routes.length === 0) return;
	throw new Error(
		`Generated Wrangler config declares routes: ${routes.map(describeRoute).join(", ")}. Deploying this would create DNS records and cut phonaria-lab.rigos.dev over to the Worker. Move route configuration to the #206 cutover.`,
	);
}

function runCli(): void {
	const [configPath] = process.argv.slice(2);
	const wranglerJsonPath = resolve(
		configPath ?? resolve(import.meta.dirname, "..", GENERATED_WRANGLER_JSON),
	);
	assertNoCustomDomain(readGeneratedRoutes(wranglerJsonPath));
	console.log(`No routes in ${wranglerJsonPath}; production deploy will not change DNS.`);
}

if (import.meta.main) runCli();
