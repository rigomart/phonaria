import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const demoUtterances: string[] = [
	"luke",
	"look",
	"through",
	'<phoneme alphabet="cmu-arpabet" ph="DH AH0">the</phoneme>',
];

const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // Rachel (default)
const modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2";
const outputDir = path.resolve(process.cwd(), "output");

const client = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

function toSafeFilename(word: string): string {
	return word
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
	const nodeStream = Readable.fromWeb(stream);
	const chunks: Buffer[] = [];

	for await (const chunk of nodeStream) {
		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks);
}

async function synthesize(): Promise<void> {
	if (!process.env.ELEVENLABS_API_KEY) {
		throw new Error("ELEVENLABS_API_KEY is required to run the ElevenLabs demo.");
	}

	await mkdir(outputDir, { recursive: true });

	for (const word of demoUtterances) {
		console.log(`Generating audio for "${word}"...`);
		const audio = await client.textToSpeech.convert(voiceId, {
			text: word,
			modelId,
			outputFormat: "mp3_44100_128",
			voiceSettings: {
				speed: 0.7,
				stability: 1,
				similarityBoost: 1,
			},
		});

		const buffer = await streamToBuffer(audio);
		const filepath = path.join(outputDir, `${toSafeFilename(word)}.mp3`);
		await writeFile(filepath, buffer);
		console.log(`Saved ${filepath}`);
	}

	console.log("Done. Check the output directory for the generated samples.");
}

void synthesize().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
