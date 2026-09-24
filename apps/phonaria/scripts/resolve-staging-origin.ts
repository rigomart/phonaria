#!/usr/bin/env bun
/**
 * Stable staging origin for the application.
 *
 * Prefer `STAGING_URL` (or `LAB_START_STAGING_URL`) when it is the real
 * workers.dev host.
 * The wrangler default `https://phonaria-staging.workers.dev` is a
 * placeholder and must be rewritten with the account subdomain.
 */
import { readPreferredEnv } from "./preferred-env";
import { resolvePreviewOrigin } from "./resolve-preview-origin";

export const STAGING_WORKER_NAME = "phonaria-staging";
export const PLACEHOLDER_STAGING_ORIGIN = "https://phonaria-staging.workers.dev";

export function resolveStagingOrigin(override?: string, subdomain?: string): string {
	const trimmed = (override ?? "").trim().replace(/\/+$/, "");
	if (trimmed && trimmed !== PLACEHOLDER_STAGING_ORIGIN) {
		let parsed: URL;
		try {
			parsed = new URL(trimmed);
		} catch {
			throw new Error("STAGING_URL (or LAB_START_STAGING_URL) must be an absolute HTTPS URL.");
		}
		if (parsed.protocol !== "https:" || parsed.origin !== trimmed) {
			throw new Error(
				"STAGING_URL (or LAB_START_STAGING_URL) must be an absolute HTTPS URL origin.",
			);
		}
		return parsed.origin;
	}
	const resolved = resolvePreviewOrigin(STAGING_WORKER_NAME, subdomain);
	if (resolved === PLACEHOLDER_STAGING_ORIGIN) {
		throw new Error(
			"Set STAGING_URL or LAB_START_STAGING_URL to the account-scoped staging origin, or set WORKERS_DEV_SUBDOMAIN or LAB_WORKERS_DEV_SUBDOMAIN to the Cloudflare account subdomain.",
		);
	}
	return resolved;
}

function runCli(): void {
	const [overrideArg, subdomainArg] = process.argv.slice(2);
	const override =
		overrideArg || readPreferredEnv(process.env, "STAGING_URL", "LAB_START_STAGING_URL");
	const subdomain =
		subdomainArg ||
		readPreferredEnv(process.env, "WORKERS_DEV_SUBDOMAIN", "LAB_WORKERS_DEV_SUBDOMAIN");
	process.stdout.write(`${resolveStagingOrigin(override, subdomain)}\n`);
}

if (import.meta.main) {
	runCli();
}
