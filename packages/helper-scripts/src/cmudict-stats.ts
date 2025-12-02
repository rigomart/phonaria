import * as fs from "node:fs";
import * as path from "node:path";
import type { CmudictPayload, CmudictStatsPayload } from "shared-data";
import { CmuArpaRegistry, getIpaForPhonemeId, getPhonemeIdForCmuArpa } from "shared-data";

const cmudictPath =
	process.env.CMUDICT_JSON_PATH ||
	path.resolve(__dirname, "../../shared-data/data/dict/cmudict.json");
const statsOutputPath =
	process.env.CMUDICT_STATS_JSON_PATH ||
	path.resolve(__dirname, "../../shared-data/data/dict/cmudict-stats.json");

/**
 * Extract ARPAbet token from a token string (removes stress markers)
 * Used for sequence analysis where stress is not needed
 */
function extractArpaToken(token: string): string {
	return token.replace(/[012]$/, "");
}

/**
 * Count syllables in an ARPAbet sequence (vowels with stress markers)
 */
function countSyllables(tokens: string[]): number {
	return tokens.filter((token) => /[012]$/.test(token)).length;
}

/**
 * Check if a token is a vowel (has stress marker)
 */
function isVowel(token: string): boolean {
	return /[012]$/.test(token);
}

/**
 * Check if a token is a consonant
 */
function isConsonant(token: string): boolean {
	const arpa = extractArpaToken(token);
	return !/[012]$/.test(token) && arpa in CmuArpaRegistry;
}

/**
 * Extract onset (consonants before first vowel) from a sequence
 */
function extractOnset(tokens: string[]): string[] {
	const onset: string[] = [];
	for (const token of tokens) {
		if (isVowel(token)) break;
		if (isConsonant(token)) {
			onset.push(extractArpaToken(token));
		}
	}
	return onset;
}

/**
 * Extract coda (consonants after last vowel) from a sequence
 */
function extractCoda(tokens: string[]): string[] {
	const coda: string[] = [];
	let foundLastVowel = false;
	for (let i = tokens.length - 1; i >= 0; i--) {
		const token = tokens[i];
		if (isVowel(token)) {
			foundLastVowel = true;
			continue;
		}
		if (foundLastVowel && isConsonant(token)) {
			coda.unshift(extractArpaToken(token));
		}
	}
	return coda;
}

/**
 * Generate bigrams from a sequence
 */
function generateBigrams(sequence: string[]): string[] {
	const bigrams: string[] = [];
	for (let i = 0; i < sequence.length - 1; i++) {
		bigrams.push(`${sequence[i]} ${sequence[i + 1]}`);
	}
	return bigrams;
}

/**
 * Generate trigrams from a sequence
 */
function generateTrigrams(sequence: string[]): string[] {
	const trigrams: string[] = [];
	for (let i = 0; i < sequence.length - 2; i++) {
		trigrams.push(`${sequence[i]} ${sequence[i + 1]} ${sequence[i + 2]}`);
	}
	return trigrams;
}

/**
 * Generate stats from CMUDict payload
 */
