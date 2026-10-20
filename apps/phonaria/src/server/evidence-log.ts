import { PhonemeIpaMap, type PhonemeSymbolId } from "@phonaria/phonetics-data";
import { z } from "zod";
import { flags } from "@/lib/flags";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";
import {
	EVIDENCE_LOG_OTHER_WORD,
	EVIDENCE_LOG_RETENTION_DAYS,
	EVIDENCE_LOG_SCHEMA_VERSION,
	type EvidenceLogPayload,
	isLoggableWord,
	isLoggableWordList,
} from "@/lib/speech/evidence-log";
import type { WorkerRateLimit } from "@/server/cloudflare/env";
import { logWorkerEvent } from "@/server/cloudflare/log";
import { readBody } from "@/server/read-body";

export const MAX_EVIDENCE_LOG_BYTES = 16 * 1024;
export const MAX_ATTEMPT_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const RETENTION_MS = EVIDENCE_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const EVIDENCE_LOG_COLUMNS = [
	"schema_version",
	"attempted_at",
	"word",
	"target_accent",
	"evidence",
	"verdicts",
	"next_action",
] as const;

const INSERT_SQL = `INSERT INTO evidence_log (${EVIDENCE_LOG_COLUMNS.join(", ")}) VALUES (${EVIDENCE_LOG_COLUMNS.map(() => "?").join(", ")})`;
const PRUNE_SQL = "DELETE FROM evidence_log WHERE attempted_at < ?";

const phonemeId = z.enum(Object.keys(PhonemeIpaMap) as [PhonemeSymbolId, ...PhonemeSymbolId[]]);
const unit = z.number().min(0).max(1);
const seconds = z.number().min(0).max(60);
const index = z.int().min(0).max(15);
/** A heard word: a catalog word or the placeholder, never free text such as a name. */
const spokenWord = z.string().max(32).refine(isLoggableWord);
/** One loggable word, or placeholders only: several catalog words can spell a name. */
const spokenWords = z.array(spokenWord).max(16).refine(isLoggableWordList);

const soundEvidence = z.discriminatedUnion("type", [
	z.strictObject({
		type: z.literal("scored"),
		phonemeId,
		startSeconds: seconds,
		endSeconds: seconds,
		targetScore: unit,
		rivals: z.array(z.strictObject({ phonemeId, score: unit })).max(16),
		accuracy: unit.optional(),
	}),
	z.strictObject({ type: z.literal("missing"), phonemeId }),
]);

const recordingEvidence = z.strictObject({
	words: z
		.array(
			z.strictObject({
				pronunciations: z
					.array(
						z.strictObject({
							pronunciationIndex: index,
							sounds: z.array(soundEvidence).min(1).max(16),
						}),
					)
					.max(8),
				accuracy: unit.optional(),
				omitted: z.boolean().optional(),
			}),
		)
		.length(1),
	transcript: z
		.strictObject({ words: spokenWords.min(1), confidence: unit })
		.nullable()
		.optional(),
	insertedWords: z.array(z.literal(EVIDENCE_LOG_OTHER_WORD)).max(16).optional(),
});

const soundVerdict = z.discriminatedUnion("type", [
	z.strictObject({ type: z.literal("match") }),
	z.strictObject({
		type: z.literal("swapped"),
		heard: phonemeId,
		heardWord: spokenWord.optional(),
	}),
	z.strictObject({
		type: z.literal("unclear"),
		reason: z.enum(["no-evidence", "close-call", "other-sound"]),
	}),
]);

const verdicts = z.strictObject({
	judgedPhonemeIds: z.array(phonemeId).min(1).max(16).optional(),
	gate: z.discriminatedUnion("type", [
		z.strictObject({ type: z.literal("judged") }),
		z.strictObject({ type: z.literal("different-word"), heard: spokenWords }),
		z.strictObject({ type: z.literal("not-heard") }),
	]),
	judgement: z
		.strictObject({
			pronunciationIndex: index,
			sounds: z
				.array(z.strictObject({ position: index, phonemeId, verdict: soundVerdict }))
				.max(16),
		})
		.nullable(),
});

