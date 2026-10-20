import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RecordingEvidence, Scorer, ScoringRequest, WavAudio } from "../contract";

/**
 * A scorer split at its raw response, so the harness can cache what the network
 * returned and rebuild evidence from it when the adapter changes.
 */
export type HarnessScorer<Raw = unknown> = {
	/** Names the cache folder. */
	readonly id: string;
	/** Everything besides audio and request that changes the response; part of the cache key. */
	readonly settings: unknown;
	request(audio: WavAudio, request: ScoringRequest): Promise<Raw>;
	evidence(raw: Raw, request: ScoringRequest): RecordingEvidence;
};

/** Any contract scorer, caching its evidence as the raw response. */
export function harnessScorerFrom(
	id: string,
	settings: unknown,
	scorer: Scorer,
): HarnessScorer<RecordingEvidence> {
	return {
		id,
		settings,
		request: (audio, request) => scorer.score(audio, request),
		evidence: (raw) => raw,
	};
}

export type ScoringJob = {
	readonly audio: WavAudio;
	readonly request: ScoringRequest;
};

export type ScoringResult =
	| { readonly type: "scored"; readonly evidence: RecordingEvidence; readonly cached: boolean }
	| { readonly type: "uncached" }
	| { readonly type: "failed"; readonly error: string };

export type ScoringStats = {
	readonly cacheHits: number;
	readonly liveCalls: number;
	readonly uncached: number;
	readonly failed: number;
};

export type ScoreJobsOptions = {
	readonly cacheDir: string;
	/** Never call the scorer; jobs missing from the cache come back `uncached`. */
	readonly offline?: boolean;
	readonly concurrency?: number;
	readonly onProgress?: (done: number, total: number, stats: ScoringStats) => void;
	/** Checked before each live call; return a reason to stop calling the scorer. */
	readonly shouldStop?: () => string | null;
};

type CacheEntry = {
	readonly scorer: string;
	readonly settings: unknown;
	readonly request: ScoringRequest;
	readonly audioSha256: string;
	readonly raw: unknown;
};

export function sha256(data: Uint8Array | string): string {
	return createHash("sha256").update(data).digest("hex");
}

export function cacheKey(
	scorer: Pick<HarnessScorer, "id" | "settings">,
	audioSha256: string,
	request: ScoringRequest,
): string {
	return sha256(
		JSON.stringify({ scorer: scorer.id, settings: scorer.settings, request, audioSha256 }),
	);
}

export async function scoreJobs<Raw>(
	scorer: HarnessScorer<Raw>,
	jobs: readonly ScoringJob[],
	{ cacheDir, offline = false, concurrency = 4, onProgress, shouldStop }: ScoreJobsOptions,
): Promise<{ results: ScoringResult[]; stats: ScoringStats }> {
	const folder = path.join(cacheDir, scorer.id);
	await mkdir(folder, { recursive: true });
	const stats = { cacheHits: 0, liveCalls: 0, uncached: 0, failed: 0 };
	let done = 0;
	let stopReason: string | null = null;

	const unique = new Map<string, ScoringJob & { readonly audioSha256: string }>();
	const keys = jobs.map((job) => {
		const audioSha256 = sha256(job.audio);
		const key = cacheKey(scorer, audioSha256, job.request);
		if (!unique.has(key)) unique.set(key, { ...job, audioSha256 });
		return key;
	});
	const scored = new Map<string, ScoringResult>();
	await mapWithConcurrency([...unique], concurrency, async ([key, job]) => {
		scored.set(key, await scoreOne(key, job));
		done++;
		onProgress?.(done, unique.size, stats);
	});
	return { results: keys.map((key) => scored.get(key) as ScoringResult), stats };

	async function scoreOne(
		key: string,
		{ audio, request, audioSha256 }: ScoringJob & { readonly audioSha256: string },
	): Promise<ScoringResult> {
		const file = path.join(folder, `${key}.json`);
		const cached = await readCache(file);
		if (cached) {
			stats.cacheHits++;
			return {
				type: "scored",
				evidence: scorer.evidence(cached.raw as Raw, request),
				cached: true,
			};
		}
		stopReason ??= shouldStop?.() ?? null;
		if (offline || stopReason) {
			stats.uncached++;
			return { type: "uncached" };
		}
		try {
			stats.liveCalls++;
			const raw = await scorer.request(audio, request);
			await writeCacheEntry(file, scorer, request, audioSha256, raw);
			return { type: "scored", evidence: scorer.evidence(raw, request), cached: false };
		} catch (error) {
			stats.failed++;
			return { type: "failed", error: error instanceof Error ? error.message : String(error) };
		}
	}
}

async function writeCacheEntry(
	file: string,
	scorer: Pick<HarnessScorer, "id" | "settings">,
	request: ScoringRequest,
	audioSha256: string,
	raw: unknown,
): Promise<void> {
	const entry: CacheEntry = {
		scorer: scorer.id,
		settings: scorer.settings,
		request,
		audioSha256,
		raw,
	};
	await writeAtomically(file, `${JSON.stringify(entry)}\n`);
}

/**
 * Stores a raw response for a job as if the scorer had returned it, so responses
 * saved elsewhere for the same audio and request cost no calls. True when written,
 * false when the cache already had one.
 */
export async function seedCache<Raw>(
	scorer: HarnessScorer<Raw>,
	{ audio, request }: ScoringJob,
	raw: Raw,
	cacheDir: string,
): Promise<boolean> {
	const folder = path.join(cacheDir, scorer.id);
	await mkdir(folder, { recursive: true });
	const audioSha256 = sha256(audio);
	const file = path.join(folder, `${cacheKey(scorer, audioSha256, request)}.json`);
	if (await readCache(file)) return false;
	await writeCacheEntry(file, scorer, request, audioSha256, raw);
	return true;
}

async function readCache(file: string): Promise<CacheEntry | null> {
	try {
		return JSON.parse(await readFile(file, "utf8")) as CacheEntry;
	} catch {
		return null;
	}
}

export async function writeAtomically(file: string, contents: string | Uint8Array): Promise<void> {
	const temporary = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
	await writeFile(temporary, contents);
	await rename(temporary, file);
}

export async function mapWithConcurrency<T, R>(
	items: readonly T[],
	limit: number,
	run: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let next = 0;
	const worker = async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await run(items[index], index);
		}
	};
	await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
	return results;
}
