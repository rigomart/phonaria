import * as fs from "node:fs";
import * as path from "node:path";
import { config } from "dotenv";
import { normalizeCmuWord } from "shared-data";

config();

// Type for the compact JSON format
type CompactCmudict = Record<string, string[]>;

// Type for the new payload format with metadata
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
	process.env.CMUDICT_JSON_PATH || path.resolve(__dirname, "../../../apps/web/data/cmudict.json");

if (!cmudictUrl) {
	throw new Error("CMUDICT_SRC_URL environment variable is required");
}

// TypeScript knows cmudictUrl is defined after the check above
const safeCmudictUrl: string = cmudictUrl;

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(): void {
	const dir = path.dirname(outputPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`Created output directory: ${dir}`);
	}
}

/**
 * Parse CMUDict content and convert to compact JSON format
 */
function parseCmudict(content: string): {
	result: CompactCmudict;
	wordCount: number;
	variantCount: number;
	skippedLineCount: number;
	deduplicatedVariantCount: number;
} {
	const dictMap = new Map<string, Set<string>>();
	const lines = content.split(/\r?\n/);

	let processed = 0;
	let skipped = 0;
	let deduplicatedVariants = 0;

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const rawLine = lines[lineIndex];
		const line = rawLine.trim();
		if (!line) continue;
		if (line.startsWith(";") || line.startsWith("#")) continue;

		// Match word followed by phonemes, optionally followed by comment
		const match = line.match(/^(\S+)\s+(.+?)(?:\s*#.*)?$/);
		if (!match) {
			skipped++;
			continue;
		}

		const rawWord = match[1];
		const arpaPhonemes = match[2].trim();

		// Skip entries with empty phonemes
		if (!arpaPhonemes) {
			console.warn(
				`Warning: Empty phonemes for word '${rawWord}' on line ${lineIndex + 1}: ${line}`,
			);
			skipped++;
			continue;
		}

		const normalizedWord = normalizeCmuWord(rawWord);
		if (!normalizedWord) {
			skipped++;
			continue;
		}

		const sanitizedVariant = arpaPhonemes.replace(/\s+/g, " ").trim();
		const existingVariants = dictMap.get(normalizedWord);
		if (existingVariants) {
			const sizeBefore = existingVariants.size;
			existingVariants.add(sanitizedVariant);
			if (existingVariants.size === sizeBefore) {
				deduplicatedVariants++;
			}
		} else {
			dictMap.set(normalizedWord, new Set([sanitizedVariant]));
		}

		processed++;
	}

	console.log(`Parsed ${processed} entries, skipped ${skipped} invalid lines`);
	console.log(`Removed ${deduplicatedVariants} duplicate ARPAbet variants`);

	// Convert Map back to object for return type compatibility
	const result: CompactCmudict = {};
	let variantCount = 0;
	for (const [word, variants] of dictMap.entries()) {
		if (variants.size === 0) {
			continue;
		}

		result[word] = Array.from(variants);
		variantCount += variants.size;
	}

	const wordCount = Object.keys(result).length;

	return {
		result,
		wordCount,
		variantCount,
		skippedLineCount: skipped,
		deduplicatedVariantCount: deduplicatedVariants,
	};
}

/**
 * Fetch CMUDict data from URL
 */
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

/**
 * Save dictionary to JSON file
 */
function saveToJson(payload: CmudictPayload): void {
	const wordCount = payload.meta.wordCount;
	console.log(`Saving ${wordCount} words to ${payload.meta.sourceUrl}`);

	const json = JSON.stringify(payload, null, 0);
	fs.writeFileSync(outputPath, json, "utf-8");

	const stats = fs.statSync(outputPath);
	console.log(`Saved ${stats.size} bytes to ${outputPath}`);
}

/**
 * Generate CMUDict JSON file
 */
async function main(): Promise<void> {
	console.log("Starting CMUDict JSON generation...");

	ensureOutputDirectory();

	try {
		const content = await fetchCmudict();
		const parseResult = parseCmudict(content);

		const payload: CmudictPayload = {
			meta: {
				formatVersion: 1,
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
