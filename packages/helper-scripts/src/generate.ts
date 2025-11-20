import * as fs from "node:fs";
import * as path from "node:path";
import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { config } from "dotenv";

config();

/**
 * Simple utility to slugify a word for file names
 */
function slugifyWord(word: string): string {
	return word
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

type GenerationResult = {
	word: string;
	success: boolean;
	error?: string;
};

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
	throw new Error("ELEVENLABS_API_KEY environment variable is required");
}

const client = new ElevenLabsClient({ apiKey });
const outputDir = path.resolve(__dirname, "../../apps/web/public/audio/examples");
const voiceId = "MFZUKuGQUsGJPQjTS4wC"; // Jon voice ID

/**
 * Extract all unique example words from phonemes data
 * TODO: This function is currently disabled as the old phoneme data structure
 * has been removed. Re-implement when new phonetics system includes examples.
 */
function extractExampleWords(): string[] {
	console.warn("⚠️  Example word extraction is currently disabled.");
	console.warn("The phoneme data structure has been refactored.");
	console.warn("Please update this script to use the new phonetics system.");
	return [];
}

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(): void {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
		console.log(`Created output directory: ${outputDir}`);
	}
}

/**
 * Generate audio for a single word
 */
async function generateWordAudio(word: string): Promise<GenerationResult> {
	try {
		const fileName = `${slugifyWord(word)}.mp3`;
		const outputPath = path.join(outputDir, fileName);

		if (fs.existsSync(outputPath)) {
			console.log(`⏭️  Skipping ${word} (already exists)`);
			return { word, success: true };
		}

		console.log(`🎵 Generating audio for: ${word}`);

		const audioStream = await client.textToSpeech.stream(voiceId, {
			text: word,
			modelId: "eleven_flash_v2_5",
			voiceSettings: {
				stability: 0.9,
				speed: 0.9,
				similarityBoost: 0.75,
			},
		});

		const reader = audioStream.getReader();
		const fileStream = fs.createWriteStream(outputPath);

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) {
					fileStream.write(Buffer.from(value));
				}
			}
			fileStream.end();
		} catch (error) {
			fileStream.destroy();
			throw error;
		}

		await new Promise<void>((resolve, reject) => {
			fileStream.on("finish", resolve);
			fileStream.on("error", reject);
		});

		console.log(`✅ Generated: ${fileName}`);
		return { word, success: true };
	} catch (error) {
		const errorMessage =
			error instanceof ElevenLabsError ? `API Error: ${error.message}` : `Unknown error: ${error}`;

		console.error(`❌ Failed to generate ${word}: ${errorMessage}`);
		return { word, success: false, error: errorMessage };
	}
}

/**
 * Add delay between API calls
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate audio files for all example words
 */
async function generateAllAudio(): Promise<void> {
	console.log("🚀 Starting audio generation for phoneme example words...\n");

	ensureOutputDirectory();
	const words = extractExampleWords();

	console.log(`📝 Found ${words.length} unique words to generate (sampled):`);
	console.log(words.join(", "));
	console.log("");

	const results: GenerationResult[] = [];
	const batchSize = 5;
	const delayBetweenCalls = 1000;

	for (let i = 0; i < words.length; i += batchSize) {
		const batch = words.slice(i, i + batchSize);
		console.log(
			`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
				words.length / batchSize,
			)}`,
		);

		for (const word of batch) {
			const result = await generateWordAudio(word);
			results.push(result);

			if (word !== batch[batch.length - 1]) {
				await delay(delayBetweenCalls);
			}
		}

		if (i + batchSize < words.length) {
			console.log("⏳ Waiting before next batch...");
			await delay(2000);
		}
	}

	const successful = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success).length;

	console.log("\n📊 Generation Summary:");
	console.log(`✅ Successful: ${successful}`);
	console.log(`❌ Failed: ${failed}`);
	console.log(`📁 Output directory: ${outputDir}`);

	if (failed > 0) {
		console.log("\n❌ Failed words:");
		results
			.filter((r) => !r.success)
			.forEach((r) => {
				console.log(`  - ${r.word}: ${r.error}`);
			});
	}

	console.log("\n🎉 Audio generation complete!");
}

// Main execution
async function main() {
	try {
		await generateAllAudio();
	} catch (error) {
		console.error("💥 Fatal error:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
