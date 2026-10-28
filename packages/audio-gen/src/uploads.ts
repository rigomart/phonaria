import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseMarks } from "./check-clips";
import { compareWithCurrentCode, type Plan, type PlanChange } from "./generation";
import { voiceFolderName } from "./manifest";
import { findAzureAudioFormat } from "./providers/azure";
import {
	assertSheetIsCurrent,
	REVIEW_SHEET_FILE,
	readChecks,
	readReviewSheet,
} from "./review-sheet";
import { formSlug, isFormSlug } from "./word-forms";

export type UploadOptions = {
	/** Batches to publish together: a batch and the retake batches that replace its clips. */
	outputDirs: string[];
	accent: string;
	voice: string;
	bucket?: string;
	concurrency?: number;
	dryRun?: boolean;
	overwrite?: boolean;
	/** Upload the rest when some clips are left out because the manifest already lists their words. */
	skipRecorded?: boolean;
};
type UploadClip = {
	key: string;
	file: string;
	size: number;
	sha256: string;
	contentType: string;
};
/** A generated clip the guard keeps out of the bucket, and why. */
export type LeftOutClip = {
	key: string;
	file: string;
	kind: "marked no" | PlanChange["kind"];
	reason: string;
};
type UploadEntry = UploadClip & {
	uploadedAt: string | null;
	verified: boolean;
	error?: string;
};
type Runner = (executable: string, args: string[]) => Promise<void>;
type Dependencies = { runner?: Runner; fetcher?: typeof fetch; log?: (line: string) => void };
const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const WRANGLER = path.join(REPO_ROOT, "apps/phonaria/node_modules/.bin/wrangler");
const PUBLIC_ASSETS = "https://assets.rigos.dev";

function object(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value))
		throw new Error("Invalid upload plan object");
	return value as Record<string, unknown>;
}

function validateOptions(options: UploadOptions) {
	if (!options.outputDirs.length || options.outputDirs.some((dir) => !dir.trim()))
		throw new Error("--out needs a directory");
	if (new Set(options.outputDirs).size !== options.outputDirs.length)
		throw new Error("--out lists a directory twice");
	if (!/^[a-z]{2}-[a-z0-9]+$/.test(options.accent)) throw new Error("Invalid --accent");
	if (!/^[a-z]+$/.test(options.voice)) throw new Error("--voice must be a lowercase voice name");
	if (!/^[a-z0-9][a-z0-9-]*$/.test(options.bucket ?? "rigos-assets"))
		throw new Error("Invalid --bucket");
	const concurrency = options.concurrency ?? 8;
	if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32)
		throw new Error("--concurrency must be an integer from 1 to 32");
}

export function parseUploadArguments(args: string[]): UploadOptions {
	const values: Record<string, string> = {};
	const outputDirs: string[] = [];
	let dryRun = false;
	let overwrite = false;
	let skipRecorded = false;
	for (const arg of args) {
		if (arg === "--dry-run") dryRun = true;
		else if (arg === "--overwrite") overwrite = true;
		else if (arg === "--skip-recorded") skipRecorded = true;
		else if (arg.startsWith("--out=") && arg.length > 6)
			outputDirs.push(path.resolve(arg.slice(6)));
		else {
			const match = /^--(accent|voice|bucket|concurrency)=(.+)$/.exec(arg);
			if (!match || values[match[1]] !== undefined)
				throw new Error(`Unknown, empty, or repeated argument: ${arg}`);
			values[match[1]] = match[2];
		}
	}
	if (!outputDirs.length || !values.accent || !values.voice)
		throw new Error(
			"Usage: upload --out=path [--out=retakes]... --accent=en-us --voice=jenny [--dry-run]",
		);
	if (values.concurrency && !/^\d+$/.test(values.concurrency))
		throw new Error("--concurrency must be an integer from 1 to 32");
	const options = {
		outputDirs,
		accent: values.accent,
		voice: values.voice,
		bucket: values.bucket ?? "rigos-assets",
		concurrency: values.concurrency === undefined ? 8 : Number(values.concurrency),
		dryRun,
		overwrite,
		skipRecorded,
	};
	validateOptions(options);
	return options;
}

/** `slug` is the word, or word--n for an extra form of it. */
export function buildUploadKey(accent: string, voice: string, slug: string, extension: string) {
	validateOptions({ outputDirs: ["."], accent, voice });
	if (!isFormSlug(slug) || !["ogg", "mp3"].includes(extension))
		throw new Error("Invalid recording word or extension");
	return `audio/${accent}/words/${voice}/${slug}.${extension}`;
}

const listed = (files: readonly string[]) =>
	`${files.slice(0, 5).join(", ")}${files.length > 5 ? `, and ${files.length - 5} more` : ""}`;

