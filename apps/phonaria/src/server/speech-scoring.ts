import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import {
	type AzureAssessmentResponse,
	type AzureScorerOptions,
	azureEvidenceFromResponse,
	type RecordingEvidence,
	requestAzureAssessment,
	requestAzureRecognition,
	type ScoringRequest,
} from "@phonaria/pronunciation";
import { flags } from "@/lib/flags";
import { SCORER_SAMPLE_RATE } from "@/lib/recording/resample";
import { MAX_RECORDING_SECONDS } from "@/lib/recording/voice-activity";
import { readWavFormat } from "@/lib/recording/wav";
import { CatalogWordPronunciations } from "@/lib/speech/catalog-pronunciations";
import type { WorkerRateLimit } from "@/server/cloudflare/env";
import { logWorkerEvent } from "@/server/cloudflare/log";
import { readBody } from "@/server/read-body";

const BYTES_PER_SECOND = SCORER_SAMPLE_RATE * 2;
/** Room for the RIFF header and small metadata chunks such as ffmpeg's `LIST`. */
export const WAV_HEADER_ALLOWANCE_BYTES = 1_024;
export const MAX_SPEECH_BYTES =
	MAX_RECORDING_SECONDS * BYTES_PER_SECOND + WAV_HEADER_ALLOWANCE_BYTES;

export type SpeechErrorCode =
	| "invalid_word"
	| "unsupported_accent"
	| "invalid_audio"
	| "unsupported_audio"
	| "audio_too_long"
	| "rate_limited"
	| "unavailable"
	| "scoring_failed";

/** Response body for every error status except 404 and 405, which are plain text. */
export type SpeechErrorBody = {
	readonly error: { readonly code: SpeechErrorCode; readonly message: string };
};

export type SpeechWorkerEnv = {
	AZURE_SPEECH_KEY?: string;
	AZURE_SPEECH_REGION?: string;
	SPEECH_RATE_LIMIT: WorkerRateLimit;
};

export type ScoreSpeechOnWorkerDependencies = {
	fetch?: AzureScorerOptions["fetch"];
	log?: typeof logWorkerEvent;
	now?: () => number;
};

class SpeechRequestError extends Error {
	constructor(
		readonly status: number,
		readonly code: SpeechErrorCode,
		message: string,
	) {
		super(message);
	}
}

/**
 * Framework-neutral Worker handler for `POST /api/speech/score?word=&targetAccent=` with a
 * 16 kHz mono 16-bit PCM WAV body. Returns the scorer's `RecordingEvidence`, transcript
 * included; the browser gates and judges it. Each attempt makes two Azure calls, and counts
 * once against the rate limit. The audio is passed to Azure only, never stored or logged.
 */
export async function scoreSpeechOnWorker(
	request: Request,
	env: SpeechWorkerEnv,
	dependencies: ScoreSpeechOnWorkerDependencies = {},
): Promise<Response> {
	if (!flags.isEnabled("speech")) return new Response("Not Found", { status: 404 });
	if (request.method !== "POST") {
		return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
	}

	const log = dependencies.log ?? logWorkerEvent;
	const now = dependencies.now ?? Date.now;
	const started = now();
	const url = new URL(request.url);
	const word = url.searchParams.get("word")?.trim().toLowerCase() ?? "";
	const pronunciations = CatalogWordPronunciations.get(word);

	let response: Response;
	let transcribed: boolean | undefined;
	try {
		const evidence = await score(request, env, dependencies, {
			word,
			pronunciations,
			targetAccent: url.searchParams.get("targetAccent"),
		});
		transcribed = "transcript" in evidence;
		response = Response.json(evidence, { headers: NO_STORE });
	} catch (error) {
		const failure =
			error instanceof SpeechRequestError
				? error
				: new SpeechRequestError(502, "scoring_failed", "Scoring failed. Please try again.");
		const body: SpeechErrorBody = { error: { code: failure.code, message: failure.message } };
		response = Response.json(body, {
			status: failure.status,
			headers: failure.status === 429 ? { ...NO_STORE, "Retry-After": "60" } : NO_STORE,
		});
	}

	const catalogWord = pronunciations ? word : undefined;
	log({
		level: response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info",
		message: "speech_scoring",
		details: {
			word: catalogWord,
			status: response.status,
			ms: now() - started,
			...(transcribed === false && { transcript: "failed" }),
		},
	});
	return response;
}

