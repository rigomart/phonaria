import { escapeXml } from "../word-inputs";
import type { TtsInput, TtsOutput, TtsProvider } from "./types";

export const AZURE_OUTPUT_FORMAT = "audio-24khz-160kbitrate-mono-mp3";

export function getAzureAudioFormat(audioFormat = "mp3") {
	if (audioFormat === "mp3") {
		return { outputFormat: AZURE_OUTPUT_FORMAT, extension: "mp3", contentType: "audio/mpeg" };
	}
	if (audioFormat === "ogg") {
		return {
			outputFormat: "ogg-24khz-16bit-mono-opus",
			extension: "ogg",
			contentType: "audio/ogg",
		};
	}
	throw new Error("Azure audio format must be mp3 or ogg");
}

export function getAzureRate(ratePercent = 0): number {
	if (!Number.isInteger(ratePercent) || ratePercent < -50 || ratePercent > 100) {
		throw new Error("Azure speaking rate must be an integer percentage from -50 to 100");
	}
	return ratePercent;
}

export function getAzureVoice(voiceId = process.env.AZURE_SPEECH_VOICE ?? "en-US-JennyNeural") {
	if (!/^en-US-[a-zA-Z0-9]+Neural$/.test(voiceId)) {
		throw new Error("AZURE_SPEECH_VOICE must be an en-US neural voice");
	}
	return voiceId;
}

export function createAzureProvider(
	options: {
		apiKey?: string;
		region?: string;
		voiceId?: string;
		ratePercent?: number;
		audioFormat?: string;
		fetcher?: typeof fetch;
	} = {},
): TtsProvider {
	const apiKey = options.apiKey ?? process.env.AZURE_SPEECH_KEY;
	const region = options.region ?? process.env.AZURE_SPEECH_REGION;
	if (!apiKey) throw new Error("AZURE_SPEECH_KEY is required");
	if (!region || !/^[a-z0-9]+$/.test(region)) {
		throw new Error("AZURE_SPEECH_REGION must be a region name, e.g. eastus");
	}
	const voiceId = getAzureVoice(options.voiceId);
	const ratePercent = getAzureRate(options.ratePercent);
	const audioFormat = getAzureAudioFormat(options.audioFormat);
	const fetcher = options.fetcher ?? fetch;
	return {
		async synthesize(inputs: TtsInput[]): Promise<TtsOutput[]> {
			const results: TtsOutput[] = [];
			for (const { id, text } of inputs) {
				const content =
					ratePercent === 0 ? text : `<prosody rate="${ratePercent}%">${text}</prosody>`;
				let response: Response;
				try {
					response = await fetcher(
						`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
						{
							method: "POST",
							headers: {
								"Ocp-Apim-Subscription-Key": apiKey,
								"Content-Type": "application/ssml+xml",
								"X-Microsoft-OutputFormat": audioFormat.outputFormat,
								"User-Agent": "Phonaria-Audio-Generator",
							},
							body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${escapeXml(voiceId)}">${content}</voice></speak>`,
							signal: AbortSignal.timeout(60_000),
						},
					);
				} catch {
					throw new Error(`Azure request failed for ${id}; check connectivity or timeout`);
				}
				if (!response.ok) {
					throw new Error(`Azure synthesis failed for ${id} (HTTP ${response.status})`);
				}
				const contentType = (response.headers.get("Content-Type") ?? "")
					.split(";")[0]
					.trim()
					.toLowerCase();
				if (contentType !== audioFormat.contentType) {
					throw new Error(`Azure returned an unexpected audio type for ${id}`);
				}
				let audio: Buffer;
				try {
					audio = Buffer.from(await response.arrayBuffer());
				} catch {
					throw new Error(`Azure audio download failed for ${id}`);
				}
				if (!audio.length) throw new Error(`Azure returned empty audio for ${id}`);
				results.push({ id, audio });
			}
			return results;
		},
	};
}