/**
 * The clips of one checked, marked batch that may go up. Refuses the batch unless every
 * sample is generated with a matching checksum, `checks.json` covers it, and every clip on
 * its sheet is marked yes or no in `review.tsv`. Leaves out each clip marked no and each
 * sample the current code would no longer plan the same way.
 */
async function prepareBatch(
	outputDir: string,
	options: Pick<UploadOptions, "accent" | "voice">,
): Promise<{ clips: UploadClip[]; leftOut: LeftOutClip[] }> {
	const plan = object(JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8")));
	const settings = object(plan.settings);
	if (plan.version !== 1 || plan.targetAccent !== options.accent)
		throw new Error("Plan version or accent does not match upload options");
	if (typeof settings.voiceId !== "string" || voiceFolderName(settings.voiceId) !== options.voice)
		throw new Error("--voice must match the plan's manifest voice folder");
	const format = findAzureAudioFormat(settings.outputFormat);
	if (!format) throw new Error("Unsupported plan audio format");
	if (!Array.isArray(plan.samples) || !plan.samples.length)
		throw new Error("Plan needs at least one generated sample");
	const slugs = new Set<string>();
	const clips: UploadClip[] = [];
	for (const value of plan.samples) {
		const sample = object(value);
		if (
			typeof sample.word !== "string" ||
			sample.status !== "generated" ||
			typeof sample.sha256 !== "string" ||
			!/^[a-f0-9]{64}$/.test(sample.sha256)
		)
			throw new Error(`Sample must be generated with a SHA-256 checksum: ${sample.word}`);
		const n = sample.form === undefined ? undefined : object(sample.form).n;
		if (n !== undefined && (typeof n !== "number" || !Number.isInteger(n)))
			throw new Error(`Invalid form number for ${sample.word}`);
		const slug = formSlug(sample.word, n);
		const key = buildUploadKey(options.accent, options.voice, slug, format.extension);
		if (slugs.has(slug)) throw new Error(`Duplicate plan recording: ${slug}`);
		slugs.add(slug);
		if (sample.file !== `audio/${slug}.${format.extension}`)
			throw new Error(`Unexpected recording path: ${sample.file}`);
		const file = path.resolve(outputDir, sample.file);
		const audio = await readFile(file);
		if (!audio.length || createHash("sha256").update(audio).digest("hex") !== sample.sha256)
			throw new Error(`Recording is empty or checksum does not match: ${sample.file}`);
		clips.push({
			key,
			file,
			size: audio.length,
			sha256: sample.sha256,
			contentType: format.contentType,
		});
	}

	const planFiles = (plan.samples as { file: string }[]).map(({ file }) => file);
	const checks = await readChecks(outputDir);
	const checked = new Set(checks.map(({ file }) => file));
	const unchecked = planFiles.filter((file) => !checked.has(file));
	if (unchecked.length)
		throw new Error(`${outputDir}: checks.json has no results for ${listed(unchecked)}; run check`);
	const sheet = await readReviewSheet(outputDir);
	if (!sheet)
		throw new Error(
			`${outputDir} has no ${REVIEW_SHEET_FILE}; run sample (or sample --adopt) and mark its clips`,
		);
	await assertSheetIsCurrent(outputDir, plan.samples as unknown[], checks);
	const marks = parseMarks(await readFile(path.join(outputDir, "review.tsv"), "utf8"));
	const offPlan = sheet.filter(({ file }) => !planFiles.includes(file)).map(({ file }) => file);
	if (offPlan.length)
		throw new Error(
			`${outputDir}: ${REVIEW_SHEET_FILE} lists clips not in the plan: ${listed(offPlan)}`,
		);
	const unmarked = sheet.filter(({ file }) => !marks.has(file)).map(({ file }) => file);
	if (unmarked.length)
		throw new Error(
			`${outputDir}: ${unmarked.length} of ${sheet.length} clips on ${REVIEW_SHEET_FILE} aren't marked yes or no in review.tsv: ${listed(unmarked)}`,
		);

	const { changed } = compareWithCurrentCode(plan as Plan, format.extension);
	const kept: UploadClip[] = [];
	const leftOut: LeftOutClip[] = [];
	planFiles.forEach((file, index) => {
		const clip = clips[index];
		const mark = marks.get(file);
		const change = changed.get(file);
		if (mark && !mark.accepted)
			leftOut.push({
				key: clip.key,
				file: clip.file,
				kind: "marked no",
				reason: mark.notes || "marked no",
			});
		else if (change) leftOut.push({ key: clip.key, file: clip.file, ...change });
		else kept.push(clip);
	});
	return { clips: kept, leftOut };
}

/**
 * The clips of every batch to publish in one run. Two batches may not publish the same key:
 * mark one of the two clips no.
 */
export async function prepareUploads(
	options: UploadOptions,
): Promise<{ clips: UploadClip[]; leftOut: LeftOutClip[] }> {
	validateOptions(options);
	const batches = [];
	for (const dir of options.outputDirs) batches.push(await prepareBatch(dir, options));
	const clips = batches.flatMap((batch) => batch.clips);
	const byKey = new Map<string, string[]>();
	for (const { key, file } of clips) byKey.set(key, [...(byKey.get(key) ?? []), file]);
	const twice = [...byKey].filter(([, files]) => files.length > 1);
	if (twice.length)
		throw new Error(
			twice
				.map(([key, files]) => `${key} comes from ${files.join(" and ")}; mark all but one no`)
				.join("\n"),
		);
	return { clips, leftOut: batches.flatMap((batch) => batch.leftOut) };
}

export function uploadArguments(bucket: string, clip: UploadClip): string[] {
	return [
		"r2",
		"object",
		"put",
		`${bucket}/${clip.key}`,
		`--file=${clip.file}`,
		`--content-type=${clip.contentType}`,
		"--remote",
	];
}

const runWrangler: Runner = (executable, args) =>
	new Promise((resolve, reject) => {
		const child = spawn(executable, args, { cwd: REPO_ROOT, stdio: "inherit", shell: false });
		child.once("error", reject);
		child.once("exit", (code, signal) => {
			if (code === 0) resolve();
			else reject(new Error(`Wrangler failed (${signal ?? code})`));
		});
	});

async function forEachConcurrent<T>(
	items: T[],
	concurrency: number,
	action: (item: T) => Promise<void>,
) {
	let next = 0;
	const results = await Promise.allSettled(
		Array.from({ length: Math.min(concurrency, items.length) }, async () => {
			while (next < items.length) await action(items[next++]);
		}),
	);
	const failure = results.find((result) => result.status === "rejected");
	if (failure?.status === "rejected") throw failure.reason;
}

async function head(fetcher: typeof fetch, key: string) {
	return fetcher(`${PUBLIC_ASSETS}/${key}`, {
		method: "HEAD",
		redirect: "error",
		signal: AbortSignal.timeout(15_000),
	});
}

export async function runUpload(options: UploadOptions, dependencies: Dependencies = {}) {
	const { clips, leftOut } = await prepareUploads(options);
	const log = dependencies.log ?? console.log;
	for (const clip of clips) log(`${clip.key} ↔ ${clip.file}`);
	for (const clip of leftOut) log(`Left out ${clip.file}: ${clip.kind}: ${clip.reason}`);
	const kinds = new Map<string, number>();
	for (const { kind } of leftOut) kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
	const summary = `${clips.length} clips to upload; ${leftOut.length} left out${
		kinds.size ? ` (${[...kinds].map(([kind, count]) => `${count} ${kind}`).join(", ")})` : ""
	}.`;
	const recorded = leftOut.filter(({ kind }) => kind === "already recorded");
	const recordedWarning = `${recorded.length} clips are left out because the manifest already lists their words, as after a partial upload; check the earlier upload records, then pass --skip-recorded to upload the rest.`;
	if (options.dryRun) {
		if (recorded.length && !options.skipRecorded) log(recordedWarning);
		log(`Dry run: ${summary} No uploads or network requests.`);
		return;
	}
	if (recorded.length && !options.skipRecorded) throw new Error(recordedWarning);
	log(summary);
	if (!clips.length) throw new Error("Nothing to upload");
	const fetcher = dependencies.fetcher ?? fetch;
	const runner = dependencies.runner ?? runWrangler;
	const concurrency = options.concurrency ?? 8;
	const bucket = options.bucket ?? "rigos-assets";
	const conflicts: string[] = [];
	await forEachConcurrent(clips, concurrency, async ({ key }) => {
		try {
			const response = await head(fetcher, key);
			if (response.status === 200 && !options.overwrite)
				conflicts.push(`Object exists: ${key}; use a new voice folder or explicit --overwrite`);
			else if (response.status !== 200 && response.status !== 404)
				conflicts.push(`Cannot check ${key}: HTTP ${response.status}`);
		} catch {
			conflicts.push(`HEAD request failed for ${key}; no uploads started`);
		}
	});
	if (conflicts.length) throw new Error(conflicts.join("\n"));

	const startedAt = new Date().toISOString();
	const recordName = `upload-${Date.now()}-${randomUUID()}.json`;
	const recordPaths = options.outputDirs.map((dir) => path.join(dir, recordName));
	const entries: UploadEntry[] = clips.map((clip) => ({
		...clip,
		uploadedAt: null,
		verified: false,
	}));
	let checkpoint = Promise.resolve();
	const saveRecord = () => {
		const contents = `${JSON.stringify(
			{ bucket, startedAt, batches: options.outputDirs, entries, leftOut },
			null,
			2,
		)}\n`;
		checkpoint = checkpoint.then(async () => {
			for (const recordPath of recordPaths) {
				await writeFile(`${recordPath}.tmp`, contents);
				await rename(`${recordPath}.tmp`, recordPath);
			}
		});
		return checkpoint;
	};
	await saveRecord();
	await forEachConcurrent(entries, concurrency, async (entry) => {
		try {
			await runner(WRANGLER, uploadArguments(bucket, entry));
			entry.uploadedAt = new Date().toISOString();
			const response = await head(fetcher, entry.key);
			const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
			if (
				response.status !== 200 ||
				contentType !== entry.contentType ||
				response.headers.get("content-length") !== String(entry.size)
			)
				throw new Error(
					`Verification failed for ${entry.key}: HTTP ${response.status}, type ${contentType}, length ${response.headers.get("content-length")}`,
				);
			entry.verified = true;
		} catch (error) {
			entry.error = error instanceof Error ? error.message : "Upload failed";
		}
		await saveRecord();
	});
	const uploaded = entries.filter(({ uploadedAt }) => uploadedAt).length;
	const verified = entries.filter(({ verified }) => verified).length;
	log(
		`${uploaded}/${entries.length} uploaded; ${verified}/${entries.length} verified. Record: ${recordPaths.join(", ")}`,
	);
	const failures = entries.filter(({ verified }) => !verified);
	if (failures.length)
		throw new Error(failures.map(({ key, error }) => `${key}: ${error}`).join("\n"));
	return recordPaths;
}

/**
 * Writes an upload record for a batch published before upload records existed, such as the
 * minimal-pair catalog, which was uploaded by hand. Downloads each clip of the plan from the
 * public host and marks it verified only when its bytes match the plan's checksum, so
 * `manifest` lists exactly the clips that are live. Fails when any clip doesn't match.
 */
export async function recordPublished(
	options: Pick<UploadOptions, "outputDirs" | "accent" | "voice" | "concurrency">,
	dependencies: Pick<Dependencies, "fetcher" | "log"> = {},
) {
	validateOptions(options);
	const fetcher = dependencies.fetcher ?? fetch;
	const log = dependencies.log ?? console.log;
	const recordName = `upload-${Date.now()}-${randomUUID()}.json`;
	const failures: string[] = [];
	for (const outputDir of options.outputDirs) {
		const plan = object(JSON.parse(await readFile(path.join(outputDir, "plan.json"), "utf8")));
		const settings = object(plan.settings);
		if (plan.targetAccent !== options.accent)
			throw new Error(`${outputDir}: the plan's accent does not match --accent`);
		if (typeof settings.voiceId !== "string" || voiceFolderName(settings.voiceId) !== options.voice)
			throw new Error(`${outputDir}: --voice must match the plan's manifest voice folder`);
		const format = findAzureAudioFormat(settings.outputFormat);
		if (!format || !Array.isArray(plan.samples)) throw new Error(`${outputDir}: unusable plan`);
		const startedAt = new Date().toISOString();
		const entries: UploadEntry[] = plan.samples.map((value) => {
			const sample = object(value);
			const n = sample.form === undefined ? undefined : object(sample.form).n;
			if (typeof sample.word !== "string" || typeof sample.sha256 !== "string")
				throw new Error(`${outputDir}: a sample has no word or checksum`);
			const slug = formSlug(sample.word, typeof n === "number" ? n : undefined);
			return {
				key: buildUploadKey(options.accent, options.voice, slug, format.extension),
				file: path.resolve(outputDir, String(sample.file)),
				size: 0,
				sha256: sample.sha256,
				contentType: format.contentType,
				uploadedAt: null,
				verified: false,
			};
		});
		await forEachConcurrent(entries, options.concurrency ?? 8, async (entry) => {
			try {
				const response = await fetcher(`${PUBLIC_ASSETS}/${entry.key}`, {
					redirect: "error",
					signal: AbortSignal.timeout(15_000),
				});
				if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
				const audio = Buffer.from(await response.arrayBuffer());
				entry.size = audio.length;
				if (createHash("sha256").update(audio).digest("hex") !== entry.sha256)
					throw new Error("the published bytes don't match the plan's checksum");
				entry.verified = true;
			} catch (error) {
				entry.error = error instanceof Error ? error.message : "Download failed";
				failures.push(`${entry.key}: ${entry.error}`);
			}
		});
		const recordPath = path.join(outputDir, recordName);
		const record = {
			checked: PUBLIC_ASSETS,
			startedAt,
			batches: [outputDir],
			entries,
			leftOut: [],
		};
		await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
		const verified = entries.filter((entry) => entry.verified).length;
		log(
			`${outputDir}: ${verified}/${entries.length} clips match what is published. Record: ${recordPath}`,
		);
	}
	if (failures.length) throw new Error(failures.join("\n"));
}
