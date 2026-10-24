import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { toBasePhonemeIds } from "@phonaria/phonetics-data";
import type { RecordingEvidence, ScoringRequest } from "@phonaria/pronunciation";
import type { PronunciationLookup, WordFinder } from "@phonaria/pronunciation";
import {
	type HarnessScorer,
	mapWithConcurrency,
	type ScoringStats,
	scoreJobs,
	toScorerWav,
} from "@phonaria/pronunciation/harness";
import { analyzeClip, type ClipAudio, DECODE_SAMPLE_RATE, decodeClip } from "./clip-audio";
import {
	audioChecks,
	type CheckName,
	checkNames,
	type ClipChecks,
	type ClipTarget,
	failedChecks,
	median,
	scoreChecks,
	scoreFromEvidence,
} from "./clip-checks";

type PlanSample = {
	word: string;
	form?: { n?: number; label: string };
	variant: string;
	ipa: string;
	file: string;
	status: string;
	pickedFor?: readonly string[];
};

export type ClipResult = {
	readonly file: string;
	readonly word: string;
	readonly form?: string;
	readonly ipa: string;
	readonly pickedFor?: readonly string[];
	readonly audio: ClipAudio;
	/** `scored`, or why Azure's checks didn't run. */
	readonly scoring: "scored" | "uncached" | `failed: ${string}`;
	readonly checks: ClipChecks;
	readonly failed: readonly CheckName[];
};

export type BatchOptions = {
	readonly scorer: HarnessScorer<unknown>;
	readonly cacheDir: string;
	readonly wavDir: string;
	readonly pronunciationsOf: PronunciationLookup;
	readonly findWord: WordFinder;
	readonly offline?: boolean;
	readonly concurrency?: number;
	readonly onProgress?: (done: number, total: number, stats: ScoringStats) => void;
	readonly shouldStop?: () => string | null;
};

/** Runs every check on the generated clips listed in the directory's `plan.json`. */
export async function checkBatch(
	dir: string,
	options: BatchOptions,
): Promise<{ clips: ClipResult[]; stats: ScoringStats }> {
	const plan = JSON.parse(await readFile(path.join(dir, "plan.json"), "utf8")) as {
		samples: PlanSample[];
	};
	const samples = plan.samples.filter(({ status }) => status === "generated");
	if (!samples.length) throw new Error(`${dir} has no generated clips to check`);
	const prepared = await mapWithConcurrency(samples, 8, async (sample) => {
		const file = path.join(dir, sample.file);
		const target: ClipTarget = {
			word: sample.word,
			pronunciation: toBasePhonemeIds(sample.variant),
		};
		const request: ScoringRequest = {
			targetAccent: "en-us",
			words: [{ text: sample.word, acceptedPronunciations: [target.pronunciation] }],
		};
		return {
			sample,
			target,
			request,
			audio: analyzeClip(await decodeClip(file), DECODE_SAMPLE_RATE),
			wav: await toScorerWav(file, options.wavDir),
		};
	});
	const { results, stats } = await scoreJobs(
		options.scorer,
		prepared.map(({ wav, request }) => ({ audio: wav, request })),
		{
			cacheDir: options.cacheDir,
			offline: options.offline,
			concurrency: options.concurrency,
			onProgress: options.onProgress,
			shouldStop: options.shouldStop,
		},
	);
	const batchLevelDb = median(prepared.map(({ audio }) => audio.speechLevelDb));
	const clips = prepared.map(({ sample, target, audio }, index): ClipResult => {
		const result = results[index];
		const scored =
			result.type === "scored"
				? scoreChecks(
						scoreFromEvidence(result.evidence as RecordingEvidence, options.findWord),
						target,
						options.pronunciationsOf,
					)
				: {};
		const checks = { ...scored, ...audioChecks(audio, target.pronunciation.length, batchLevelDb) };
		return {
			file: sample.file,
			word: sample.word,
			...(sample.form ? { form: sample.form.label } : {}),
			ipa: sample.ipa,
			...(sample.pickedFor ? { pickedFor: sample.pickedFor } : {}),
			audio,
			scoring:
				result.type === "scored"
					? "scored"
					: result.type === "uncached"
						? "uncached"
						: `failed: ${result.error}`,
			checks,
			failed: failedChecks(checks),
		};
	});
	return { clips, stats };
}

const cell = (value: string) => value.replace(/[\t\n]/g, " ");

/** One row per clip: what was failed, then each check's numbers. */
export function checkSheet(clips: readonly ClipResult[]): string {
	const columns = ["file", "word", "form", "ipa", "picked_for", "scoring", "failed", ...checkNames];
	const rows = clips.map((clip) =>
		[
			clip.file,
			clip.word,
			clip.form ?? "",
			clip.ipa,
			(clip.pickedFor ?? []).join("; "),
			clip.scoring,
			clip.failed.join(" "),
			...checkNames.map((name) => {
				const check = clip.checks[name];
				return check ? `${check.passed ? "pass" : "FAIL"}: ${check.detail}` : "";
			}),
		]
			.map(cell)
			.join("\t"),
	);
	return `${[columns.join("\t"), ...rows].join("\n")}\n`;
}

export async function writeCheckOutputs(dir: string, clips: readonly ClipResult[]): Promise<void> {
	await writeFile(
		path.join(dir, "checks.json"),
		`${JSON.stringify({ checkedAt: new Date().toISOString(), clips }, null, 2)}\n`,
	);
	await writeFile(path.join(dir, "checks.tsv"), checkSheet(clips));
}

export type Mark = { readonly accepted: boolean; readonly notes: string };

/**
 * The dev's marks from `review.tsv`: `yes` or `no` in `accepted`, by file. Rows not
 * marked yet are left out. A file listed twice is refused, so a later yes can't hide a no.
 */
export function parseMarks(reviewTsv: string): Map<string, Mark> {
	const [header, ...rows] = reviewTsv.split(/\r?\n/).filter((line) => line.trim());
	const columns = header.split("\t");
	const fileColumn = columns.indexOf("file");
	const acceptedColumn = columns.indexOf("accepted");
	const notesColumn = columns.indexOf("notes");
	if (fileColumn === -1 || acceptedColumn === -1)
		throw new Error("review.tsv needs file and accepted columns");
	const marks = new Map<string, Mark>();
	const seen = new Set<string>();
	for (const row of rows) {
		const cells = row.split("\t");
		if (seen.has(cells[fileColumn]))
			throw new Error(`review.tsv lists ${cells[fileColumn]} twice; keep one row for it`);
		seen.add(cells[fileColumn]);
		const value = cells[acceptedColumn]?.trim().toLowerCase() ?? "";
		if (!value) continue;
		if (!["yes", "y", "no", "n"].includes(value))
			throw new Error(
				`review.tsv: accepted must be yes or no, not "${value}" (${cells[fileColumn]})`,
			);
		marks.set(cells[fileColumn], {
			accepted: value.startsWith("y"),
			notes: notesColumn === -1 ? "" : (cells[notesColumn] ?? "").trim(),
		});
	}
	return marks;
}
