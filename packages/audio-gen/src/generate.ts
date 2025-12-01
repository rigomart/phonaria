import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createElevenLabsProvider } from "./providers/elevenlabs";
import { getWordInputs } from "./word-inputs";

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
	const limit = process.env.WORDS_LIMIT ? Number(process.env.WORDS_LIMIT) : undefined;
	const inputs = getWordInputs(Number.isFinite(limit) ? limit : undefined);

	await mkdir(outputDir, { recursive: true });

	for (const utterance of inputs) {
		console.log(`Generating audio for "${utterance.id}"...`);
		const [{ audio }] = await tts.synthesize([utterance]);
		const filepath = path.join(outputDir, `${toSafeFilename(utterance.id)}.mp3`);
		await writeFile(filepath, audio);
		console.log(`Saved ${filepath}`);
	}

	console.log("Done. Check the output directory for the generated samples.");
}

void synthesize().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
