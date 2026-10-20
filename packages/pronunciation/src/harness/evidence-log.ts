/**
 * Real-use attempts from the app's opt-in evidence log (#336), exported from its
 * Turso database into a file the harness judges offline. The rows carry no label of
 * what was said, only what the learner did next, so they feed threshold work (#335)
 * as "how would these margins have judged real attempts", not as accuracy cases.
 *
 * Mirrors `EvidenceLogPayload` in `apps/phonaria/src/lib/speech/evidence-log.ts`
 * and the table in `apps/phonaria/migrations/evidence-log/`.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import type { RecordingEvidence, SoundVerdict } from "../contract";
import { judgeWord, type JudgeMargins, type WordJudgement } from "../judge";
import { gateWord, type PronunciationLookup, type WordGate } from "../word-gate";
import { curatedPronunciations } from "./cases";

export type EvidenceLogNext = "retried" | "moved-on";

export type LoggedVerdicts = {
	/** Absent when every sound was judged. */
	readonly judgedPhonemeIds?: readonly PhonemeSymbolId[];
	readonly gate: WordGate;
	readonly judgement: WordJudgement | null;
};

export type LoggedAttempt = {
	readonly id: number;
	readonly schemaVersion: 1;
	/** Unix milliseconds. */
	readonly attemptedAt: number;
	readonly word: string;
	readonly targetAccent: "en-us";
	readonly evidence: RecordingEvidence;
	/** What the app showed the learner. */
	readonly verdicts: LoggedVerdicts;
	readonly next: EvidenceLogNext;
};

export const EVIDENCE_LOG_EXPORT_FORMAT = "phonaria-evidence-log";

/**
 * The app stores only minimal-pair catalog words. Any other heard word, in the
 * transcript, the inserted words, the gate's `heard` or a swap's `heardWord`, is
 * this placeholder, as `EVIDENCE_LOG_OTHER_WORD` in the app.
 */
export const EVIDENCE_LOG_OTHER_WORD = "<other>";

/** The placeholder has no pronunciation, so the gate takes it as an unknown other word. */
const loggedPronunciations: PronunciationLookup = (word) =>
	word === EVIDENCE_LOG_OTHER_WORD ? undefined : curatedPronunciations(word);

export type EvidenceLogExport = {
	readonly format: typeof EVIDENCE_LOG_EXPORT_FORMAT;
	readonly version: 1;
	readonly exportedAt: string;
	readonly attempts: readonly LoggedAttempt[];
};

type HranaValue =
	| { readonly type: "null" }
	| { readonly type: "integer"; readonly value: string }
	| { readonly type: "float"; readonly value: number }
	| { readonly type: "text"; readonly value: string }
	| { readonly type: "blob"; readonly base64: string };

type HranaPipelineResponse = {
	readonly results: readonly (
		| {
				readonly type: "ok";
				readonly response: {
					readonly type: string;
					readonly result?: {
						readonly cols: readonly { readonly name: string | null }[];
						readonly rows: readonly (readonly HranaValue[])[];
					};
				};
		  }
		| { readonly type: "error"; readonly error: { readonly message: string } }
	)[];
};

export type EvidenceLogFetch = (url: string, init: RequestInit) => Promise<Response>;

const PAGE_SQL =
	"SELECT id, schema_version, attempted_at, word, target_accent, evidence, verdicts, next_action FROM evidence_log WHERE id > ? ORDER BY id LIMIT ?";

/** `libsql://name.turso.io` becomes `https://name.turso.io`, as libSQL clients do. */
function pipelineUrl(databaseUrl: string): string {
	const url = new URL(databaseUrl.replace(/^libsql:/, "https:"));
	url.pathname = `${url.pathname.replace(/\/+$/, "")}/v2/pipeline`;
	return url.toString();
}

function cellValue(value: HranaValue): string | number | null {
	if (value.type === "null") return null;
	if (value.type === "integer") return Number(value.value);
	if (value.type === "blob") throw new Error("The evidence log never holds blobs");
	return value.value;
}

/**
 * Reads every row through Turso's HTTP API, in pages by ID. Use a read-only token:
 * the Worker's token can only write.
 */
