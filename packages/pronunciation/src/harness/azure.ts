import { azureEvidenceFromResponse } from "../azure/evidence";
import type { AzureAssessmentResponse } from "../azure/response";
import {
	AZURE_DEFAULT_N_BEST_PHONEME_COUNT,
	type AzureScorerOptions,
	requestAzureAssessment,
} from "../azure/scorer";
import type { HarnessScorer } from "./scoring";

export type Fetch = NonNullable<AzureScorerOptions["fetch"]>;

export type FetchStats = { attempts: number; throttled: number; retried: number };

export type RetryOptions = {
	readonly maxAttempts?: number;
	readonly baseDelayMs?: number;
	readonly timeoutMs?: number;
	readonly stats?: FetchStats;
	readonly sleep?: (ms: number) => Promise<void>;
	readonly now?: () => number;
	readonly fetch?: Fetch;
};

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

export const MAX_RETRY_AFTER_MS = 60_000;

/** Retry-After as delay seconds or an HTTP date, capped; null when absent or unreadable. */
export function retryAfterMs(header: string | null, now = Date.now()): number | null {
	const value = header?.trim();
	if (!value) return null;
	// An HTTP date always names its month; without that guard Date.parse reads "-5" as a year.
	const delay = /^\d+(\.\d+)?$/.test(value)
		? Number(value) * 1000
		: /[a-z]/i.test(value)
			? Date.parse(value) - now
			: Number.NaN;
	if (!Number.isFinite(delay)) return null;
	return Math.min(Math.max(delay, 0), MAX_RETRY_AFTER_MS);
}

/** Retries throttling and server errors with backoff, honouring Retry-After. */
export function retryingFetch({
	maxAttempts = 6,
	baseDelayMs = 1000,
	timeoutMs = 30_000,
	stats = { attempts: 0, throttled: 0, retried: 0 },
	sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
	now = Date.now,
	fetch: fetcher = (input, init) => fetch(input, init),
}: RetryOptions = {}): Fetch {
	return async (input, init) => {
		for (let attempt = 1; ; attempt++) {
			stats.attempts++;
			const response = await fetcher(input, withAttemptTimeout(init, timeoutMs));
			if (response.status === 429) stats.throttled++;
			if (!RETRYABLE.has(response.status) || attempt >= maxAttempts) return response;
			stats.retried++;
			const backoff = baseDelayMs * 2 ** (attempt - 1) * (1 + Math.random() * 0.25);
			await sleep(retryAfterMs(response.headers.get("retry-after"), now()) ?? backoff);
		}
	};
}

function withAttemptTimeout(init: RequestInit | undefined, timeoutMs: number): RequestInit {
	return { ...init, signal: AbortSignal.timeout(timeoutMs) };
}

export type AzureHarnessOptions = {
	readonly key?: string;
	readonly region?: string;
	readonly nBestPhonemeCount?: number;
	readonly fetch?: Fetch;
};

/** The key and region stay out of `settings`, so they never reach the cache. */
export function createAzureHarnessScorer({
	key,
	region,
	nBestPhonemeCount = AZURE_DEFAULT_N_BEST_PHONEME_COUNT,
	fetch: fetcher,
}: AzureHarnessOptions): HarnessScorer<AzureAssessmentResponse> {
	return {
		id: "azure",
		settings: { endpoint: "short-audio-rest", nBestPhonemeCount },
		request: async (audio, request) => {
			if (!key || !region) {
				throw new Error("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION to score uncached audio");
			}
			return requestAzureAssessment(audio, request, {
				key,
				region,
				nBestPhonemeCount,
				fetch: fetcher,
			});
		},
		evidence: azureEvidenceFromResponse,
	};
}
