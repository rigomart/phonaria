#!/usr/bin/env bun
/**
 * Stable staging origin for the application.
 *
 * Use `STAGING_URL` when it is the real workers.dev host.
 * The wrangler default `https://phonaria-staging.workers.dev` is a
 * placeholder and must be rewritten with the account subdomain.
 */
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
			throw new Error("STAGING_URL must be an absolute HTTPS URL.");
		}
		if (parsed.protocol !== "https:" || parsed.origin !== trimmed) {
			throw new Error("STAGING_URL must be an absolute HTTPS URL origin.");
		}
		const expected = resolvePreviewOrigin(STAGING_WORKER_NAME, subdomain);
		if (
			!parsed.hostname.startsWith(`${STAGING_WORKER_NAME}.`) ||
			!parsed.hostname.endsWith(".workers.dev") ||
			(expected !== PLACEHOLDER_STAGING_ORIGIN && parsed.origin !== expected)
		) {
			throw new Error(`STAGING_URL must match the deployed staging Worker origin: ${expected}.`);
		}
		return parsed.origin;
	}
	const resolved = resolvePreviewOrigin(STAGING_WORKER_NAME, subdomain);
	if (resolved === PLACEHOLDER_STAGING_ORIGIN) {
		throw new Error(
			"Set STAGING_URL to the account-scoped staging origin, or set WORKERS_DEV_SUBDOMAIN to the Cloudflare account subdomain.",
		);
	}
	return resolved;
}

function runCli(): void {
	const [overrideArg, subdomainArg] = process.argv.slice(2);
	const override = overrideArg || process.env.STAGING_URL;
	const subdomain = subdomainArg || process.env.WORKERS_DEV_SUBDOMAIN;
	process.stdout.write(`${resolveStagingOrigin(override, subdomain)}\n`);
}

if (import.meta.main) {
	runCli();
}
