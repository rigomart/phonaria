import type { TargetAccent } from "@phonaria/phonetics-data";
import type { RecordingEvidence, Scorer, ScoringRequest, WavAudio } from "../contract";
import { azureEvidenceFromResponse } from "./evidence";
import type { AzureAssessmentResponse } from "./response";

export type AzureScorerOptions = {
	readonly key: string;
	/** An Azure region name, e.g. `eastus`. */
	readonly region: string;
	/** How many best-fitting phonemes Azure lists for each sound. */
	readonly nBestPhonemeCount?: number;
	readonly timeoutMs?: number;
	readonly fetch?: typeof fetch;
};

export const AZURE_DEFAULT_N_BEST_PHONEME_COUNT = 10;

const AZURE_LANGUAGES: Partial<Record<TargetAccent, string>> = { "en-us": "en-US" };

export function createAzureScorer(options: AzureScorerOptions): Scorer {
	return {
		async score(audio: WavAudio, request: ScoringRequest): Promise<RecordingEvidence> {
			const response = await requestAzureAssessment(audio, request, options);
			return azureEvidenceFromResponse(response, request);
		},
	};
}

/** Sends one recording to the short-audio REST endpoint and returns Azure's raw response. */
export async function requestAzureAssessment(
	audio: WavAudio,
	request: ScoringRequest,
	{
		key,
		region,
		nBestPhonemeCount = AZURE_DEFAULT_N_BEST_PHONEME_COUNT,
		timeoutMs = 30_000,
		// Workers throw "Illegal invocation" when the global fetch is called detached from its global.
		fetch: fetcher = (input, init) => fetch(input, init),
	}: AzureScorerOptions,
): Promise<AzureAssessmentResponse> {
	if (!key) throw new Error("An Azure Speech key is required");
	if (!/^[a-z0-9]+$/.test(region)) throw new Error("The Azure region must be a name like eastus");
	const language = AZURE_LANGUAGES[request.targetAccent];
	if (!language) throw new Error(`Azure scoring does not support ${request.targetAccent}`);
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
	};

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
					"Pronunciation-Assessment": base64Json(assessment),
				},
				body: audio,
				signal: AbortSignal.timeout(timeoutMs),
			},
		);
	} catch {
		throw new Error("Azure Pronunciation Assessment request failed; check connectivity or timeout");
	}
	if (!response.ok) {
		throw new Error(`Azure Pronunciation Assessment failed (HTTP ${response.status})`);
	}
	try {
		return (await response.json()) as AzureAssessmentResponse;
	} catch {
		throw new Error("Azure Pronunciation Assessment returned a response that isn't JSON");
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