/** Strict at every level: an unknown field anywhere, such as `audio`, fails the whole log. */
export const evidenceLogPayloadSchema: z.ZodType<EvidenceLogPayload> = z.strictObject({
	schemaVersion: z.literal(EVIDENCE_LOG_SCHEMA_VERSION),
	attemptedAt: z.int().positive(),
	word: z.string().regex(/^[a-z']{1,32}$/),
	targetAccent: z.literal("en-us"),
	evidence: recordingEvidence,
	verdicts,
	next: z.enum(["retried", "moved-on"]),
});

export type EvidenceLogErrorCode =
	| "invalid_payload"
	| "unsupported_media"
	| "payload_too_large"
	| "rate_limited"
	| "unavailable"
	| "write_failed";

export type EvidenceLogErrorBody = {
	readonly error: { readonly code: EvidenceLogErrorCode; readonly message: string };
};

export type EvidenceLogWorkerEnv = {
	EVIDENCE_LOG_DATABASE_URL?: string;
	EVIDENCE_LOG_AUTH_TOKEN?: string;
	EVIDENCE_LOG_RATE_LIMIT: WorkerRateLimit;
};

export type EvidenceLogClient = {
	execute(statement: { sql: string; args: (string | number)[] }): Promise<{ rowsAffected: number }>;
};

export type EvidenceLogClientFactory = (config: {
	url: string;
	authToken: string;
}) => EvidenceLogClient;

export type EvidenceLogDependencies = {
	createClient: EvidenceLogClientFactory;
	log?: typeof logWorkerEvent;
	now?: () => number;
};

class EvidenceLogError extends Error {
	constructor(
		readonly status: number,
		readonly code: EvidenceLogErrorCode,
		message: string,
	) {
		super(message);
	}
}

const NO_STORE = { "Cache-Control": "no-store" };

function openClient(
	env: Omit<EvidenceLogWorkerEnv, "EVIDENCE_LOG_RATE_LIMIT">,
	createClient: EvidenceLogClientFactory,
): EvidenceLogClient | null {
	const url = env.EVIDENCE_LOG_DATABASE_URL?.trim();
	const authToken = env.EVIDENCE_LOG_AUTH_TOKEN?.trim();
	return url && authToken ? createClient({ url, authToken }) : null;
}

/**
 * Framework-neutral Worker handler for `POST /api/speech/evidence-log` with an
 * `EvidenceLogPayload` as JSON. Writes one row to the evidence log database and
 * answers 204. Stores no IP, user agent or account, and never logs the payload:
 * the IP only keys the rate limit.
 */
export async function logEvidenceOnWorker(
	request: Request,
	env: EvidenceLogWorkerEnv,
	dependencies: EvidenceLogDependencies,
): Promise<Response> {
	if (!flags.isEnabled("speech")) return new Response("Not Found", { status: 404 });
	if (request.method !== "POST") {
		return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
	}

	const log = dependencies.log ?? logWorkerEvent;
	const now = dependencies.now ?? Date.now;
	const started = now();
	let response: Response;
	try {
		await writeAttempt(request, env, dependencies, now);
		response = new Response(null, { status: 204, headers: NO_STORE });
	} catch (error) {
		const failure =
			error instanceof EvidenceLogError
				? error
				: new EvidenceLogError(502, "write_failed", "The attempt couldn't be saved.");
		const body: EvidenceLogErrorBody = { error: { code: failure.code, message: failure.message } };
		response = Response.json(body, {
			status: failure.status,
			headers: failure.status === 429 ? { ...NO_STORE, "Retry-After": "60" } : NO_STORE,
		});
	}

	log({
		level: response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info",
		message: "evidence_log",
		details: { status: response.status, ms: now() - started },
	});
	return response;
}

async function writeAttempt(
	request: Request,
	env: EvidenceLogWorkerEnv,
	{ createClient }: EvidenceLogDependencies,
	now: () => number,
): Promise<void> {
	const client = env.EVIDENCE_LOG_RATE_LIMIT ? openClient(env, createClient) : null;
	if (!client) {
		throw new EvidenceLogError(503, "unavailable", "Evidence logging is temporarily unavailable.");
	}

	const limited = await env.EVIDENCE_LOG_RATE_LIMIT.limit({
		key: request.headers.get("cf-connecting-ip")?.trim() || "anonymous",
	});
	if (!limited.success) {
		throw new EvidenceLogError(
			429,
			"rate_limited",
			"Too many attempt logs. Please try again shortly.",
		);
	}

	const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
	if (contentType !== "application/json") {
		throw new EvidenceLogError(415, "unsupported_media", "Send the attempt as application/json.");
	}
	const body = await readBody(request, MAX_EVIDENCE_LOG_BYTES);
	if (!body) {
		throw new EvidenceLogError(
			413,
			"payload_too_large",
			`An attempt log must be at most ${MAX_EVIDENCE_LOG_BYTES} bytes.`,
		);
	}

	const payload = parsePayload(body, now());
	await client.execute({
		sql: INSERT_SQL,
		args: [
			payload.schemaVersion,
			payload.attemptedAt,
			payload.word,
			payload.targetAccent,
			JSON.stringify(payload.evidence),
			JSON.stringify(payload.verdicts),
			payload.next,
		],
	});
}

function parsePayload(body: Uint8Array, now: number): EvidenceLogPayload {
	let json: unknown;
	try {
		json = JSON.parse(new TextDecoder().decode(body));
	} catch {
		throw invalid("The attempt log isn't valid JSON.");
	}
	const parsed = evidenceLogPayloadSchema.safeParse(json);
	if (!parsed.success) throw invalid("The attempt log doesn't match the expected shape.");
	const payload = parsed.data;
	if (!CatalogWordPronunciations.has(payload.word)) {
		throw invalid("The word must be one from the minimal-pair catalog.");
	}
	if (
		payload.attemptedAt < now - MAX_ATTEMPT_AGE_MS ||
		payload.attemptedAt > now + MAX_CLOCK_SKEW_MS
	) {
		throw invalid("The attempt time is too far from now.");
	}
	return payload;
}

function invalid(message: string): EvidenceLogError {
	return new EvidenceLogError(400, "invalid_payload", message);
}

/** Deletes rows whose attempt is older than the retention period. Resolves null when the secrets are missing and rethrows write errors. Not gated by the speech flag. */
export async function pruneEvidenceLog(
	env: Omit<EvidenceLogWorkerEnv, "EVIDENCE_LOG_RATE_LIMIT">,
	dependencies: EvidenceLogDependencies,
): Promise<{ deleted: number } | null> {
	const log = dependencies.log ?? logWorkerEvent;
	const now = dependencies.now ?? Date.now;
	const client = openClient(env, dependencies.createClient);
	if (!client) {
		log({ level: "info", message: "evidence_log_prune", details: { skipped: "not configured" } });
		return null;
	}
	try {
		const { rowsAffected } = await client.execute({ sql: PRUNE_SQL, args: [now() - RETENTION_MS] });
		log({ level: "info", message: "evidence_log_prune", details: { deleted: rowsAffected } });
		return { deleted: rowsAffected };
	} catch (error) {
		log({ level: "error", message: "evidence_log_prune", details: { failed: true } });
		throw error;
	}
}
