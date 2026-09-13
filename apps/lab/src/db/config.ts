import "server-only";

export type DatabaseConfig = {
	url: string;
	authToken?: string;
};

export type DatabaseEnv = Record<string, string | undefined>;

function readEnvValue(value: string | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

/**
 * Production/runtime Turso credentials. Call only when a server-side request
 * needs a database, not at module import time.
 */
export function resolveDatabaseConfig(env: DatabaseEnv = process.env): DatabaseConfig {
	const url = readEnvValue(env.TURSO_DATABASE_URL);
	if (!url) {
		throw new Error("TURSO_DATABASE_URL environment variable is not set");
	}

	return {
		url,
		authToken: readEnvValue(env.TURSO_AUTH_TOKEN),
	};
}

/**
 * Explicit test credentials. Never falls back to production `TURSO_*` values.
 */
export function resolveTestDatabaseConfig(env: DatabaseEnv = process.env): DatabaseConfig | null {
	const url = readEnvValue(env.TURSO_TEST_DATABASE_URL);
	const authToken = readEnvValue(env.TURSO_TEST_AUTH_TOKEN);
	if (!url || !authToken) {
		return null;
	}

	return { url, authToken };
}
