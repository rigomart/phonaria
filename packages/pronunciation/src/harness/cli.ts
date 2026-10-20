import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnglishPhonemeContrasts } from "@phonaria/phonetics-data";
import { AZURE_JUDGE_THRESHOLDS } from "../azure/judge-thresholds";
import type { ScoringRequest, TargetWord } from "../contract";
import { type JudgeMargins, LENIENT_MARGINS } from "../judge";
import { createAzureHarnessScorer, type FetchStats, retryingFetch } from "./azure";
import {
	buildCatalogCases,
	caseForClip,
	type HarnessCase,
	recordingWordList,
	targetWordFor,
} from "./cases";
import { importEvidenceLogCommand, judgeEvidenceLogCommand } from "./evidence-log";
import { importInvestigation } from "./investigation";
import type { JudgedSounds, ScoredCase } from "./metrics";
import { buildReport, renderMarkdown, type SourceSummary } from "./report";
import { mapWithConcurrency, type ScoringJob, scoreJobs } from "./scoring";
import {
	assertFfmpeg,
	folderSources,
	loadCatalogSource,
	loadClips,
	loadFolderSource,
	loadVoicesSource,
	type Recording,
	type SourceLoad,
	toScorerWav,
} from "./sources";
import { soundOccurrences, tuneThresholds } from "./tune";
import {
	leaveOneSourceOut,
	ratesBySource,
	renderTuneReport,
	serializeThresholds,
	thresholdsFile,
} from "./tune-report";

const OUTPUT_DIR = fileURLToPath(new URL("../../output", import.meta.url));
const THRESHOLDS_FILE = fileURLToPath(new URL("../azure/judge-thresholds.json", import.meta.url));

const TUNE_SOURCES = [
	"--catalog",
	`--tts-dir=${path.join(OUTPUT_DIR, "tts", "guy")}`,
	`--tts-dir=${path.join(OUTPUT_DIR, "tts", "aria")}`,
];

const USAGE = `Usage:
  bun run harness words [--json]
  bun run harness run [--catalog] [--audio-dir=<dir>] [--tts-dir=[name=]<dir>]... [--voices-dir=<dir>]
                      [--clips=<manifest.json>]... [--offline] [--concurrency=4]
                      [--contrasts=i-ix,th-s] [--judged=every|contrast] [--margins=tuned|lenient]
                      [--report=report] [--max-throttled=100]
  bun run harness tune [--check] [sources as for run]
  bun run harness import-investigation <dir>
  bun run harness import-evidence-log [--out=attempts]
  bun run harness judge-evidence-log <export.json>

Paths are relative to packages/pronunciation. With no source given, run uses --catalog
and tune uses the catalog recordings in Jenny, Guy and Aria.`;

const SWEEP: readonly JudgeMargins[] = [
	LENIENT_MARGINS,
	{ ...LENIENT_MARGINS, swap: 0.1 },
	{ ...LENIENT_MARGINS, swap: 0.35 },
	{ ...LENIENT_MARGINS, swap: 0.5 },
	{ ...LENIENT_MARGINS, match: 0 },
];

type RunOptions = {
	catalog: boolean;
	audioDir?: string;
	ttsDirs: string[];
	voicesDir?: string;
	clips: string[];
	offline: boolean;
	concurrency: number;
	contrasts?: string[];
	judged: JudgedSounds;
	margins: "tuned" | "lenient";
	report: string;
	maxThrottled: number;
};

function parseRunOptions(args: readonly string[]): RunOptions {
	const options: RunOptions = {
		catalog: false,
		ttsDirs: [],
		clips: [],
		offline: false,
		concurrency: 4,
		judged: "every",
		margins: "tuned",
		report: "report",
		maxThrottled: 100,
	};
	for (const arg of args) {
		const [flag, value = ""] = arg.split(/=(.*)/s, 2);
		if (flag === "--catalog") options.catalog = true;
		else if (flag === "--offline") options.offline = true;
		else if (flag === "--audio-dir" && value) options.audioDir = value;
		else if (flag === "--tts-dir" && value) options.ttsDirs.push(value);
		else if (flag === "--voices-dir" && value) options.voicesDir = value;
		else if (flag === "--clips" && value) options.clips.push(value);
		else if (flag === "--report" && /^[\w.-]+$/.test(value)) options.report = value;
		else if (flag === "--contrasts" && value) options.contrasts = value.split(",");
		else if (flag === "--judged" && (value === "every" || value === "contrast")) {
			options.judged = value;
		} else if (flag === "--margins" && (value === "tuned" || value === "lenient")) {
			options.margins = value;
		} else if ((flag === "--concurrency" || flag === "--max-throttled") && /^\d+$/.test(value)) {
			if (flag === "--concurrency") options.concurrency = Math.max(1, Number(value));
			else options.maxThrottled = Number(value);
		} else throw new Error(`Unknown or incomplete argument: ${arg}\n\n${USAGE}`);
	}
	if (
		!options.audioDir &&
		options.ttsDirs.length === 0 &&
		!options.voicesDir &&
		options.clips.length === 0
	) {
		options.catalog = true;
	}
	return options;
}

