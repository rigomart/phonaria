import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api";
import type { TtsInput, TtsOutput, TtsProvider } from "./types";

type ElevenLabsVoiceSettings = {
	stability?: number;
	similarityBoost?: number;
	style?: number;
	useSpeakerBoost?: boolean;
	speed?: number;
};

type ElevenLabsProviderOptions = {
	apiKey?: string;
	voiceId?: string;
	modelId?: string;
	outputFormat?: string;
	voiceSettings?: ElevenLabsVoiceSettings;
};

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL_ID = "eleven_turbo_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";
const DEFAULT_VOICE_SETTINGS: ElevenLabsVoiceSettings = {
	speed: 0.8,
	stability: 0.8,
	similarityBoost: 0.8,
};

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
	const nodeStream = Readable.fromWeb(stream);
	const chunks: Buffer[] = [];

	for await (const chunk of nodeStream) {
		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks);
}

export function createElevenLabsProvider(options: ElevenLabsProviderOptions = {}): TtsProvider {
	const apiKey = options.apiKey ?? process.env.ELEVENLABS_API_KEY;
	if (!apiKey) {
		throw new Error("ELEVENLABS_API_KEY is required to run the ElevenLabs demo.");
	}

	const voiceId = options.voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
	const modelId = options.modelId ?? process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID;
	const outputFormat = options.outputFormat ?? DEFAULT_OUTPUT_FORMAT;
	const voiceSettings = options.voiceSettings ?? DEFAULT_VOICE_SETTINGS;

	const client = new ElevenLabsClient({ apiKey });

	return {
		async synthesize(requests: TtsInput[]): Promise<TtsOutput[]> {
			const results: TtsOutput[] = [];

			for (const { id, text } of requests) {
				const audioStream = await client.textToSpeech.convert(voiceId, {
					text,
					modelId,
					outputFormat: outputFormat as TextToSpeechConvertRequestOutputFormat,
					voiceSettings,
				});

				results.push({ id, audio: await streamToBuffer(audioStream) });
			}

			return results;
		},
	};
}
