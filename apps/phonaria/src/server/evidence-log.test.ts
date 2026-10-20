import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient as createLocalClient } from "@libsql/client";
import { azureEvidenceFromResponse, gateWord, judgeWord } from "@phonaria/pronunciation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";
import { EVIDENCE_LOG_OTHER_WORD, type EvidenceLogPayload } from "@/lib/speech/evidence-log";
import { MISCUE_FIXTURES } from "../../../../packages/pronunciation/src/azure/fixtures/miscue";
import {
	EVIDENCE_LOG_COLUMNS,
	type EvidenceLogClient,
	type EvidenceLogErrorBody,
	type EvidenceLogWorkerEnv,
	logEvidenceOnWorker,
	MAX_EVIDENCE_LOG_BYTES,
	pruneEvidenceLog,
} from "./evidence-log";

const NOW = Date.UTC(2026, 9, 20, 12);
const DAY = 24 * 60 * 60 * 1000;
const IP = "203.0.113.7";
const USER_AGENT = "Mozilla/5.0 (test)";

const SHIP = {
	text: "ship",
	acceptedPronunciations: CatalogWordPronunciations.get("ship") ?? [],
} as const;
const SHIP_EVIDENCE = azureEvidenceFromResponse(
	MISCUE_FIXTURES.ship.assessment,
	{ targetAccent: "en-us", words: [SHIP] },
	MISCUE_FIXTURES.ship.recognition,
);
const JUDGED = { judgedPhonemeIds: new Set(["IX", "I"] as const), targetAccent: "en-us" } as const;

function payload(overrides: Record<string, unknown> = {}): EvidenceLogPayload {
	const [wordEvidence] = SHIP_EVIDENCE.words;
	return {
		schemaVersion: 1,
		attemptedAt: NOW - 30_000,
		word: "ship",
		targetAccent: "en-us",
		evidence: SHIP_EVIDENCE,
		verdicts: {
			judgedPhonemeIds: ["IX", "I"],
			gate: gateWord({
				target: SHIP,
				evidence: wordEvidence,
				transcript: SHIP_EVIDENCE.transcript,
				pronunciationsOf: (word) => CatalogWordPronunciations.get(word),
				...JUDGED,
			}),
			judgement: judgeWord({ evidence: wordEvidence, ...JUDGED }),
		},
		next: "moved-on",
		...overrides,
	} as EvidenceLogPayload;
}

function logRequest(
	body: unknown,
	{ headers = {}, method = "POST" }: { headers?: Record<string, string>; method?: string } = {},
): Request {
	return new Request("https://phonaria.test/api/speech/evidence-log", {
		method,
		headers: {
			"Content-Type": "application/json",
			"cf-connecting-ip": IP,
			"User-Agent": USER_AGENT,
			...headers,
		},
		body: method === "GET" ? undefined : typeof body === "string" ? body : JSON.stringify(body),
	});
}

function fakeDatabase() {
	const execute = vi.fn<EvidenceLogClient["execute"]>(async () => ({ rowsAffected: 1 }));
	const createClient = vi.fn(() => ({ execute }));
	return { execute, createClient };
}

function allowingEnv(overrides: Partial<EvidenceLogWorkerEnv> = {}): EvidenceLogWorkerEnv {
	return {
		EVIDENCE_LOG_DATABASE_URL: "libsql://evidence.example",
		EVIDENCE_LOG_AUTH_TOKEN: "write-token",
		EVIDENCE_LOG_RATE_LIMIT: { limit: async () => ({ success: true }) },
		...overrides,
	};
}

async function send(
	request: Request,
	env: EvidenceLogWorkerEnv = allowingEnv(),
	database = fakeDatabase(),
	log = vi.fn(),
) {
	const response = await logEvidenceOnWorker(request, env, {
		createClient: database.createClient,
		log,
		now: () => NOW,
	});
	return { response, database, log };
}

async function errorCode(response: Response): Promise<string> {
	return ((await response.json()) as EvidenceLogErrorBody).error.code;
}

