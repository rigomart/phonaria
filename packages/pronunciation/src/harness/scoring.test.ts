import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ScoringRequest } from "../contract";
import { MAX_RETRY_AFTER_MS, retryAfterMs, retryingFetch } from "./azure";
import { type HarnessScorer, type ScoringJob, scoreJobs } from "./scoring";

const request = (word: string): ScoringRequest => ({
	targetAccent: "en-us",
	words: [{ text: word, acceptedPronunciations: [["SH", "IX", "P"]] }],
});

function countingScorer(settings: unknown = { n: 10 }) {
	const calls: string[] = [];
	let running = 0;
	let peak = 0;
	const scorer: HarnessScorer<{ word: string }> = {
		id: "counting",
		settings,
		async request(_audio, scoringRequest) {
			calls.push(scoringRequest.words[0].text);
			running++;
			peak = Math.max(peak, running);
			await new Promise((resolve) => setTimeout(resolve, 5));
			running--;
			return { word: scoringRequest.words[0].text };
		},
		evidence: () => ({ words: [{ pronunciations: [] }] }),
	};
	return { scorer, calls, peak: () => peak };
}

const jobs: ScoringJob[] = ["ship", "sheep", "shop", "shape", "ship"].map((word) => ({
	audio: new TextEncoder().encode(`audio of ${word}`),
	request: request(word),
}));

let cacheDir: string;
beforeEach(async () => {
	cacheDir = await mkdtemp(path.join(tmpdir(), "harness-cache-"));
});
afterEach(async () => {
	await rm(cacheDir, { recursive: true, force: true });
});

describe("scoreJobs", () => {
	it("scores identical jobs once and answers reruns from the cache", async () => {
		const first = countingScorer();
		const run = await scoreJobs(first.scorer, jobs, { cacheDir, concurrency: 2 });
		expect(first.calls.sort()).toEqual(["shape", "sheep", "ship", "shop"]);
		expect(run.results).toHaveLength(5);
		expect(run.stats).toEqual({ cacheHits: 0, liveCalls: 4, uncached: 0, failed: 0 });
		expect(first.peak()).toBeLessThanOrEqual(2);

		const second = countingScorer();
		const rerun = await scoreJobs(second.scorer, jobs, { cacheDir, offline: true });
		expect(second.calls).toEqual([]);
		expect(rerun.stats).toEqual({ cacheHits: 4, liveCalls: 0, uncached: 0, failed: 0 });
		expect(rerun.results.every((result) => result.type === "scored" && result.cached)).toBe(true);
	});

	it("keys the cache on scorer settings and reports misses offline", async () => {
		await scoreJobs(countingScorer({ n: 10 }).scorer, jobs, { cacheDir });
		const other = countingScorer({ n: 5 });
		const run = await scoreJobs(other.scorer, jobs, { cacheDir, offline: true });
		expect(other.calls).toEqual([]);
		expect(run.stats.uncached).toBe(4);
		expect(await readdir(path.join(cacheDir, "counting"))).toHaveLength(4);
	});

	it("stops calling the scorer once asked to", async () => {
		const { scorer, calls } = countingScorer();
		const run = await scoreJobs(scorer, jobs, {
			cacheDir,
			concurrency: 1,
			shouldStop: () => (calls.length >= 2 ? "throttled" : null),
		});
		expect(calls).toHaveLength(2);
		expect(run.stats.uncached).toBe(2);
	});
});

describe("retryingFetch", () => {
	it("retries throttling with Retry-After and counts it", async () => {
		const statuses = [429, 503, 200];
		const waits: number[] = [];
		const stats = { attempts: 0, throttled: 0, retried: 0 };
		const fetcher = retryingFetch({
			stats,
			sleep: async (ms) => {
				waits.push(ms);
			},
			fetch: async () =>
				new Response("{}", {
					status: statuses.shift(),
					headers: statuses.length === 2 ? { "retry-after": "2" } : {},
				}),
		});
		const response = await fetcher("https://example.test", { method: "POST" });
		expect(response.status).toBe(200);
		expect(stats).toEqual({ attempts: 3, throttled: 1, retried: 2 });
		expect(waits[0]).toBe(2000);
	});

	it("gives up after the last attempt, counting every 429", async () => {
		const stats = { attempts: 0, throttled: 0, retried: 0 };
		const fetcher = retryingFetch({
			maxAttempts: 2,
			stats,
			sleep: async () => {},
			fetch: async () => new Response("", { status: 429 }),
		});
		expect((await fetcher("https://example.test")).status).toBe(429);
		expect(stats).toEqual({ attempts: 2, throttled: 2, retried: 1 });
	});

	it("waits until a Retry-After date", async () => {
		const now = Date.parse("2026-10-19T12:00:00Z");
		const waits: number[] = [];
		const statuses = [429, 200];
		const fetcher = retryingFetch({
			now: () => now,
			sleep: async (ms) => {
				waits.push(ms);
			},
			fetch: async () =>
				new Response("", {
					status: statuses.shift(),
					headers: { "retry-after": "Mon, 19 Oct 2026 12:00:07 GMT" },
				}),
		});
		expect((await fetcher("https://example.test")).status).toBe(200);
		expect(waits).toEqual([7000]);
	});
});

describe("retryAfterMs", () => {
	const now = Date.parse("2026-10-19T12:00:00Z");

	it("reads delay seconds and HTTP dates", () => {
		expect(retryAfterMs("3", now)).toBe(3000);
		expect(retryAfterMs("1.5", now)).toBe(1500);
		expect(retryAfterMs("Mon, 19 Oct 2026 12:00:10 GMT", now)).toBe(10_000);
	});

	it("never waits less than nothing or more than the cap", () => {
		expect(retryAfterMs("Mon, 19 Oct 2026 11:59:00 GMT", now)).toBe(0);
		expect(retryAfterMs("3600", now)).toBe(MAX_RETRY_AFTER_MS);
		expect(retryAfterMs("Tue, 20 Oct 2026 12:00:00 GMT", now)).toBe(MAX_RETRY_AFTER_MS);
	});

	it("ignores a missing or unreadable header", () => {
		expect(retryAfterMs(null, now)).toBeNull();
		expect(retryAfterMs("", now)).toBeNull();
		expect(retryAfterMs("soon", now)).toBeNull();
		expect(retryAfterMs("-5", now)).toBeNull();
	});
});
