#!/usr/bin/env bun
/**
 * Stable staging origin for Lab Start.
 *
 * Prefer `LAB_START_STAGING_URL` when it is the real workers.dev host.
 * The wrangler default `https://phonaria-lab-staging.workers.dev` is a
 * placeholder and must be rewritten with the account subdomain.
 */
import { resolvePreviewOrigin } from "./resolve-preview-origin";

export const STAGING_WORKER_NAME = "phonaria-lab-staging";
export const PLACEHOLDER_STAGING_ORIGIN = "https://phonaria-lab-staging.workers.dev";

export function resolveStagingOrigin(override?: string, subdomain?: string): string {
	const trimmed = (override ?? "").trim().replace(/\/+$/, "");
	if (trimmed && trimmed !== PLACEHOLDER_STAGING_ORIGIN) {
		let parsed: URL;
		try {
			parsed = new URL(trimmed);
		} catch {
			throw new Error("LAB_START_STAGING_URL must be an absolute HTTPS URL.");
		}
		if (parsed.protocol !== "https:" || parsed.origin !== trimmed) {
			throw new Error("LAB_START_STAGING_URL must be an absolute HTTPS URL origin.");
		}
		return parsed.origin;
	}
	const resolved = resolvePreviewOrigin(STAGING_WORKER_NAME, subdomain);
	if (resolved === PLACEHOLDER_STAGING_ORIGIN) {
		throw new Error(
			"Set LAB_START_STAGING_URL to the account-scoped staging origin or set LAB_WORKERS_DEV_SUBDOMAIN to the Cloudflare account subdomain.",
		);
	}
	return resolved;
}

function runCli(): void {
	const [override, subdomain] = process.argv.slice(2);
	process.stdout.write(`${resolveStagingOrigin(override, subdomain)}\n`);
}

if (import.meta.main) {
	runCli();
}