function printWords(json: boolean) {
	const list = recordingWordList();
	if (json) {
		console.log(JSON.stringify(list, null, "\t"));
		return;
	}
	for (const { contrastId, words } of list)
		console.log(`${contrastId.padEnd(6)} ${words.join(" ")}`);
	console.log(`\n${list.length} contrasts, ${list.flatMap((pair) => pair.words).length} words.`);
}

async function scoreSources(options: RunOptions) {
	await assertFfmpeg();
	const contrasts = options.contrasts
		? EnglishPhonemeContrasts.filter((contrast) => options.contrasts?.includes(contrast.id))
		: EnglishPhonemeContrasts;
	if (contrasts.length === 0) throw new Error("No contrast matches --contrasts");
	const inContrasts = new Set(contrasts.map((contrast) => contrast.id));
	const cases = buildCatalogCases(contrasts);
	const casesByRecording = new Map<string, HarnessCase[]>();
	for (const harnessCase of cases) {
		const list = casesByRecording.get(harnessCase.recordingWord) ?? [];
		list.push(harnessCase);
		casesByRecording.set(harnessCase.recordingWord, list);
	}
	const catalogWords = [...casesByRecording.keys()].sort();
	const recordingList = new Set(recordingWordList().flatMap((pair) => pair.words));

	const loads = new Map<string, SourceLoad>();
	if (options.catalog || options.audioDir) {
		loads.set(
			"tts:jenny",
			await loadCatalogSource({
				words: catalogWords,
				audioDir: options.audioDir && path.resolve(options.audioDir),
				downloadDir: path.join(OUTPUT_DIR, "audio", "jenny"),
				offline: options.offline,
			}),
		);
	}
	for (const { id, dir } of folderSources(options.ttsDirs, "tts", new Set(loads.keys()))) {
		loads.set(id, await loadFolderSource(dir, id, "tts", catalogWords));
	}
	if (options.voicesDir) {
		const expected = catalogWords.filter((word) => recordingList.has(word));
		for (const [id, load] of await loadVoicesSource(
			path.resolve(options.voicesDir),
			expected,
			new Set(catalogWords),
		)) {
			loads.set(id, load);
		}
	}

	const clips = (
		await Promise.all(options.clips.map((manifest) => loadClips(path.resolve(manifest))))
	)
		.flat()
		.map((clip) => ({ clip, harnessCase: caseForClip(clip) }))
		.filter(({ harnessCase }) => inContrasts.has(harnessCase.contrastId));
	const clipSources = new Map<string, number>();
	for (const { clip } of clips) {
		if (loads.has(clip.sourceId)) throw new Error(`Two sources are named ${clip.sourceId}`);
		clipSources.set(clip.sourceId, (clipSources.get(clip.sourceId) ?? 0) + 1);
	}

	const recordings = [...loads.values()].flatMap((load) => load.recordings);
	const wavDir = path.join(OUTPUT_DIR, "wav");
	const files = [
		...recordings.map((recording) => recording.file),
		...clips.map(({ clip }) => clip.file),
	];
	const audio = await mapWithConcurrency(files, 8, (file) => toScorerWav(file, wavDir));

	const targets = new Map<string, TargetWord>();
	const requestFor = (word: string): ScoringRequest => {
		let target = targets.get(word);
		if (!target) targets.set(word, (target = targetWordFor(word)));
		return { targetAccent: "en-us", words: [target] };
	};
	const pending: { recording: Recording; harnessCase: HarnessCase }[] = [];
	const jobs: ScoringJob[] = [];
	recordings.forEach((recording, index) => {
		for (const harnessCase of casesByRecording.get(recording.word) ?? []) {
			pending.push({ recording, harnessCase });
			jobs.push({ audio: audio[index], request: requestFor(harnessCase.targetWord) });
		}
	});
	clips.forEach(({ clip, harnessCase }, index) => {
		pending.push({ recording: { ...clip, word: clip.said }, harnessCase });
		jobs.push({ audio: audio[recordings.length + index], request: requestFor(clip.target) });
	});

	const fetchStats: FetchStats = { attempts: 0, throttled: 0, retried: 0 };
	const scorer = createAzureHarnessScorer({
		key: process.env.AZURE_SPEECH_KEY,
		region: process.env.AZURE_SPEECH_REGION,
		fetch: retryingFetch({ stats: fetchStats }),
	});
	const offline = options.offline || !process.env.AZURE_SPEECH_KEY;
	console.error(
		`${recordings.length} recordings, ${jobs.length} cases, ${options.judged === "every" ? "every sound" : "contrast sounds only"} judged${offline ? ", offline (cache only)" : ""}.`,
	);
	const { results, stats } = await scoreJobs(scorer, jobs, {
		cacheDir: path.join(OUTPUT_DIR, "cache"),
		offline,
		concurrency: options.concurrency,
		shouldStop: () =>
			fetchStats.throttled > options.maxThrottled
				? `stopped after ${fetchStats.throttled} throttled responses`
				: null,
		onProgress: (done, total, progress) => {
			if (done % 50 === 0 || done === total) {
				console.error(
					`  ${done}/${total} requests: ${progress.cacheHits} cached, ${progress.liveCalls} live, ${fetchStats.throttled} throttled, ${progress.failed} failed`,
				);
			}
		},
	});

	const scored: ScoredCase[] = [];
	const failures = new Set<string>();
	results.forEach((result, index) => {
		const { recording, harnessCase } = pending[index];
		if (result.type === "scored") {
			scored.push({
				case: harnessCase,
				recordingId: recording.file,
				sourceId: recording.sourceId,
				sourceKind: recording.sourceKind,
				evidence: result.evidence.words[0],
				transcript: result.evidence.transcript,
			});
		} else if (result.type === "failed") {
			failures.add(
				`${recording.sourceId} ${recording.word} as ${harnessCase.targetWord}: ${result.error}`,
			);
		}
	});
	if (fetchStats.throttled > options.maxThrottled) {
		failures.add(`Stopped calling Azure after ${fetchStats.throttled} throttled responses`);
	}
	return { loads, clipSources, scorer, stats, fetchStats, failures, scored, cases: jobs.length };
}

