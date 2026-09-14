import "server-only";

import { type Client, createClient, type InStatement } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { type DatabaseConfig, resolveDatabaseConfig } from "./config";
import * as schema from "./schema";

export type LabDatabase = LibSQLDatabase<typeof schema>;

export type LibsqlClientFactory = (config: { url: string; authToken?: string }) => Client;

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
	options: { readOnly?: boolean; createClient?: LibsqlClientFactory } = {},
): LabDatabase {
	const openClient = options.createClient ?? createClient;
	const client = openClient({
		url: config.url,
		authToken: config.authToken,
	});

	if (options.readOnly) {
		wrapReadOnly(client);
	}

	return drizzle(client, { schema });
}

let cached: { key: string; db: LabDatabase } | undefined;

function cacheKey(config: DatabaseConfig): string {
	return `${config.url}\0${config.authToken ?? ""}`;
}

/**
 * Lazily construct the default runtime database. Importing this module does
 * not read credentials or open a connection.
 */
export function getDb(explicit?: DatabaseConfig): LabDatabase {
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
