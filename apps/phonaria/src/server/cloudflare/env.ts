/**
 * Request-time Cloudflare Worker bindings.
 *
 * Import this module only from server functions, server routes, or other
 * request handlers. Do not initialize Turso or other clients at module load.
 */
import { env } from "cloudflare:workers";

export type WorkerRateLimit = {
	limit(options: { key: string }): Promise<{ success: boolean }>;
};

export type WorkerEnv = {
	SITE_URL?: string;
	SITE_INDEXING_ENABLED?: string;
	FLAG_PRACTICE?: string;
	PUBLIC_BUCKET_URL?: string;
	TURSO_DATABASE_URL?: string;
	TURSO_AUTH_TOKEN?: string;
	OPENROUTER_API_KEY?: string;
	TRANSCRIPTION_RATE_LIMIT: WorkerRateLimit;
	DEFINITION_RATE_LIMIT: WorkerRateLimit;
	SPELLING_CONTEXT_RATE_LIMIT: WorkerRateLimit;
};

export function getWorkerEnv(): WorkerEnv {
	return env;
}

export function readWorkerString(bindings: WorkerEnv, name: keyof WorkerEnv): string | undefined {
	const value = bindings[name];
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed ? trimmed : undefined;
}

export function getWorkerString(name: keyof WorkerEnv): string | undefined {
	return readWorkerString(getWorkerEnv(), name);
}
