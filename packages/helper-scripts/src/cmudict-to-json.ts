import * as path from "node:path";
import { CmuArpaMap, isCmuArpaToken } from "@phonaria/phonetics-data";
import { config } from "dotenv";
import { ensureDirectoryForFile, writeJsonFile } from "./utils/fs";

config();

function normalizeCmuWord(input: string): string {
	const base = input.includes("(") ? input.replace(/\(\d+\)$/, "") : input;
	return base.toUpperCase();
}

/**
 * Converts a single ARPABET token to our phoneme ID format.
 * Preserves stress markers on vowels (0, 1, 2).
 * @example
 * convertArpaToken("P") // "P"
 * convertArpaToken("AW1") // "AU1"
 * convertArpaToken("AH0") // "AX0"  (unstressed schwa)
 * convertArpaToken("AH1") // "AH1" (stressed strut)
 */
function convertArpaToken(token: string): string | null {
	if (!isCmuArpaToken(token)) {
		return null;
	}

	const phonemeId = CmuArpaMap[token];

	// Check if token ends with stress marker (0, 1, 2)
	const stressMatch = token.match(/([012])$/);
	if (stressMatch) {
		const stress = stressMatch[1];
		// Append stress to phoneme ID (e.g., "AU" + "1" = "AU1")
		return `${phonemeId}${stress}`;
	}

	// Consonant or no stress marker
	return phonemeId;
}

/**
 * Converts a full ARPABET pronunciation string to our phoneme ID format.
 * @example
 * convertArpaVariant("AH0 B AW1 T") // "AX B AU1 T"
 * convertArpaVariant("K AE1 T") // "K AE1 T"
 */
function convertArpaVariant(variant: string): string {
	const tokens = variant.split(/\s+/).filter((t) => t.length > 0);
	const converted: string[] = [];

	for (const token of tokens) {
		const phonemeId = convertArpaToken(token);
		if (phonemeId) {
			converted.push(phonemeId);
		} else {
			console.warn(`Warning: Unknown ARPABET token '${token}', skipping`);
		}
	}

	return converted.join(" ");
}

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

		// Convert ARPABET to our phoneme ID format
		const convertedVariant = convertArpaVariant(arpaPhonemes);
		if (!convertedVariant) {
			skipped++;
			continue;
		}

		const existingVariants = dictMap.get(normalizedWord);
		if (existingVariants) {
			const sizeBefore = existingVariants.size;
			existingVariants.add(convertedVariant);
			if (existingVariants.size === sizeBefore) {
				deduplicatedVariants++;
			}
		} else {
			dictMap.set(normalizedWord, new Set([convertedVariant]));
		}

		processed++;
	}

	console.log(`Parsed ${processed} entries, skipped ${skipped} invalid lines`);
	console.log(`Removed ${deduplicatedVariants} duplicate variants`);

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
