import * as path from "node:path";
import { config } from "dotenv";
import { parseCmudict } from "./cmudict-parser";
import { ensureDirectoryForFile, writeJsonFile } from "./utils/fs";

config();

type CompactCmudict = Record<string, string[]>;

type CmudictPayload = {
	meta: {
		formatVersion: number;
		source: string;
		sourceUrl: string;
		generatedAt: string;
		wordCount: number;
		variantCount: number;
		skippedLineCount: number;
		deduplicatedVariantCount: number;
	};
	data: CompactCmudict;
};

const cmudictUrl = process.env.CMUDICT_SRC_URL;
const outputPath =
	process.env.CMUDICT_JSON_PATH ||
	path.resolve(__dirname, "../../phonetics-data/data/en/dict/cmudict.json");

if (!cmudictUrl) {
	throw new Error("CMUDICT_SRC_URL environment variable is required");
}

// TypeScript knows cmudictUrl is defined after the check above
const safeCmudictUrl: string = cmudictUrl;

async function fetchCmudict(): Promise<string> {
	console.log("Fetching CMUDict data from remote source...");

	const MAX_BYTES = 10 * 1024 * 1024; // 10MB safety cap
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

	let response: Response;
	try {
		response = await fetch(safeCmudictUrl, { signal: controller.signal, cache: "force-cache" });
	} catch (error) {
		clearTimeout(timeoutId);
		throw new Error(`Failed to fetch CMUDict: ${error}`);
	}
	clearTimeout(timeoutId);

	if (!response.ok) {
		throw new Error(`Failed to fetch CMUDict: ${response.status} ${response.statusText}`);
	}

	const contentType = response.headers.get("content-type") || "";
	if (!contentType.startsWith("text/")) {
		throw new Error("Unexpected content type for CMUDict");
	}

	const contentLengthHeader = response.headers.get("content-length");
	if (contentLengthHeader && Number(contentLengthHeader) > MAX_BYTES) {
		throw new Error("CMUDict too large");
	}

	const blob = await response.blob();
	if (blob.size > MAX_BYTES) {
		throw new Error("CMUDict too large");
	}

	const text = await blob.text();
	console.log(`Downloaded ${text.length} characters of CMUDict data`);
	return text;
}

function saveToJson(payload: CmudictPayload): void {
	const wordCount = payload.meta.wordCount;
	console.log(`Saving ${wordCount} words to ${outputPath}`);

	const bytesWritten = writeJsonFile(outputPath, payload);
	console.log(`Saved ${bytesWritten} bytes to ${outputPath}`);
}

async function main(): Promise<void> {
	console.log("Starting CMUDict JSON generation...");

	ensureDirectoryForFile(outputPath);

	try {
		const content = await fetchCmudict();
		const parseResult = parseCmudict(content);

		const payload: CmudictPayload = {
			meta: {
				formatVersion: 2, // Bump version for new format
				source: "cmudict",
				sourceUrl: safeCmudictUrl,
				generatedAt: new Date().toISOString(),
				wordCount: parseResult.wordCount,
				variantCount: parseResult.variantCount,
				skippedLineCount: parseResult.skippedLineCount,
				deduplicatedVariantCount: parseResult.deduplicatedVariantCount,
			},
			data: parseResult.result,
		};

		saveToJson(payload);

		console.log("\nGeneration Summary:");
		console.log(`Words processed: ${payload.meta.wordCount}`);
		console.log(`Variants processed: ${payload.meta.variantCount}`);
		console.log(`Skipped lines: ${payload.meta.skippedLineCount}`);
		console.log(`Deduplicated variants: ${payload.meta.deduplicatedVariantCount}`);
		console.log(`Output file: ${outputPath}`);
		console.log("\nCMUDict JSON generation complete.");
	} catch (error) {
		console.error("Error during CMUDict generation:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
