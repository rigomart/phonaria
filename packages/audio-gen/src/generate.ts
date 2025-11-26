import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createElevenLabsProvider } from "./providers/elevenlabs";
import type { TtsInput } from "./providers/types";

const demoUtterances: TtsInput[] = [
	{ id: "the", text: '<phoneme alphabet="cmu-arpabet" ph="DH AH0">the</phoneme>' },
	{
		id: "p",
		text: `
	<speak>
    <break time="1s"/>
    <phoneme alphabet="cmu-arpabet" ph="P AH0">p</phoneme>
  </speak>`,
	},
];

const outputDir = path.resolve(process.cwd(), "output");

function toSafeFilename(word: string): string {
	return word
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function synthesize(): Promise<void> {
	const tts = createElevenLabsProvider();

	await mkdir(outputDir, { recursive: true });

	const outputs = await tts.synthesize(demoUtterances);

	for (const { id, audio } of outputs) {
		console.log(`Generating audio for "${id}"...`);
		const filepath = path.join(outputDir, `${toSafeFilename(id)}.mp3`);
		await writeFile(filepath, audio);
		console.log(`Saved ${filepath}`);
	}

	console.log("Done. Check the output directory for the generated samples.");
}

void synthesize().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
