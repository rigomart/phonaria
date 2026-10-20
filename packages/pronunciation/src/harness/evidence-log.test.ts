import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	attemptFromRow,
	type EvidenceLogFetch,
	fetchEvidenceLog,
	importEvidenceLogCommand,
	loadEvidenceLog,
	rejudgeAttempt,
	summarizeEvidenceLog,
	writeEvidenceLogExport,
} from "./evidence-log";
import pipeline from "./fixtures/evidence-log-pipeline.json";

const PAGE = pipeline.results[0] as {
	type: "ok";
	response: { type: "execute"; result: { cols: unknown[]; rows: { value: string }[][] } };
};

/** Fake Turso `/v2/pipeline` serving the fixture's rows by `id > ? LIMIT ?`. */
function turso() {
	const fetch = vi.fn<EvidenceLogFetch>(async (_url, init) => {
		const { requests } = JSON.parse(String(init.body)) as {
			requests: [{ stmt: { args: [{ value: string }, { value: string }] } }];
		};
		const [afterId, limit] = requests[0].stmt.args.map(({ value }) => Number(value));
		const [, close] = pipeline.results;
		const result = PAGE.response.result;
		const rows = result.rows.filter((row) => Number(row[0].value) > afterId).slice(0, limit);
		return Response.json({
			...pipeline,
			results: [{ ...PAGE, response: { ...PAGE.response, result: { ...result, rows } } }, close],
		});
	});
	return fetch;
}

const SOURCE = { databaseUrl: "libsql://evidence-log.example.turso.io", authToken: "read-token" };

describe("fetchEvidenceLog", () => {
	it("reads every row through Turso's HTTP API with the read token", async () => {
		const fetch = turso();

		const attempts = await fetchEvidenceLog({ ...SOURCE, fetch });

		expect(fetch).toHaveBeenCalledTimes(1);
		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe("https://evidence-log.example.turso.io/v2/pipeline");
		expect(init.headers).toMatchObject({ Authorization: "Bearer read-token" });
		expect(String(init.body)).toMatch(
			/SELECT id, schema_version, .* FROM evidence_log WHERE id > \?/,
		);
		expect(attempts.map(({ id, word, next }) => [id, word, next])).toEqual([
			[1, "ship", "moved-on"],
			[2, "ship", "retried"],
			[3, "ship", "retried"],
			[4, "ship", "moved-on"],
		]);
		expect(attempts[0].evidence.words[0].pronunciations[0].sounds).toHaveLength(3);
		expect(attempts[0].attemptedAt).toBe(Date.UTC(2026, 9, 1, 9));
	});

	it("pages by ID until a short page", async () => {
		const fetch = turso();

		const attempts = await fetchEvidenceLog({ ...SOURCE, fetch, pageSize: 3 });

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(attempts.map(({ id }) => id)).toEqual([1, 2, 3, 4]);
	});

	it("fails loudly on an HTTP error or a failed query", async () => {
		await expect(
			fetchEvidenceLog({ ...SOURCE, fetch: async () => new Response("", { status: 401 }) }),
		).rejects.toThrow(/HTTP 401/);
		await expect(
			fetchEvidenceLog({
				...SOURCE,
				fetch: async () =>
					Response.json({ results: [{ type: "error", error: { message: "no such table" } }] }),
			}),
		).rejects.toThrow(/no such table/);
	});
});

describe("attemptFromRow", () => {
	const row = {
		id: 7,
		schema_version: 1,
		attempted_at: 1,
		word: "ship",
		target_accent: "en-us",
		evidence: '{"words":[]}',
		verdicts: '{"gate":{"type":"not-heard"},"judgement":null}',
		next_action: "retried",
	};

	it("parses the JSON columns", () => {
		expect(attemptFromRow(row)).toMatchObject({ id: 7, evidence: { words: [] }, next: "retried" });
	});

	it("refuses a schema version it doesn't know", () => {
		expect(() => attemptFromRow({ ...row, schema_version: 2 })).toThrow(/schema version 2/);
		expect(() => attemptFromRow({ ...row, next_action: "closed" })).toThrow(/next action/);
	});
});

describe("an evidence log export", () => {
	let dir: string;
	beforeEach(async () => {
		dir = await mkdtemp(path.join(tmpdir(), "harness-evidence-log-"));
	});
	afterEach(async () => {
		vi.unstubAllGlobals();
		await rm(dir, { recursive: true, force: true });
	});

	it("loads back in the harness and judges offline", async () => {
		const file = path.join(dir, "attempts.json");
		await writeEvidenceLogExport(file, await fetchEvidenceLog({ ...SOURCE, fetch: turso() }));

		const attempts = await loadEvidenceLog(file);
		const [, sheep, kid] = attempts.map((attempt) => rejudgeAttempt(attempt));

		expect(sheep.judgement?.sounds).toEqual([
			{ position: 1, phonemeId: "IX", verdict: { type: "swapped", heard: "I" } },
		]);
		expect(kid).toEqual({ gate: { type: "different-word", heard: ["kid"] }, judgement: null });

		const summary = summarizeEvidenceLog(attempts);
		expect(summary).toMatchObject({ attempts: 4, retried: 2 });
		expect(summary.gate).toMatchObject({
			judged: { total: 3, retried: 1 },
			"different-word": { total: 1, retried: 1 },
		});
		expect(summary.sounds.swapped).toEqual({ total: 1, retried: 1 });
	});

	it("counts attempts the re-run judges differently from what the learner saw", async () => {
		const [ship] = await fetchEvidenceLog({ ...SOURCE, fetch: turso() });
		const shownAsUnclear = {
			...ship,
			verdicts: {
				...ship.verdicts,
				judgement: {
					pronunciationIndex: 0,
					sounds: [
						{ position: 1, phonemeId: "IX", verdict: { type: "unclear", reason: "close-call" } },
					],
				},
			},
		} as const;

		expect(summarizeEvidenceLog([ship]).changed).toBe(0);
		expect(summarizeEvidenceLog([shownAsUnclear]).changed).toBe(1);
	});

	it("refuses a file that isn't an export", async () => {
		const file = path.join(dir, "clips.json");
		await writeFile(file, JSON.stringify({ clips: [] }));
		await expect(loadEvidenceLog(file)).rejects.toThrow(/isn't a version 1 evidence log export/);
	});

	it("is what import-evidence-log writes", async () => {
		vi.stubGlobal("fetch", turso());
		vi.spyOn(console, "log").mockImplementation(() => {});

		await importEvidenceLogCommand(["--out=october"], dir, {
			EVIDENCE_LOG_DATABASE_URL: SOURCE.databaseUrl,
			EVIDENCE_LOG_READ_TOKEN: SOURCE.authToken,
		});

		const written = JSON.parse(
			await readFile(path.join(dir, "evidence-log", "october.json"), "utf8"),
		);
		expect(written).toMatchObject({ format: "phonaria-evidence-log", version: 1 });
		expect(written.attempts).toHaveLength(4);
	});

	it("import-evidence-log needs the database URL and a read token", async () => {
		await expect(importEvidenceLogCommand([], dir, {})).rejects.toThrow(/EVIDENCE_LOG_READ_TOKEN/);
	});
});
