import { type Client, createClient, type InStatement } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { type DatabaseConfig, resolveDatabaseConfig } from "./config";
import * as schema from "./schema";

export type AppDatabase = LibSQLDatabase<typeof schema>;

/** The part of `fetch` the libsql HTTP client calls. */
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type LibsqlClientFactory = (config: {
	url: string;
	authToken?: string;
	fetch?: FetchLike;
}) => Client;

/**
 * How long one Turso HTTP request may take before it is aborted. Without a
 * limit a hung request keeps the transcription input disabled for good; the
 * abort surfaces as a retryable lookup failure instead.
 */
export const TURSO_REQUEST_TIMEOUT_MS = 5000;

/**
 * `fetch` that gives up after `timeoutMs`, keeping any signal the caller
 * passed. The libsql HTTP client calls it with a `Request`, so that request's
 * own signal counts too.
 */
export function createTimeoutFetch(
	timeoutMs: number,
	baseFetch: FetchLike = (input, init) => globalThis.fetch(input, init),
): FetchLike {
	return (input, init) => {
		const incoming = init?.signal ?? (input instanceof Request ? input.signal : undefined);
		const timeout = AbortSignal.timeout(timeoutMs);
		const signal = incoming ? AbortSignal.any([incoming, timeout]) : timeout;
		return baseFetch(input, { ...init, signal });
	};
}

function statementSql(stmt: InStatement): string {
	return typeof stmt === "string" ? stmt : stmt.sql;
}

function isReadOnlySql(sql: string): boolean {
	const normalized = sql
		.trim()
		.replace(/^\(\s*/, "")
		.toLowerCase();
	return (
		normalized.startsWith("select") ||
		normalized.startsWith("pragma") ||
		normalized.startsWith("with") ||
		normalized.startsWith("explain")
	);
}

function rejectWrite(): Promise<never> {
	return Promise.reject(new Error("Write rejected: this database client is read-only"));
}

function wrapReadOnly(client: Client): void {
	const execute = client.execute.bind(client);
	const batch = client.batch.bind(client);

	client.execute = ((stmt: InStatement) => {
		if (!isReadOnlySql(statementSql(stmt))) {
			return rejectWrite();
		}
		return execute(stmt);
	}) as Client["execute"];

	client.batch = ((stmts: InStatement[], mode?: Parameters<Client["batch"]>[1]) => {
		for (const stmt of stmts) {
			if (!isReadOnlySql(statementSql(stmt))) {
				return rejectWrite();
			}
		}
		return batch(stmts, mode);
	}) as Client["batch"];

	client.migrate = (() => rejectWrite()) as Client["migrate"];
	client.transaction = (() => rejectWrite()) as Client["transaction"];
}

export function createDatabase(
	config: DatabaseConfig,
	options: {
		readOnly?: boolean;
		createClient?: LibsqlClientFactory;
		requestTimeoutMs?: number;
	} = {},
): AppDatabase {
	const openClient = options.createClient ?? createClient;
	const client = openClient({
		url: config.url,
		authToken: config.authToken,
		// Only the HTTP transport (the Worker's `@libsql/client/web`) uses it.
		fetch: createTimeoutFetch(options.requestTimeoutMs ?? TURSO_REQUEST_TIMEOUT_MS),
	});

	if (options.readOnly) {
		wrapReadOnly(client);
	}

	return drizzle(client, { schema });
}

let cached: { key: string; db: AppDatabase } | undefined;

function cacheKey(config: DatabaseConfig): string {
	return `${config.url}\0${config.authToken ?? ""}`;
}

/**
 * Lazily construct the default runtime database. Importing this module does
 * not read credentials or open a connection.
 */
export function getDb(explicit?: DatabaseConfig): AppDatabase {
	const config = explicit ?? resolveDatabaseConfig();
	const key = cacheKey(config);
	if (cached?.key === key) {
		return cached.db;
	}

	const db = createDatabase(config);
	cached = { key, db };
	return db;
}

export function resetDatabaseCache(): void {
	cached = undefined;
}