describe("logEvidenceOnWorker", () => {
	beforeEach(() => {
		process.env.FLAG_SPEECH = "1";
	});

	afterEach(() => {
		delete process.env.FLAG_SPEECH;
	});

	it("returns 404 without touching the rate limit or the database when FLAG_SPEECH is off", async () => {
		process.env.FLAG_SPEECH = "0";
		const limit = vi.fn(async () => ({ success: true }));

		const { response, database } = await send(
			logRequest(payload()),
			allowingEnv({ EVIDENCE_LOG_RATE_LIMIT: { limit } }),
		);

		expect(response.status).toBe(404);
		expect(limit).not.toHaveBeenCalled();
		expect(database.createClient).not.toHaveBeenCalled();
	});

	it("answers 405 to anything but POST", async () => {
		const { response } = await send(logRequest(undefined, { method: "GET" }));
		expect(response.status).toBe(405);
		expect(response.headers.get("Allow")).toBe("POST");
	});

	it.each([
		["database URL", { EVIDENCE_LOG_DATABASE_URL: undefined }],
		["auth token", { EVIDENCE_LOG_AUTH_TOKEN: " " }],
	])("answers 503 without the %s", async (_name, overrides) => {
		const { response, database } = await send(logRequest(payload()), allowingEnv(overrides));

		expect(response.status).toBe(503);
		expect(await errorCode(response)).toBe("unavailable");
		expect(database.createClient).not.toHaveBeenCalled();
	});

	it("answers 429 once the rate limit is spent, keyed by IP, and writes nothing", async () => {
		const limit = vi.fn(async () => ({ success: false }));

		const { response, database } = await send(
			logRequest(payload()),
			allowingEnv({ EVIDENCE_LOG_RATE_LIMIT: { limit } }),
		);

		expect(response.status).toBe(429);
		expect(response.headers.get("Retry-After")).toBe("60");
		expect(await errorCode(response)).toBe("rate_limited");
		expect(limit).toHaveBeenCalledWith({ key: IP });
		expect(database.execute).not.toHaveBeenCalled();
	});

	it("writes exactly the allowed columns, and no IP or user agent, then answers 204", async () => {
		const attempt = payload();
		const { response, database } = await send(logRequest(attempt));

		expect(response.status).toBe(204);
		expect(database.createClient).toHaveBeenCalledWith({
			url: "libsql://evidence.example",
			authToken: "write-token",
		});
		expect(database.execute).toHaveBeenCalledTimes(1);
		const [{ sql, args }] = database.execute.mock.calls[0];
		const columns = sql.match(/\(([^)]*)\)/)?.[1].split(", ");
		expect(columns).toEqual([...EVIDENCE_LOG_COLUMNS]);
		expect(args).toEqual([
			1,
			attempt.attemptedAt,
			"ship",
			"en-us",
			expect.any(String),
			expect.any(String),
			"moved-on",
		]);
		expect(JSON.parse(String(args[4]))).toEqual(attempt.evidence);
		expect(JSON.parse(String(args[5]))).toEqual(attempt.verdicts);
		expect(JSON.stringify(args)).not.toContain(IP);
		expect(JSON.stringify(args)).not.toContain(USER_AGENT);
	});

	it("never logs the payload, only the status and timing", async () => {
		const { log } = await send(logRequest(payload()));

		expect(log).toHaveBeenCalledWith({
			level: "info",
			message: "evidence_log",
			details: { status: 204, ms: 0 },
		});
	});

	const WAV_BASE64 = `UklGR${"A".repeat(400)}`;

	it.each([
		["an audio field", { audio: WAV_BASE64 }],
		["an unknown top-level field", { userAgent: USER_AGENT }],
		[
			"an unknown field inside the evidence",
			{ evidence: { ...SHIP_EVIDENCE, recording: WAV_BASE64 } },
		],
		[
			"a base64 blob as a transcript word",
			{ evidence: { ...SHIP_EVIDENCE, transcript: { words: [WAV_BASE64], confidence: 0.9 } } },
		],
		["a word outside the catalog", { word: "hello" }],
		["another target accent", { targetAccent: "es-419" }],
		["another schema version", { schemaVersion: 2 }],
		["an unknown next action", { next: "closed" }],
		["an attempt more than a day old", { attemptedAt: NOW - 2 * DAY }],
		["an attempt in the future", { attemptedAt: NOW + DAY }],
		[
			"a score outside 0..1",
			{
				evidence: {
					words: [
						{
							pronunciations: [
								{
									pronunciationIndex: 0,
									sounds: [
										{
											type: "scored",
											phonemeId: "SH",
											startSeconds: 0,
											endSeconds: 0.1,
											targetScore: 100,
											rivals: [],
										},
									],
								},
							],
						},
					],
				},
			},
		],
		["an unknown phoneme ID", { verdicts: { ...payload().verdicts, judgedPhonemeIds: ["QQ"] } }],
	])("rejects %s with 400 and writes nothing", async (_name, overrides) => {
		const { response, database } = await send(logRequest(payload(overrides)));

		expect(response.status).toBe(400);
		expect(await errorCode(response)).toBe("invalid_payload");
		expect(database.execute).not.toHaveBeenCalled();
	});

	/** A 364-byte WAV as base64, cut into chunks that each look like a word. */
	const SPLIT_WAV = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(360)])
		.toString("base64")
		.match(/.{1,40}/g) as string[];
	const transcriptOf = (words: string[]) => ({
		evidence: { ...SHIP_EVIDENCE, transcript: { words, confidence: 0.9 } },
	});
	const shownAsSwapped = (heardWord: string) => ({
		verdicts: {
			judgedPhonemeIds: ["IX", "I"],
			gate: { type: "judged" },
			judgement: {
				pronunciationIndex: 0,
				sounds: [
					{ position: 1, phonemeId: "IX", verdict: { type: "swapped", heard: "I", heardWord } },
				],
			},
		},
	});

	it.each([
		["a name in the transcript", transcriptOf(["alice", "smith"])],
		["a capitalised name", transcriptOf(["Alice"])],
		["a phone number in the transcript", transcriptOf(["2125550199"])],
		["a number as an inserted word", { evidence: { ...SHIP_EVIDENCE, insertedWords: ["4111"] } }],
		[
			"a name the word gate heard",
			{
				verdicts: {
					judgedPhonemeIds: ["IX", "I"],
					gate: { type: "different-word", heard: ["alice"] },
					judgement: null,
				},
			},
		],
		["a name as a swap's heard word", shownAsSwapped("alice")],
		["base64 audio split into word-sized chunks", transcriptOf(SPLIT_WAV)],
		["Sue Park, a name spelled with catalog words", transcriptOf(["sue", "park"])],
		["Pat Lane, a name spelled with catalog words", transcriptOf(["pat", "lane"])],
		[
			"a name in catalog words the word gate heard",
			{
				verdicts: {
					judgedPhonemeIds: ["IX", "I"],
					gate: { type: "different-word", heard: ["sue", "park"] },
					judgement: null,
				},
			},
		],
		["a real word beside placeholders", transcriptOf([EVIDENCE_LOG_OTHER_WORD, "ship"])],
		[
			"a catalog word as an inserted word",
			{ evidence: { ...SHIP_EVIDENCE, insertedWords: ["sheep"] } },
		],
	])(
		"rejects %s, since only catalog words and the placeholder are stored",
		async (_name, overrides) => {
			const { response, database } = await send(logRequest(payload(overrides)));

			expect(response.status).toBe(400);
			expect(database.execute).not.toHaveBeenCalled();
		},
	);

	it("stores a one-word catalog transcript as sent", async () => {
		const { response, database } = await send(logRequest(payload(transcriptOf(["sheep"]))));

		expect(response.status).toBe(204);
		const [{ args }] = database.execute.mock.calls[0];
		expect(JSON.parse(String(args[4])).transcript.words).toEqual(["sheep"]);
	});

	it("stores placeholders and a catalog heard word as sent", async () => {
		const attempt = payload({
			evidence: {
				...SHIP_EVIDENCE,
				transcript: { words: [EVIDENCE_LOG_OTHER_WORD, EVIDENCE_LOG_OTHER_WORD], confidence: 0.4 },
				insertedWords: [EVIDENCE_LOG_OTHER_WORD],
			},
			...shownAsSwapped("sheep"),
		});

		const { response, database } = await send(logRequest(attempt));

		expect(response.status).toBe(204);
		const [{ args }] = database.execute.mock.calls[0];
		expect(JSON.parse(String(args[4]))).toMatchObject({
			transcript: { words: ["<other>", "<other>"], confidence: 0.4 },
			insertedWords: ["<other>"],
		});
		expect(JSON.parse(String(args[5])).judgement.sounds[0].verdict.heardWord).toBe("sheep");
	});

	it("rejects a body that isn't JSON with 400", async () => {
		const { response } = await send(logRequest("{not json"));
		expect(response.status).toBe(400);
	});

	it("rejects anything but application/json with 415", async () => {
		const { response, database } = await send(
			logRequest(payload(), { headers: { "Content-Type": "audio/wav" } }),
		);

		expect(response.status).toBe(415);
		expect(database.execute).not.toHaveBeenCalled();
	});

	const OVERSIZED = JSON.stringify({ ...payload(), padding: "x".repeat(MAX_EVIDENCE_LOG_BYTES) });

	function streamedRequest(body: string, headers: Record<string, string> = {}): Request {
		return new Request("https://phonaria.test/api/speech/evidence-log", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...headers },
			body: new Blob([body]).stream(),
			duplex: "half",
		} as RequestInit);
	}

	/** The status, the error code and whether anything was written. */
	async function outcome({ response, database }: Awaited<ReturnType<typeof send>>) {
		return {
			status: response.status,
			code: await errorCode(response),
			wrote: database.execute.mock.calls.length > 0,
		};
	}
	const TOO_LARGE = { status: 413, code: "payload_too_large", wrote: false };

	it("rejects an oversized body with no declared length with 413", async () => {
		expect(await outcome(await send(streamedRequest(OVERSIZED)))).toEqual(TOO_LARGE);
	});

	it("rejects a declared Content-Length over the limit with 413 without reading the body", async () => {
		const request = logRequest(payload(), {
			headers: { "Content-Length": String(MAX_EVIDENCE_LOG_BYTES + 1) },
		});

		expect(await outcome(await send(request))).toEqual(TOO_LARGE);
		expect(request.bodyUsed).toBe(false);
	});

	it("rejects an oversized stream whose Content-Length understates it with 413", async () => {
		const request = streamedRequest(OVERSIZED, { "Content-Length": "100" });
		expect(await outcome(await send(request))).toEqual(TOO_LARGE);
	});

	it("answers 502 when the database write fails", async () => {
		const database = fakeDatabase();
		database.execute.mockRejectedValueOnce(new Error("libsql://evidence.example refused"));

		const { response, log } = await send(logRequest(payload()), allowingEnv(), database);

		expect(response.status).toBe(502);
		expect(await errorCode(response)).toBe("write_failed");
		expect(JSON.stringify(log.mock.calls)).not.toMatch(/libsql|refused/);
	});
});

