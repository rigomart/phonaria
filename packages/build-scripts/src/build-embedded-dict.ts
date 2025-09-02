#!/usr/bin/env tsx

/**
 * Build Embedded Dictionary Script
 *
 * This script generates an optimized embedded dictionary for Phase 2 of the G2P enhancement.
 * It downloads the Google 10,000 most common English words and cross-references them with
 * the full CMUdict to create a frequency-based embedded dictionary.
 *
 * Output: public/data/embedded-dict.json
 * Format: ARPABET phonemes (converted to IPA at runtime)
 * Size target: ~300-500KB
 * Coverage: ~7k-9k words including all homographs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// URLs for data sources
const GOOGLE_10K_URL =
	"https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt";
const CMUDICT_URL =
	"https://raw.githubusercontent.com/Alexir/CMUdict/refs/heads/master/cmudict-0.7b";

// Known homographs that should always be included regardless of frequency
const FORCE_INCLUDE_HOMOGRAPHS = [
	"LEAD", // /liːd/ (to guide) vs /led/ (metal)
	"READ", // /riːd/ (present) vs /red/ (past)
	"RECORD", // /rɪˈkɔːrd/ (verb) vs /ˈrekərd/ (noun)
	"OBJECT", // /əbˈdʒekt/ (verb) vs /ˈɒbdʒɪkt/ (noun)
	"SUBJECT", // /səbˈdʒekt/ (verb) vs /ˈsʌbdʒɪkt/ (noun)
	"PRESENT", // /prɪˈzent/ (verb) vs /ˈprezənt/ (noun)
	"PRODUCE", // /prəˈduːs/ (verb) vs /ˈproʊdus/ (noun)
	"CONDUCT", // /kənˈdʌkt/ (verb) vs /ˈkɒndʌkt/ (noun)
	"CONTEST", // /kənˈtest/ (verb) vs /ˈkɒntest/ (noun)
	"CONTENT", // /kənˈtent/ (adjective) vs /ˈkɒntent/ (noun)
	"DESERT", // /dɪˈzɜːrt/ (verb) vs /ˈdezərt/ (noun)
	"MINUTE", // /maɪˈnuːt/ (adjective) vs /ˈmɪnɪt/ (noun)
	"TEAR", // /ter/ (verb) vs /tɪər/ (noun)
	"WIND", // /waɪnd/ (verb) vs /wɪnd/ (noun)
	"BOW", // /boʊ/ (noun) vs /baʊ/ (verb)
];

interface EmbeddedDictEntry {
	[word: string]: string[][];
}

interface DictMetadata {
	version: string;
	buildTimestamp: string;
	totalWords: number;
	googleWordsCount: number;
	homographsCount: number;
	source: {
		googleWords: string;
		cmudict: string;
	};
}

interface EmbeddedDict {
	metadata: DictMetadata;
	words: EmbeddedDictEntry;
}

/**
 * Download text content from URL
 */