async function runHarness(options: RunOptions) {
	const { loads, clipSources, scorer, stats, fetchStats, failures, scored, cases } =
		await scoreSources(options);

	const sources: SourceSummary[] = [
		...[...loads].map(([id, load]): SourceSummary => ({
			id,
			kind: id.startsWith("real:") ? "real" : "tts",
			recordings: load.recordings.length,
			missing: load.missing,
			neither: load.neither,
			relabelled: load.relabelled,
		})),
		...[...clipSources].map(([id, recordings]): SourceSummary => ({
			id,
			kind: id.startsWith("real:") ? "real" : "tts",
			recordings,
			missing: [],
			neither: [],
			relabelled: [],
		})),
	];
	const report = buildReport({
		generatedAt: new Date().toISOString(),
		scorer: { id: scorer.id, settings: scorer.settings },
		margins: options.margins === "tuned" ? AZURE_JUDGE_THRESHOLDS : LENIENT_MARGINS,
		judged: options.judged,
		sweep: SWEEP,
		sources,
		scoring: {
			uniqueRequests: stats.cacheHits + stats.liveCalls + stats.uncached,
			cacheHits: stats.cacheHits,
			liveCalls: stats.liveCalls,
			attempts: fetchStats.attempts,
			throttled: fetchStats.throttled,
			uncached: stats.uncached,
			failed: stats.failed,
			failures: [...failures],
		},
		scored,
		unscoredCases: cases - scored.length,
	});

	await mkdir(OUTPUT_DIR, { recursive: true });
	const base = path.join(OUTPUT_DIR, options.report);
	await writeFile(`${base}.json`, `${JSON.stringify(report, null, "\t")}\n`);
	await writeFile(`${base}.md`, renderMarkdown(report));

	for (const [id, group] of Object.entries(report.groups)) {
		const { rates } = group.overall;
		const pct = (value: number | null) => (value === null ? "–" : `${(value * 100).toFixed(1)}%`);
		console.log(
			`${id.padEnd(14)} false flag ${pct(rates.falseFlag)} (recordings ${pct(rates.falseFlagRecordings)}), swap named ${pct(rates.swapNamed)}, unclear ${pct(rates.unclear)}, no evidence ${pct(rates.noEvidence)}`,
		);
	}
	for (const [id, load] of loads) {
		if (id.startsWith("real:") && load.missing.length > 0) {
			console.log(`${id} is missing ${load.missing.length} words: ${load.missing.join(", ")}`);
		}
	}
	console.log(
		`Live calls ${stats.liveCalls}, cached ${stats.cacheHits}, uncached ${stats.uncached}, failed ${stats.failed}. Report: ${path.relative(process.cwd(), base)}.{json,md}`,
	);
	if (stats.uncached > 0 || stats.failed > 0) process.exitCode = 1;
}