describe("pruneEvidenceLog", () => {
	it("deletes rows whose attempt is more than 90 days old", async () => {
		const database = fakeDatabase();

		const result = await pruneEvidenceLog(allowingEnv(), {
			createClient: database.createClient,
			log: vi.fn(),
			now: () => NOW,
		});

		expect(result).toEqual({ deleted: 1 });
		expect(database.execute).toHaveBeenCalledWith({
			sql: "DELETE FROM evidence_log WHERE attempted_at < ?",
			args: [NOW - 90 * DAY],
		});
	});

	it("does nothing without the secrets", async () => {
		const database = fakeDatabase();

		const result = await pruneEvidenceLog(allowingEnv({ EVIDENCE_LOG_AUTH_TOKEN: undefined }), {
			createClient: database.createClient,
			log: vi.fn(),
		});

		expect(result).toBeNull();
		expect(database.createClient).not.toHaveBeenCalled();
	});
});

describe("the evidence log migration", () => {
	const migration = readFileSync(
		resolve(import.meta.dirname, "../../migrations/evidence-log/0001_create_evidence_log.sql"),
		"utf8",
	);

	beforeEach(() => {
		process.env.FLAG_SPEECH = "1";
	});

	afterEach(() => {
		delete process.env.FLAG_SPEECH;
	});

	it("takes the rows the Worker writes, and the prune keeps only recent ones", async () => {
		const client = createLocalClient({ url: ":memory:" });
		await client.executeMultiple(migration);
		const database = { execute: vi.fn(), createClient: () => client };

		for (const attemptedAt of [NOW - 1000, NOW - 2000]) {
			const { response } = await send(
				logRequest(payload({ attemptedAt, next: "retried" })),
				allowingEnv(),
				database as never,
			);
			expect(response.status).toBe(204);
		}
		await client.execute({
			sql: `INSERT INTO evidence_log (${EVIDENCE_LOG_COLUMNS.join(", ")}) VALUES (1, ?, 'ship', 'en-us', '{}', '{}', 'moved-on')`,
			args: [NOW - 91 * DAY],
		});

		const pruned = await pruneEvidenceLog(allowingEnv(), {
			createClient: () => client,
			log: vi.fn(),
			now: () => NOW,
		});
		const rows = await client.execute("SELECT * FROM evidence_log ORDER BY attempted_at");

		expect(pruned).toEqual({ deleted: 1 });
		expect(rows.columns).toEqual(["id", ...EVIDENCE_LOG_COLUMNS]);
		expect(rows.rows.map((row) => row.attempted_at)).toEqual([NOW - 2000, NOW - 1000]);
		expect(JSON.parse(String(rows.rows[0].evidence))).toEqual(SHIP_EVIDENCE);
		client.close();
	});

	it("refuses a next action outside the two the app sends", async () => {
		const client = createLocalClient({ url: ":memory:" });
		await client.executeMultiple(migration);

		await expect(
			client.execute(
				`INSERT INTO evidence_log (${EVIDENCE_LOG_COLUMNS.join(", ")}) VALUES (1, 1, 'ship', 'en-us', '{}', '{}', 'closed')`,
			),
		).rejects.toThrow(/CHECK/);
		client.close();
	});
});