function generateStats(payload: CmudictPayload): CmudictStatsPayload {
	const { data, meta } = payload;

	// Phoneme statistics
	const phonemeTokenCounts = new Map<string, number>();
	const phonemeWordSets = new Map<string, Set<string>>();
	const phonemeTotalTokens = new Map<string, number>();

	// Syllable statistics
	const syllableCounts = new Map<number, number>();

	// Sequence statistics
	const onsetBigramCounts = new Map<string, number>();
	const codaBigramCounts = new Map<string, number>();
	const trigramCounts = new Map<string, number>();

	// Process all words
	for (const [word, variants] of Object.entries(data)) {
		// Process each variant
		for (const variant of variants) {
			const tokens = variant.split(/\s+/).filter((t) => t.length > 0);

			// Count syllables
			const syllableCount = countSyllables(tokens);
			syllableCounts.set(syllableCount, (syllableCounts.get(syllableCount) || 0) + 1);

			// Process tokens (keep stress markers for phoneme mapping)
			for (const token of tokens) {
				if (token.length > 0) {
					phonemeTokenCounts.set(token, (phonemeTokenCounts.get(token) || 0) + 1);
					if (!phonemeWordSets.has(token)) {
						phonemeWordSets.set(token, new Set());
					}
					phonemeWordSets.get(token)?.add(word);
					phonemeTotalTokens.set(token, (phonemeTotalTokens.get(token) || 0) + 1);
				}
			}

			// Extract sequences
			const allTokens = tokens.map(extractArpaToken);
			const onset = extractOnset(tokens);
			const coda = extractCoda(tokens);

			// Onset bigrams
			if (onset.length >= 2) {
				const bigrams = generateBigrams(onset);
				for (const bigram of bigrams) {
					onsetBigramCounts.set(bigram, (onsetBigramCounts.get(bigram) || 0) + 1);
				}
			}

			// Coda bigrams
			if (coda.length >= 2) {
				const bigrams = generateBigrams(coda);
				for (const bigram of bigrams) {
					codaBigramCounts.set(bigram, (codaBigramCounts.get(bigram) || 0) + 1);
				}
			}

			// Trigrams (from full sequence)
			if (allTokens.length >= 3) {
				const trigrams = generateTrigrams(allTokens);
				for (const trigram of trigrams) {
					trigramCounts.set(trigram, (trigramCounts.get(trigram) || 0) + 1);
				}
			}
		}
	}

	// Build phoneme stats
	const phonemes = Array.from(phonemeTokenCounts.entries())
		.map(([arpaToken, tokenCount]) => {
			const wordSet = phonemeWordSets.get(arpaToken);
			if (!wordSet) {
				throw new Error(`Missing word set for phoneme ${arpaToken}`);
			}
			const wordCoverage = wordSet.size;
			const totalTokens = phonemeTotalTokens.get(arpaToken) || 0;
			const averageTokensPerWord = wordCoverage > 0 ? totalTokens / wordCoverage : 0;

			// Map ARPA token (with stress) to IPA symbol via phoneme ID
			let ipa: string | null = null;
			try {
				if (arpaToken in CmuArpaRegistry) {
					const phonemeId = getPhonemeIdForCmuArpa(arpaToken as keyof typeof CmuArpaRegistry);
					ipa = getIpaForPhonemeId(phonemeId);
				}
			} catch {
				// Mapping failed, leave IPA as null
			}

			return {
				arpa: arpaToken,
				ipa,
				tokenCount,
				wordCoverage: {
					count: wordCoverage,
					percentage: meta.wordCount > 0 ? (wordCoverage / meta.wordCount) * 100 : 0,
				},
				averageTokensPerWord,
			};
		})
		.sort((a, b) => b.tokenCount - a.tokenCount);

	// Build syllable stats
	const totalWordsWithSyllables = Array.from(syllableCounts.values()).reduce((a, b) => a + b, 0);
	const syllables = Array.from(syllableCounts.entries())
		.map(([count, words]) => ({
			count,
			words,
			percentage: totalWordsWithSyllables > 0 ? (words / totalWordsWithSyllables) * 100 : 0,
		}))
		.sort((a, b) => a.count - b.count);

	// Build sequence stats (only if payload size is reasonable)
	const sequences = {
		onsets: Array.from(onsetBigramCounts.entries())
			.map(([bigram, count]) => ({ bigram, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 30),
		codas: Array.from(codaBigramCounts.entries())
			.map(([bigram, count]) => ({ bigram, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 30),
		trigrams: Array.from(trigramCounts.entries())
			.map(([trigram, count]) => ({ trigram, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 20),
	};

	// Calculate payload size estimate (rough)
	const payloadSizeEstimate = JSON.stringify({
		meta,
		overview: {},
		phonemes,
		syllables,
		sequences,
	}).length;

	// Only include sequences if payload is under ~1MB
	const includeSequences = payloadSizeEstimate < 1_000_000;

	// Count words with multiple pronunciations
	let multiplePronunciationCount = 0;
	for (const variants of Object.values(data)) {
		if (variants.length > 1) {
			multiplePronunciationCount++;
		}
	}

	const stats: CmudictStatsPayload = {
		meta: {
			generatedAt: new Date().toISOString(),
			source: meta.source,
			sourceUrl: meta.sourceUrl,
			wordCount: meta.wordCount,
			variantCount: meta.variantCount,
			multiplePronunciationCount,
		},
		overview: {
			words: meta.wordCount,
			variants: meta.variantCount,
			multiplePronunciationShare:
				meta.wordCount > 0 ? (multiplePronunciationCount / meta.wordCount) * 100 : 0,
		},
		phonemes,
		syllables,
		...(includeSequences && { sequences }),
	};

	return stats;
}

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(): void {
	const dir = path.dirname(statsOutputPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`Created output directory: ${dir}`);
	}
}

/**
 * Main function
 */
function main(): void {
	console.log("Starting CMUDict stats generation...");

	if (!fs.existsSync(cmudictPath)) {
		throw new Error(`CMUDict JSON not found at ${cmudictPath}. Run cmudict-to-json first.`);
	}

	ensureOutputDirectory();

	const cmudictContent = fs.readFileSync(cmudictPath, "utf-8");
	const cmudictPayload: CmudictPayload = JSON.parse(cmudictContent);

	console.log(`Loaded CMUDict with ${cmudictPayload.meta.wordCount} words`);

	const stats = generateStats(cmudictPayload);

	const json = JSON.stringify(stats, null, 0);
	fs.writeFileSync(statsOutputPath, json, "utf-8");

	const fileStats = fs.statSync(statsOutputPath);
	console.log(`\nStats Summary:`);
	console.log(`- Phonemes analyzed: ${stats.phonemes.length}`);
	console.log(`- Syllable counts: ${stats.syllables.length}`);
	console.log(`- Sequences included: ${stats.sequences ? "yes" : "no"}`);
	console.log(`\nSaved ${fileStats.size} bytes to ${statsOutputPath}`);
	console.log("\nCMUDict stats generation complete.");
}

if (require.main === module) {
	try {
		main();
	} catch (error) {
		console.error("Error during stats generation:", error);
		process.exit(1);
	}
}