export async function fetchEvidenceLog({
	databaseUrl,
	authToken,
	fetch = globalThis.fetch,
	pageSize = 500,
}: {
	readonly databaseUrl: string;
	readonly authToken: string;
	readonly fetch?: EvidenceLogFetch;
	readonly pageSize?: number;
}): Promise<LoggedAttempt[]> {
	const url = pipelineUrl(databaseUrl);
	const attempts: LoggedAttempt[] = [];
	for (let afterId = 0; ;) {
		const response = await fetch(url, {
			method: "POST",
			headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
			body: JSON.stringify({
				requests: [
					{
						type: "execute",
						stmt: {
							sql: PAGE_SQL,
							args: [
								{ type: "integer", value: String(afterId) },
								{ type: "integer", value: String(pageSize) },
							],
						},
					},
					{ type: "close" },
				],
			}),
		});
		if (!response.ok) throw new Error(`The evidence log answered HTTP ${response.status}`);
		const [first] = ((await response.json()) as HranaPipelineResponse).results;
		if (!first) throw new Error("The evidence log returned no result");
		if (first.type === "error")
			throw new Error(`The evidence log query failed: ${first.error.message}`);
		const result = first.response.result;
		if (!result) throw new Error("The evidence log returned no rows");

		const names = result.cols.map(({ name }) => name ?? "");
		for (const row of result.rows) {
			attempts.push(
				attemptFromRow(
					Object.fromEntries(row.map((value, column) => [names[column], cellValue(value)])),
				),
			);
		}
		if (result.rows.length < pageSize) return attempts;
		afterId = attempts[attempts.length - 1].id;
	}
}

/** One table row as column name to value, JSON columns still as text. */
export function attemptFromRow(
	row: Readonly<Record<string, string | number | null>>,
): LoggedAttempt {
	const { id, schema_version, attempted_at, word, target_accent, evidence, verdicts, next_action } =
		row;
	if (schema_version !== 1) throw new Error(`Row ${id}: unknown schema version ${schema_version}`);
	if (typeof id !== "number" || typeof attempted_at !== "number" || typeof word !== "string") {
		throw new Error(`Row ${id}: missing id, attempted_at or word`);
	}
	if (target_accent !== "en-us") throw new Error(`Row ${id}: unsupported accent ${target_accent}`);
	if (next_action !== "retried" && next_action !== "moved-on") {
		throw new Error(`Row ${id}: unknown next action ${next_action}`);
	}
	if (typeof evidence !== "string" || typeof verdicts !== "string") {
		throw new Error(`Row ${id}: evidence and verdicts must be JSON text`);
	}
	return {
		id,
		schemaVersion: 1,
		attemptedAt: attempted_at,
		word,
		targetAccent: target_accent,
		evidence: JSON.parse(evidence) as RecordingEvidence,
		verdicts: JSON.parse(verdicts) as LoggedVerdicts,
		next: next_action,
	};
}

export async function writeEvidenceLogExport(
	file: string,
	attempts: readonly LoggedAttempt[],
	exportedAt = new Date(),
): Promise<void> {
	const contents: EvidenceLogExport = {
		format: EVIDENCE_LOG_EXPORT_FORMAT,
		version: 1,
		exportedAt: exportedAt.toISOString(),
		attempts,
	};
	await mkdir(path.dirname(file), { recursive: true });
	await writeFile(file, `${JSON.stringify(contents, null, "\t")}\n`);
}

export async function loadEvidenceLog(file: string): Promise<LoggedAttempt[]> {
	const contents = JSON.parse(await readFile(file, "utf8")) as Partial<EvidenceLogExport>;
	if (contents.format !== EVIDENCE_LOG_EXPORT_FORMAT || contents.version !== 1) {
		throw new Error(`${file} isn't a version 1 evidence log export`);
	}
	if (!Array.isArray(contents.attempts)) throw new Error(`${file} has no attempts`);
	return contents.attempts;
}

export type Rejudged = { readonly gate: WordGate; readonly judgement: WordJudgement | null };

/**
 * The word gate, then the judge, on a logged attempt, as the app runs them. A
 * placeholder transcript word counts as an unknown other word, so a homophone or a
 * one-swap word outside the catalog (*by* for *buy*) re-judges as another word that
 * only the scoring can let through, where the app could compare its pronunciation.
 */
export function rejudgeAttempt(attempt: LoggedAttempt, margins?: JudgeMargins): Rejudged {
	const [evidence] = attempt.evidence.words;
	const judgedPhonemeIds =
		attempt.verdicts.judgedPhonemeIds && new Set(attempt.verdicts.judgedPhonemeIds);
	// The app skips the gate and shows "no evidence" when the scorer returned no word.
	if (!evidence) return { gate: { type: "judged" }, judgement: null };
	const gate = gateWord({
		target: {
			text: attempt.word,
			acceptedPronunciations: curatedPronunciations(attempt.word) ?? [],
		},
		evidence,
		transcript: attempt.evidence.transcript,
		judgedPhonemeIds,
		targetAccent: attempt.targetAccent,
		pronunciationsOf: loggedPronunciations,
	});
	if (gate.type !== "judged") return { gate, judgement: null };
	return {
		gate,
		judgement: judgeWord({
			evidence,
			judgedPhonemeIds,
			targetAccent: attempt.targetAccent,
			margins,
		}),
	};
}

