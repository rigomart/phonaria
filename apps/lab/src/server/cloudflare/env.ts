/**
 * Request-time Cloudflare Worker bindings.
 *
 * Import this module only from server functions, server routes, or other
 * request handlers. Do not initialize Turso or other clients at module load.
 */
import { env } from "cloudflare:workers";

export type LabWorkerEnv = {
	SITE_URL?: string;
	SITE_INDEXING_ENABLED?: string;
	FLAG_PRACTICE?: string;
	PUBLIC_BUCKET_URL?: string;
	TURSO_DATABASE_URL?: string;
	TURSO_AUTH_TOKEN?: string;
};

export function getWorkerEnv(): LabWorkerEnv {
	return env;
}

export function readWorkerString(
	bindings: LabWorkerEnv,
	name: keyof LabWorkerEnv,
): string | undefined {
	const value = bindings[name];
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed ? trimmed : undefined;
}

export function getWorkerString(name: keyof LabWorkerEnv): string | undefined {
	return readWorkerString(getWorkerEnv(), name);
}
