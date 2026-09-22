import { type DatabaseConfig, resolveDatabaseConfig } from "@/db/config";
import { createDatabase, type AppDatabase, type LibsqlClientFactory } from "@/db/drizzle";
import { processWords as defaultProcessWords } from "@/lib/g2p/service";
import type { TranscriptionWordsOutput } from "@/lib/transcription/contract";
import { TranscriptionError, transcribeWords } from "@/lib/transcription/service";
import type { WorkerRateLimit } from "@/server/cloudflare/env";
import { logWorkerEvent } from "@/server/cloudflare/log";

export type TranscribeOnWorkerDependencies = {
	createClient?: LibsqlClientFactory;
	openDatabase?: (config: DatabaseConfig) => AppDatabase;
	processWords?: typeof defaultProcessWords;
	rateLimitKey?: string;
	log?: typeof logWorkerEvent;
};

export type TranscriptionWorkerEnv = {
	TURSO_DATABASE_URL?: string;
	TURSO_AUTH_TOKEN?: string;
	TRANSCRIPTION_RATE_LIMIT: WorkerRateLimit;
};

function openWorkerDatabase(
	config: DatabaseConfig,
	dependencies: TranscribeOnWorkerDependencies,
): AppDatabase {
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
	env: TranscriptionWorkerEnv,
	dependencies: TranscribeOnWorkerDependencies = {},
): Promise<TranscriptionWordsOutput> {
	const log = dependencies.log ?? logWorkerEvent;
	const processWords =
		dependencies.processWords ??
		(async (words: string[]) => {
			let config: DatabaseConfig;
			try {
				config = resolveDatabaseConfig({
					TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
					TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
				});
			} catch {
				throw new TranscriptionError("database", "Database is unavailable");
			}

			const db = openWorkerDatabase(config, dependencies);
			return defaultProcessWords(words, { db });
		});
	const process = async (words: string[]) => {
		if (!env.TRANSCRIPTION_RATE_LIMIT) {
			throw new TranscriptionError(
				"retryable",
				"Transcription service is temporarily unavailable.",
			);
		}

		const result = await env.TRANSCRIPTION_RATE_LIMIT.limit({
			key: dependencies.rateLimitKey?.trim() || "anonymous",
		});
		if (!result.success) {
			throw new TranscriptionError(
				"rate_limit",
				"Too many transcription requests. Please try again shortly.",
			);
		}
		return processWords(words);
	};

	const result = await transcribeWords(input, { processWords: process });
	if (!result.ok) {
		log({
			level:
				result.error.kind === "validation" || result.error.kind === "rate_limit" ? "warn" : "error",
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
