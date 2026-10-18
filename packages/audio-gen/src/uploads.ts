import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { voiceFolderName } from "./manifest";
import { getAzureAudioFormat } from "./providers/azure";

export type UploadOptions = {
	outputDir: string;
	accent: string;
	voice: string;
	bucket?: string;
	concurrency?: number;
	dryRun?: boolean;
	overwrite?: boolean;
};
type UploadClip = {
	key: string;
	file: string;
	size: number;
	sha256: string;
	contentType: string;
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
	if (!options.outputDir.trim()) throw new Error("--out needs a directory");
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
	let dryRun = false;
	let overwrite = false;
	for (const arg of args) {
		if (arg === "--dry-run") dryRun = true;
		else if (arg === "--overwrite") overwrite = true;
		else {
			const match = /^--(out|accent|voice|bucket|concurrency)=(.+)$/.exec(arg);
			if (!match || values[match[1]] !== undefined)
				throw new Error(`Unknown, empty, or repeated argument: ${arg}`);
			values[match[1]] = match[2];
		}
	}
	if (!values.out || !values.accent || !values.voice)
		throw new Error("Usage: upload --out=path --accent=en-us --voice=jenny [--dry-run]");
	if (values.concurrency && !/^\d+$/.test(values.concurrency))
		throw new Error("--concurrency must be an integer from 1 to 32");
	const options = {
		outputDir: path.resolve(values.out),
		accent: values.accent,
		voice: values.voice,
		bucket: values.bucket ?? "rigos-assets",
		concurrency: values.concurrency === undefined ? 8 : Number(values.concurrency),
		dryRun,
		overwrite,
	};
	validateOptions(options);
	return options;
}

export function buildUploadKey(accent: string, voice: string, word: string, extension: string) {
	validateOptions({ outputDir: ".", accent, voice });
	if (!/^[a-z]+$/.test(word) || !["ogg", "mp3"].includes(extension))
		throw new Error("Invalid recording word or extension");
	return `audio/${accent}/words/${voice}/${word}.${extension}`;
}

export async function prepareUploads(options: UploadOptions): Promise<UploadClip[]> {
	validateOptions(options);
	const plan = object(
		JSON.parse(await readFile(path.join(options.outputDir, "plan.json"), "utf8")),
	);
	const settings = object(plan.settings);
	if (plan.version !== 1 || plan.targetAccent !== options.accent)
		throw new Error("Plan version or accent does not match upload options");
	if (typeof settings.voiceId !== "string" || voiceFolderName(settings.voiceId) !== options.voice)
		throw new Error("--voice must match the plan's manifest voice folder");
	const format = [getAzureAudioFormat("ogg"), getAzureAudioFormat("mp3")].find(
		({ outputFormat }) => outputFormat === settings.outputFormat,
	);
	if (!format) throw new Error("Unsupported plan audio format");
	if (!Array.isArray(plan.samples) || !plan.samples.length)
		throw new Error("Plan needs at least one generated sample");
	const words = new Set<string>();
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
		const key = buildUploadKey(options.accent, options.voice, sample.word, format.extension);
		if (words.has(sample.word)) throw new Error(`Duplicate plan word: ${sample.word}`);
		words.add(sample.word);
		if (sample.file !== `audio/${sample.word}.${format.extension}`)
			throw new Error(`Unexpected recording path: ${sample.file}`);
		const file = path.resolve(options.outputDir, sample.file);
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
	return clips;
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
	const clips = await prepareUploads(options);
	const log = dependencies.log ?? console.log;
	for (const clip of clips) log(`${clip.key} ↔ ${clip.file}`);
	if (options.dryRun) {
		log(`Dry run: ${clips.length} validated clips; no uploads or network requests.`);
		return;
	}
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
	const recordPath = path.join(options.outputDir, `upload-${Date.now()}-${randomUUID()}.json`);
	const entries: UploadEntry[] = clips.map((clip) => ({
		...clip,
		uploadedAt: null,
		verified: false,
	}));
	let checkpoint = Promise.resolve();
	const saveRecord = () => {
		const contents = `${JSON.stringify({ bucket, startedAt, entries }, null, 2)}\n`;
		checkpoint = checkpoint.then(async () => {
			await writeFile(`${recordPath}.tmp`, contents);
			await rename(`${recordPath}.tmp`, recordPath);
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
		`${uploaded}/${entries.length} uploaded; ${verified}/${entries.length} verified. Record: ${recordPath}`,
	);
	const failures = entries.filter(({ verified }) => !verified);
	if (failures.length)
		throw new Error(failures.map(({ key, error }) => `${key}: ${error}`).join("\n"));
	return recordPath;
}
