/**
 * Server-only exports for the transcription service.
 * DO NOT import this file from browser/client code.
 *
 * This file exports database-related functionality that should only
 * be used in server-side contexts (API routes, server actions, etc.).
 */

// Re-export everything that requires server-side context
export {
	createDbClient,
	createDbClientFromEnv,
	getDefaultDbClient,
	resetDefaultDbClient,
	type DbClient,
	type DbConfig,
} from "./db/client";

export { lookupWords, type WordLookupResult } from "./db/repository";

export { words } from "./db/schema";

/**
 * Mark this module as server-only for bundlers that support it.
 * This will cause a build error if imported from client code.
 */
if (typeof window !== "undefined") {
	throw new Error(
		"@phonaria/transcription-service/server cannot be imported in browser code. " +
			"Use @phonaria/transcription-service instead for client-safe exports.",
	);
}