async function downloadText(url: string): Promise<string> {
	console.log(`Downloading: ${url}`);
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to download ${url}: ${response.statusText}`);
	}

	return response.text();
}

/**
 * Parse CMUdict content and return a Map of word -> pronunciations
 */
function parseCMUDict(content: string): Map<string, string[][]> {
	const dict = new Map<string, string[][]>();
	const lines = content.split(/\r?\n/);

	for (const line of lines) {
		if (line.startsWith(";;;") || !line.trim()) continue;

		const parts = line.split("  ");
		if (parts.length !== 2) continue;

		const [wordPart, phonemePart] = parts;

		// Extract base word from variants (LEAD(1) → LEAD)
		let baseWord = wordPart;
		if (wordPart.includes("(")) {
			baseWord = wordPart.replace(/\(\d+\)$/, "");
		}

		const word = baseWord.toUpperCase();
		const phonemes = phonemePart.trim().split(/\s+/);

		// Store multiple variants per word (keep as ARPABET)
		if (!dict.has(word)) {
			dict.set(word, []);
		}
		const existingVariants = dict.get(word);
		if (existingVariants) {
			existingVariants.push(phonemes);
		}
	}

	console.log(`Parsed CMUdict: ${dict.size} unique words`);
	return dict;
}

/**
 * Parse Google 10k words list
 */
function parseGoogleWords(content: string): string[] {
	return content
		.split(/\r?\n/)
		.map((word) => word.trim().toUpperCase())
		.filter((word) => word.length > 0);
}

/**
 * Build the embedded dictionary
 */
async function buildEmbeddedDict(): Promise<EmbeddedDict> {
	console.log("Starting embedded dictionary build...");

	// Download source data
	const [googleWordsText, cmudictText] = await Promise.all([
		downloadText(GOOGLE_10K_URL),
		downloadText(CMUDICT_URL),
	]);

	// Parse data
	const googleWords = parseGoogleWords(googleWordsText);
	const cmudict = parseCMUDict(cmudictText);

	console.log(`Google words: ${googleWords.length}`);
	console.log(`CMUdict words: ${cmudict.size}`);

	// Build embedded dictionary
	const embeddedWords: EmbeddedDictEntry = {};
	let googleWordsFound = 0;
	let homographsAdded = 0;

	// Add Google 10k words (in frequency order)
	for (const word of googleWords) {
		const pronunciations = cmudict.get(word);
		if (pronunciations) {
			embeddedWords[word] = pronunciations;
			googleWordsFound++;
		}
	}

	// Force-include homographs (even if not in top 10k)
	for (const homograph of FORCE_INCLUDE_HOMOGRAPHS) {
		const pronunciations = cmudict.get(homograph);
		if (pronunciations && !embeddedWords[homograph]) {
			embeddedWords[homograph] = pronunciations;
			homographsAdded++;
		}
	}

	const totalWords = Object.keys(embeddedWords).length;

	console.log(`✓ Embedded dictionary built:`);
	console.log(`  - Google words found: ${googleWordsFound}`);
	console.log(`  - Homographs added: ${homographsAdded}`);
	console.log(`  - Total words: ${totalWords}`);

	// Create metadata
	const metadata: DictMetadata = {
		version: "0.7b",
		buildTimestamp: new Date().toISOString(),
		totalWords,
		googleWordsCount: googleWordsFound,
		homographsCount: homographsAdded,
		source: {
			googleWords: GOOGLE_10K_URL,
			cmudict: CMUDICT_URL,
		},
	};

	return {
		metadata,
		words: embeddedWords,
	};
}

/**
 * Write embedded dictionary to file
 */
function writeEmbeddedDict(dict: EmbeddedDict): void {
	// Write to the web app's public/data directory
	const outputDir = join(process.cwd(), "../../apps/web/public/data");
	const outputPath = join(outputDir, "embedded-dict.json");

	// Ensure output directory exists
	mkdirSync(outputDir, { recursive: true });

	// Write JSON file
	const jsonContent = JSON.stringify(dict, null, 2);
	writeFileSync(outputPath, jsonContent, "utf8");

	// Calculate file size
	const sizeKB = Math.round(jsonContent.length / 1024);

	console.log(`✓ Embedded dictionary written to: ${outputPath}`);
	console.log(`  - File size: ${sizeKB}KB`);
	console.log(`  - Words: ${dict.metadata.totalWords}`);

	// Warn if file is too large
	if (sizeKB > 500) {
		console.warn(`⚠️  File size (${sizeKB}KB) exceeds target of 500KB`);
	}
}

/**
 * Display summary statistics
 */
function displaySummary(dict: EmbeddedDict): void {
	const { metadata, words } = dict;

	console.log("\n📊 Build Summary:");
	console.log(`   Version: ${metadata.version}`);
	console.log(`   Build time: ${metadata.buildTimestamp}`);
	console.log(`   Total words: ${metadata.totalWords}`);
	console.log(`   Google words: ${metadata.googleWordsCount}`);
	console.log(`   Homographs: ${metadata.homographsCount}`);

	// Show some example entries
	console.log("\n📝 Sample entries:");
	const sampleWords = Object.keys(words).slice(0, 5);
	for (const word of sampleWords) {
		const variants = words[word];
		console.log(`   ${word}: ${variants.length} variant(s)`);
		for (let i = 0; i < variants.length; i++) {
			console.log(`     ${i + 1}. [${variants[i].join(" ")}]`);
		}
	}

	// Show homograph examples
	const homographExamples = FORCE_INCLUDE_HOMOGRAPHS.filter((h) => words[h]).slice(0, 3);
	if (homographExamples.length > 0) {
		console.log("\n🔀 Homograph examples:");
		for (const word of homographExamples) {
			const variants = words[word];
			console.log(`   ${word}: ${variants.length} pronunciations`);
			for (let i = 0; i < variants.length; i++) {
				console.log(`     ${i + 1}. [${variants[i].join(" ")}]`);
			}
		}
	}
}

/**
 * Main build function
 */
async function main(): Promise<void> {
	try {
		console.log("🏗️  Building Embedded Dictionary for Phase 2");
		console.log("=".repeat(50));

		const dict = await buildEmbeddedDict();
		writeEmbeddedDict(dict);
		displaySummary(dict);

		console.log("\n✅ Embedded dictionary build complete!");
		console.log("   Ready for Phase 2 implementation.");
	} catch (error) {
		console.error("❌ Build failed:", error);
		process.exit(1);
	}
}

// Run the build if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { buildEmbeddedDict, type EmbeddedDict, type DictMetadata };