type Tally = { total: number; retried: number };

export type EvidenceLogSummary = {
	readonly attempts: number;
	readonly retried: number;
	/** Word gate outcomes, re-run. */
	readonly gate: Record<WordGate["type"], Tally>;
	/** Verdicts on every judged sound, re-run. */
	readonly sounds: Record<SoundVerdict["type"], Tally>;
	/** Attempts the re-run judges differently from what the learner was shown. */
	readonly changed: number;
};

function withoutHeardWord({ gate, judgement }: Rejudged) {
	return {
		gate,
		judgement: judgement && {
			pronunciationIndex: judgement.pronunciationIndex,
			sounds: judgement.sounds.map(({ position, phonemeId, verdict }) => ({
				position,
				phonemeId,
				verdict:
					verdict.type === "swapped" ? { type: verdict.type, heard: verdict.heard } : verdict,
			})),
		},
	};
}

/** Re-judges every attempt under `margins` and counts the outcomes, and how often each led to a retry. */
export function summarizeEvidenceLog(
	attempts: readonly LoggedAttempt[],
	margins?: JudgeMargins,
): EvidenceLogSummary {
	const tally = (): Tally => ({ total: 0, retried: 0 });
	const summary = {
		attempts: attempts.length,
		retried: 0,
		gate: { judged: tally(), "different-word": tally(), "not-heard": tally() },
		sounds: { match: tally(), swapped: tally(), unclear: tally() },
		changed: 0,
	};
	for (const attempt of attempts) {
		const retried = attempt.next === "retried" ? 1 : 0;
		const rejudged = rejudgeAttempt(attempt, margins);
		summary.retried += retried;
		summary.gate[rejudged.gate.type].total++;
		summary.gate[rejudged.gate.type].retried += retried;
		for (const { verdict } of rejudged.judgement?.sounds ?? []) {
			summary.sounds[verdict.type].total++;
			summary.sounds[verdict.type].retried += retried;
		}
		if (!isDeepStrictEqual(withoutHeardWord(rejudged), withoutHeardWord(attempt.verdicts)))
			summary.changed++;
	}
	return summary;
}

export function renderEvidenceLogSummary(summary: EvidenceLogSummary): string {
	const line = (name: string, { total, retried }: Tally) =>
		`  ${name.padEnd(15)} ${String(total).padStart(5)}, retried after ${retried}`;
	return [
		`${summary.attempts} attempts, ${summary.retried} retried, ${summary.changed} judged differently now.`,
		"Word gate:",
		...Object.entries(summary.gate).map(([name, tally]) => line(name, tally)),
		"Judged sounds:",
		...Object.entries(summary.sounds).map(([name, tally]) => line(name, tally)),
	].join("\n");
}

/** `harness import-evidence-log [--out=<name>]`: export the log and judge it. */
export async function importEvidenceLogCommand(
	args: readonly string[],
	outputDir: string,
	env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
	const name = args.find((arg) => arg.startsWith("--out="))?.slice("--out=".length) ?? "attempts";
	if (!/^[\w.-]+$/.test(name) || args.some((arg) => !arg.startsWith("--out="))) {
		throw new Error("Usage: bun run harness import-evidence-log [--out=<name>]");
	}
	const databaseUrl = env.EVIDENCE_LOG_DATABASE_URL?.trim();
	const authToken = env.EVIDENCE_LOG_READ_TOKEN?.trim();
	if (!databaseUrl || !authToken) {
		throw new Error(
			"Set EVIDENCE_LOG_DATABASE_URL and EVIDENCE_LOG_READ_TOKEN (a read-only token) in packages/pronunciation/.env",
		);
	}
	const attempts = await fetchEvidenceLog({ databaseUrl, authToken });
	const file = path.join(outputDir, "evidence-log", `${name}.json`);
	await writeEvidenceLogExport(file, attempts);
	console.log(renderEvidenceLogSummary(summarizeEvidenceLog(await loadEvidenceLog(file))));
	console.log(`Export: ${path.relative(process.cwd(), file)}`);
}

/** `harness judge-evidence-log <export.json>`: judge an export again, offline. */
export async function judgeEvidenceLogCommand(file: string): Promise<void> {
	console.log(renderEvidenceLogSummary(summarizeEvidenceLog(await loadEvidenceLog(file))));
}