async function tuneCommand(args: readonly string[]) {
	const check = args.includes("--check");
	const sourceArgs = args.filter((arg) => arg !== "--check");
	const options = parseRunOptions(sourceArgs.length > 0 ? sourceArgs : TUNE_SOURCES);
	const { scored, stats, scorer } = await scoreSources({
		...options,
		offline: true,
		judged: "every",
	});
	if (scorer.id !== "azure") throw new Error(`No thresholds file for scorer ${scorer.id}`);
	if (stats.uncached > 0 || stats.failed > 0) {
		throw new Error(
			`${stats.uncached + stats.failed} requests aren't cached; run the harness first`,
		);
	}

	const occurrences = soundOccurrences(scored, LENIENT_MARGINS);
	const tuning = tuneThresholds(occurrences, { base: LENIENT_MARGINS });
	const before = ratesBySource(scored, LENIENT_MARGINS);
	const contents = serializeThresholds(
		thresholdsFile(tuning, { id: scorer.id, settings: scorer.settings }, before),
	);
	const after = ratesBySource(scored, tuning.thresholds);
	const report = renderTuneReport({
		tuning,
		before,
		after,
		heldOut: leaveOneSourceOut(scored, occurrences, LENIENT_MARGINS),
	});
	await mkdir(OUTPUT_DIR, { recursive: true });
	await writeFile(path.join(OUTPUT_DIR, "tune.md"), report);

	for (const [id, rates] of after) {
		const was = before.get(id);
		console.log(
			`${id.padEnd(14)} recordings flagged ${was?.flagged} -> ${rates.flagged} of ${rates.recordings}, swaps named ${was?.named} -> ${rates.named} of ${rates.swaps}`,
		);
	}
	const relative = path.relative(process.cwd(), THRESHOLDS_FILE);
	if (check) {
		const committed = await readFile(THRESHOLDS_FILE, "utf8").catch(() => "");
		if (committed !== contents) {
			console.error(`${relative} is out of date: run bun run harness tune`);
			process.exitCode = 1;
			return;
		}
		console.log(`${relative} matches the cached results.`);
		return;
	}
	await writeFile(THRESHOLDS_FILE, contents);
	console.log(
		`Wrote ${relative}. Report: ${path.relative(process.cwd(), path.join(OUTPUT_DIR, "tune.md"))}`,
	);
}

async function main() {
	const [command, ...args] = process.argv.slice(2);
	if (command === "words") return printWords(args.includes("--json"));
	if (command === "run") return runHarness(parseRunOptions(args));
	if (command === "tune") return tuneCommand(args);
	if (command === "import-evidence-log") return importEvidenceLogCommand(args, OUTPUT_DIR);
	if (command === "judge-evidence-log" && args[0]) {
		return judgeEvidenceLogCommand(path.resolve(args[0]));
	}
	if (command === "import-investigation" && args[0]) {
		const { manifest, clips, seeded } = await importInvestigation({
			dir: path.resolve(args[0]),
			outputDir: OUTPUT_DIR,
		});
		console.log(
			`${clips} clips, ${seeded} responses newly cached. Run: bun run harness run --clips=${path.relative(process.cwd(), manifest)}`,
		);
		return;
	}
	throw new Error(USAGE);
}

void main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : "Harness failed");
	process.exitCode = 1;
});