const NO_STORE = { "Cache-Control": "no-store" };

async function score(
	request: Request,
	env: SpeechWorkerEnv,
	dependencies: ScoreSpeechOnWorkerDependencies,
	query: {
		word: string;
		pronunciations: readonly (readonly PhonemeSymbolId[])[] | undefined;
		targetAccent: string | null;
	},
): Promise<RecordingEvidence> {
	const key = env.AZURE_SPEECH_KEY?.trim();
	const region = env.AZURE_SPEECH_REGION?.trim();
	if (!key || !region || !env.SPEECH_RATE_LIMIT) {
		throw new SpeechRequestError(
			503,
			"unavailable",
			"Pronunciation scoring is temporarily unavailable.",
		);
	}

	const limited = await env.SPEECH_RATE_LIMIT.limit({
		key: request.headers.get("cf-connecting-ip")?.trim() || "anonymous",
	});
	if (!limited.success) {
		throw new SpeechRequestError(
			429,
			"rate_limited",
			"Too many scoring requests. Please try again shortly.",
		);
	}

	if (query.targetAccent !== "en-us") {
		throw new SpeechRequestError(
			400,
			"unsupported_accent",
			"Pronunciation scoring supports only the en-us target accent.",
		);
	}
	if (!query.pronunciations) {
		throw new SpeechRequestError(
			400,
			"invalid_word",
			"The word must be one from the minimal-pair catalog.",
		);
	}

	const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
	if (contentType !== "audio/wav" && contentType !== "audio/x-wav") {
		throw new SpeechRequestError(
			415,
			"unsupported_audio",
			"Send the recording as audio/wav: 16 kHz mono 16-bit PCM.",
		);
	}
	const audio = await readBody(request, MAX_SPEECH_BYTES);
	if (!audio) throw tooLong();
	const format = readWavFormat(audio);
	if (!format) {
		throw new SpeechRequestError(400, "invalid_audio", "The recording isn't a complete WAV file.");
	}
	if (
		format.audioFormat !== 1 ||
		format.channels !== 1 ||
		format.sampleRate !== SCORER_SAMPLE_RATE ||
		format.bitsPerSample !== 16
	) {
		throw new SpeechRequestError(
			415,
			"unsupported_audio",
			"The recording must be 16 kHz mono 16-bit PCM WAV.",
		);
	}
	if (format.dataBytes === 0) {
		throw new SpeechRequestError(400, "invalid_audio", "The recording is empty.");
	}
	if (format.dataBytes > MAX_RECORDING_SECONDS * BYTES_PER_SECOND) {
		throw tooLong();
	}

	const scoringRequest: ScoringRequest = {
		targetAccent: "en-us",
		words: [{ text: query.word, acceptedPronunciations: query.pronunciations }],
	};
	const options = { key, region, fetch: dependencies.fetch };
	const assess = async () => {
		const response = await requestAzureAssessment(audio, scoringRequest, options);
		// About 0.2% of Azure answers are a transient Success with no assessment in it.
		return isEmptySuccess(response)
			? requestAzureAssessment(audio, scoringRequest, options)
			: response;
	};
	// Without a transcript the word gate falls back on the assessment alone, which lets
	// phrases and added sounds through but rejected no correct word in #344's test set.
	// That's the page before the gate existed, so a failed transcript isn't worth a 502.
	const [assessment, recognition] = await Promise.all([
		assess(),
		requestAzureRecognition(audio, "en-us", options).catch(() => undefined),
	]);
	return azureEvidenceFromResponse(assessment, scoringRequest, recognition);
}

function isEmptySuccess(response: AzureAssessmentResponse): boolean {
	return (
		response.RecognitionStatus === "Success" &&
		!response.NBest?.some(({ Words }) => Words?.some(({ Phonemes }) => Phonemes?.length))
	);
}

function tooLong(): SpeechRequestError {
	return new SpeechRequestError(
		413,
		"audio_too_long",
		`The recording must be at most ${MAX_RECORDING_SECONDS} seconds.`,
	);
}
