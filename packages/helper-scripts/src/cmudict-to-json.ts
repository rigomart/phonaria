import * as fs from "node:fs";
import * as path from "node:path";
import { config } from "dotenv";

config();

// Type for the compact JSON format
type CompactCmudict = Record<string, string[]>;

const cmudictUrl = process.env.CMUDICT_SRC_URL;
const outputPath =
	process.env.CMUDICT_JSON_PATH || path.resolve(__dirname, "../../../apps/web/data/cmudict.json");

if (!cmudictUrl) {
	throw new Error("CMUDICT_SRC_URL environment variable is required");
}

// TypeScript knows cmudictUrl is defined after the check above
const safeCmudictUrl: string = cmudictUrl;

/**
 * Normalize CMUdict word format (remove parentheses but preserve case)
 */
function normalizeCmuWord(word: string): string {
	return word.replace(/\([^)]*\)/g, "");
}

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
function parseCmudict(content: string): CompactCmudict {
	const dict: CompactCmudict = {};
	const lines = content.split(/\r?\n/);

	let processed = 0;
	let skipped = 0;

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;
		if (line.startsWith(";") || line.startsWith("#")) continue;

		// Match word followed by phonemes, optionally followed by comment
		const match = line.match(/^(\S+)\s+(.+?)(?:\s*#.*)?$/);
		if (!match) {
			skipped++;
			continue;
		}

		const word = normalizeCmuWord(match[1]);
		const arpaPhonemes = match[2].trim();

		// Include all variants - they will be grouped by the normalized word (without parentheses)
		const existing = dict[word];
		if (existing) {
			if (Array.isArray(existing)) {
				existing.push(arpaPhonemes);
			} else {
				dict[word] = [existing, arpaPhonemes];
			}
		} else {
			dict[word] = [arpaPhonemes];
		}

		processed++;
	}

	console.log(`Parsed ${processed} entries, skipped ${skipped} invalid lines`);
	return dict;
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
function saveToJson(dict: CompactCmudict): void {
	const wordCount = Object.keys(dict).length;
	console.log(`Saving ${wordCount} words to ${outputPath}`);

	const json = JSON.stringify(dict, null, 0); // Minified for size
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
		const dict = parseCmudict(content);
		saveToJson(dict);

		console.log("\nGeneration Summary:");
		console.log(`Words processed: ${Object.keys(dict).length}`);
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
