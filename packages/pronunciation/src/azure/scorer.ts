import type { TargetAccent } from "@phonaria/phonetics-data";
import type { RecordingEvidence, Scorer, ScoringRequest, WavAudio } from "../contract";
import { azureEvidenceFromResponse } from "./evidence";
import type { AzureAssessmentResponse, AzureRecognitionResponse } from "./response";

export type AzureScorerOptions = {
	readonly key: string;
	/** An Azure region name, e.g. `eastus`. */
	readonly region: string;
	/** How many best-fitting phonemes Azure lists for each sound. */
	readonly nBestPhonemeCount?: number;
	readonly timeoutMs?: number;
	readonly fetch?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
};

export const AZURE_DEFAULT_N_BEST_PHONEME_COUNT = 10;

const AZURE_LANGUAGES: Partial<Record<TargetAccent, string>> = { "en-us": "en-US" };

/**
 * Sends each recording twice, in parallel: once for Pronunciation Assessment and
 * once for plain recognition, whose transcript tells the judge what was said. If
 * only the recognition fails, the evidence comes back without a transcript.
 */
export function createAzureScorer(options: AzureScorerOptions): Scorer {
	return {
		async score(audio: WavAudio, request: ScoringRequest): Promise<RecordingEvidence> {
			const [assessment, recognition] = await Promise.all([
				requestAzureAssessment(audio, request, options),
				requestAzureRecognition(audio, request.targetAccent, options).catch(() => undefined),
			]);
			return azureEvidenceFromResponse(assessment, request, recognition);
		},
	};
}

/** Sends one recording to the short-audio REST endpoint and returns Azure's raw assessment. */
export async function requestAzureAssessment(
	audio: WavAudio,
	request: ScoringRequest,
	options: AzureScorerOptions,
): Promise<AzureAssessmentResponse> {
	const { nBestPhonemeCount = AZURE_DEFAULT_N_BEST_PHONEME_COUNT } = options;
	if (request.words.length === 0) throw new Error("A scoring request needs at least one word");
	if (!Number.isInteger(nBestPhonemeCount) || nBestPhonemeCount < 1) {
		throw new Error("nBestPhonemeCount must be a positive integer");
	}
	const assessment = {
		ReferenceText: request.words.map((word) => word.text).join(" "),
		GradingSystem: "HundredMark",
		Granularity: "Phoneme",
		Dimension: "Comprehensive",
		PhonemeAlphabet: "IPA",
		NBestPhonemeCount: nBestPhonemeCount,
		// Marks a target word Azure didn't hear as Omission, instead of scoring whatever was said as it.
		EnableMiscue: true,
	};
	return postToAzure(audio, request.targetAccent, options, "Pronunciation Assessment", {
		"Pronunciation-Assessment": base64Json(assessment),
	});
}

/** Sends one recording for plain recognition, with no target words, and returns Azure's raw response. */
export async function requestAzureRecognition(
	audio: WavAudio,
	targetAccent: TargetAccent,
	options: AzureScorerOptions,
): Promise<AzureRecognitionResponse> {
	return postToAzure(audio, targetAccent, options, "Speech recognition", {});
}

async function postToAzure(
	audio: WavAudio,
	targetAccent: TargetAccent,
	{
		key,
		region,
		timeoutMs = 30_000,
		// Workers throw "Illegal invocation" when the global fetch is called detached from its global.
		fetch: fetcher = (input, init) => fetch(input, init),
	}: AzureScorerOptions,
	service: string,
	headers: Record<string, string>,
): Promise<AzureAssessmentResponse> {
	if (!key) throw new Error("An Azure Speech key is required");
	if (!/^[a-z0-9]+$/.test(region)) throw new Error("The Azure region must be a name like eastus");
	const language = AZURE_LANGUAGES[targetAccent];
	if (!language) throw new Error(`Azure scoring does not support ${targetAccent}`);

	let response: Response;
	try {
		response = await fetcher(
			`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}&format=detailed`,
			{
				method: "POST",
				headers: {
					"Ocp-Apim-Subscription-Key": key,
					"Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
					Accept: "application/json",
					...headers,
				},
				body: audio,
				signal: AbortSignal.timeout(timeoutMs),
			},
		);
	} catch {
		throw new Error(`Azure ${service} request failed; check connectivity or timeout`);
	}
	if (!response.ok) {
		throw new Error(`Azure ${service} failed (HTTP ${response.status})`);
	}
	try {
		return (await response.json()) as AzureAssessmentResponse;
	} catch {
		throw new Error(`Azure ${service} returned a response that isn't JSON`);
	}
}

/** Base64 of the UTF-8 JSON, since `btoa` alone rejects characters outside Latin-1. */
function base64Json(value: unknown): string {
	let binary = "";
	for (const byte of new TextEncoder().encode(JSON.stringify(value))) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}
