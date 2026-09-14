import "server-only";

import { type DatabaseConfig, type DatabaseEnv, resolveDatabaseConfig } from "@/db/config";
import { createDatabase, type LabDatabase, type LibsqlClientFactory } from "@/db/drizzle";
import { processWords as defaultProcessWords } from "@/lib/g2p/service";
import type { TranscriptionWordsOutput } from "@/lib/transcription/contract";
import { TranscriptionError, transcribeWords } from "@/lib/transcription/service";
import { logWorkerEvent } from "@/server/cloudflare/log";

export type TranscribeOnWorkerDependencies = {
	createClient?: LibsqlClientFactory;
	openDatabase?: (config: DatabaseConfig) => LabDatabase;
	processWords?: typeof defaultProcessWords;
	log?: typeof logWorkerEvent;
};

function openWorkerDatabase(
	config: DatabaseConfig,
	dependencies: TranscribeOnWorkerDependencies,
): LabDatabase {
	if (dependencies.openDatabase) {
		return dependencies.openDatabase(config);
	}

	return createDatabase(config, {
		readOnly: true,
		createClient: dependencies.createClient,
	});
}

/**
 * Framework-neutral Worker handler. Resolves Turso credentials from the
 * request-time env, opens a read-only client, and delegates to the shared
 * transcription service. Does not import `cloudflare:workers`.
 */
export async function transcribeWordsOnWorker(
	input: unknown,
	env: DatabaseEnv,
	dependencies: TranscribeOnWorkerDependencies = {},
): Promise<TranscriptionWordsOutput> {
	const log = dependencies.log ?? logWorkerEvent;
	const process =
		dependencies.processWords ??
		(async (words: string[]) => {
			let config: DatabaseConfig;
			try {
				config = resolveDatabaseConfig(env);
			} catch {
				throw new TranscriptionError("database", "Database is unavailable");
			}

			const db = openWorkerDatabase(config, dependencies);
			return defaultProcessWords(words, { db });
		});

	const result = await transcribeWords(input, { processWords: process });
	if (!result.ok) {
		log({
			level: result.error.kind === "validation" ? "warn" : "error",
			message: "transcription_failed",
			details: {
				kind: result.error.kind,
				retryable: result.error.retryable,
			},
		});
		throw result.error;
	}

	return result.words;
}
