import "dotenv/config";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	assertFfmpeg,
	createAzureHarnessScorer,
	curatedPronunciations,
	curatedWordFinder,
	type FetchStats,
	retryingFetch,
} from "@phonaria/pronunciation/harness";
import { checkBatch, type ClipResult, parseMarks, writeCheckOutputs } from "./check-clips";
import { renderCheckReport } from "./check-report";

const USAGE = `Usage: bun run check --out=<dir> [--known-good=<dir>]... [--offline] [--concurrency=4]
                      [--cache=output/cache] [--max-throttled=100]

Checks every generated clip in --out and writes checks.json, checks.tsv and checks.md there.
--known-good folders hold clips already reviewed by ear; they are only read, to count false
alarms. Paths are relative to packages/audio-gen.`;

export function parseCheckArguments(args: readonly string[]) {
	const options = {
		outputDir: "",
		knownGood: [] as string[],
		offline: false,
		concurrency: 4,
		cacheDir: "output/cache",
		maxThrottled: 100,
	};
	for (const arg of args) {
		const [flag, value = ""] = arg.split(/=(.*)/s, 2);
		if (flag === "--out") options.outputDir = value;
		else if (flag === "--known-good") options.knownGood.push(value);
		else if (flag === "--cache") options.cacheDir = value;
		else if (arg === "--offline") options.offline = true;
		else if (flag === "--concurrency" || flag === "--max-throttled") {
			if (!/^\d+$/.test(value) || Number(value) < 1)
				throw new Error(`${flag} needs a positive integer`);
			if (flag === "--concurrency") options.concurrency = Number(value);
			else options.maxThrottled = Number(value);
		} else throw new Error(`Unknown argument: ${arg}\n\n${USAGE}`);
	}
	if (!options.outputDir.trim()) throw new Error(`--out is required\n\n${USAGE}`);
	if ([options.cacheDir, ...options.knownGood].some((dir) => !dir.trim()))
		throw new Error("--cache and --known-good need a directory");
	return options;
}

async function main() {
	const args = process.argv.slice(2);
	if (args.includes("--help")) {
		console.log(USAGE);
		return;
	}
	const options = parseCheckArguments(args);
	await assertFfmpeg();
	const key = process.env.AZURE_SPEECH_KEY;
	const region = process.env.AZURE_SPEECH_REGION;
	const offline = options.offline || !key || !region;
	if (offline && !options.offline) console.log("No Azure key: using cached scores only.");
	const fetchStats: FetchStats = { attempts: 0, throttled: 0, retried: 0 };
	const scorer = createAzureHarnessScorer({
		key,
		region,
		fetch: retryingFetch({ stats: fetchStats }),
	});
	const cacheDir = path.resolve(options.cacheDir);
	const check = async (dir: string) => {
		const name = path.basename(dir);
		const { clips, stats } = await checkBatch(dir, {
			scorer,
			cacheDir,
			wavDir: path.join(path.dirname(cacheDir), "wav"),
			pronunciationsOf: curatedPronunciations,
			findWord: curatedWordFinder,
			offline,
			concurrency: options.concurrency,
			onProgress: (done, total) => {
				if (done % 50 === 0 || done === total) console.log(`${name}: scored ${done}/${total}`);
			},
			shouldStop: () =>
				fetchStats.throttled >= options.maxThrottled
					? `Azure throttled ${fetchStats.throttled} requests`
					: null,
		});
		console.log(
			`${name}: ${clips.length} clips, ${stats.cacheHits} cached, ${stats.liveCalls} scored live, ${stats.uncached} uncached, ${stats.failed} failed`,
		);
		return { name, clips };
	};

	const outputDir = path.resolve(options.outputDir);
	const batch = await check(outputDir);
	const knownGood: { name: string; clips: ClipResult[] }[] = [];
	for (const dir of options.knownGood) knownGood.push(await check(path.resolve(dir)));
	await writeCheckOutputs(outputDir, batch.clips);
	const reviewFile = path.join(outputDir, "review.tsv");
	const marks = (await exists(reviewFile))
		? parseMarks(await readFile(reviewFile, "utf8"))
		: new Map();
	const report = renderCheckReport({ batch, marks, knownGood });
	await writeFile(path.join(outputDir, "checks.md"), report);
	const failed = batch.clips.filter(({ failed }) => failed.length).length;
	console.log(
		`${failed} of ${batch.clips.length} clips failed a check; ${marks.size} marked by ear. See ${path.join(outputDir, "checks.md")}`,
	);
}

async function exists(file: string) {
	try {
		await access(file);
		return true;
	} catch {
		return false;
	}
}

if (import.meta.main) {
	void main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : "Checking clips failed");
		process.exitCode = 1;
	});
}
