import { createClient as createLibsqlClient } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import { TranscriptionConfigError } from "../contract";
import * as schema from "./schema";

export interface DbConfig {
	url: string;
	authToken?: string;
}

export type DbClient = LibSQLDatabase<typeof schema>;

/**
 * Create a database client with the provided configuration.
 * This function does NOT throw at import time - it only throws when called
 * without proper configuration.
 *
 * @throws {TranscriptionConfigError} If the configuration is invalid
 */
export function createDbClient(config: DbConfig): DbClient {
	if (!config.url) {
		throw new TranscriptionConfigError(
			"Database URL is required but was not provided",
		);
	}

	const client = createLibsqlClient({
		url: config.url,
		authToken: config.authToken,
	});

	return drizzle(client, { schema });
}

/**
 * Create a database client from environment variables.
 * Useful for production deployments where config comes from env.
 *
 * @throws {TranscriptionConfigError} If required environment variables are missing
 */
export function createDbClientFromEnv(): DbClient {
	const url = process.env.TURSO_DATABASE_URL;
	const authToken = process.env.TURSO_AUTH_TOKEN;

	if (!url) {
		throw new TranscriptionConfigError(
			"TURSO_DATABASE_URL environment variable is not set",
		);
	}

	return createDbClient({ url, authToken });
}

/**
 * Singleton instance for the default database client.
 * Only initialized when first accessed via getDefaultDbClient().
 */
let defaultDbClient: DbClient | null = null;

/**
 * Get or create the default database client from environment variables.
 * This is lazy - the client is only created on first access.
 *
 * @throws {TranscriptionConfigError} If environment variables are missing
 */
export function getDefaultDbClient(): DbClient {
	if (!defaultDbClient) {
		defaultDbClient = createDbClientFromEnv();
	}
	return defaultDbClient;
}

/**
 * Reset the default client (useful for testing).
 */
export function resetDefaultDbClient(): void {
	defaultDbClient = null;
}
