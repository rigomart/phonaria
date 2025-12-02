import * as fs from "node:fs";
import * as path from "node:path";
import type { CmudictPayload, CmudictStatsPayload } from "shared-data";
import { CmuArpaRegistry, getIpaForPhonemeId, getPhonemeIdForCmuArpa } from "shared-data";
import { ensureDirectoryForFile, writeJsonFile } from "./utils/fs";

const cmudictPath =
	process.env.CMUDICT_JSON_PATH ||
	path.resolve(__dirname, "../../shared-data/data/dict/cmudict.json");
const statsOutputPath =
	process.env.CMUDICT_STATS_JSON_PATH ||
	path.resolve(__dirname, "../../shared-data/data/dict/cmudict-stats.json");

/** Proxying vowels with stress markers to syllables. */
function countSyllables(tokens: string[]): number {
	return tokens.filter((token) => /[012]$/.test(token)).length;
}

type AggregatedCounts = {
	phonemeTokenCounts: Map<string, number>;
	phonemeWordSets: Map<string, Set<string>>;
	syllableCounts: Map<number, number>;
	multiplePronunciationCount: number;
};

const increment = <T>(map: Map<T, number>, key: T): void => {
	map.set(key, (map.get(key) || 0) + 1);
};

function aggregateCounts(data: CmudictPayload["data"]): AggregatedCounts {
	const phonemeTokenCounts = new Map<string, number>();
	const phonemeWordSets = new Map<string, Set<string>>();
	const syllableCounts = new Map<number, number>();
	let multiplePronunciationCount = 0;

	const getOrCreateWordSet = (arpaToken: string): Set<string> => {
		const existing = phonemeWordSets.get(arpaToken);
		if (existing) return existing;
		const created = new Set<string>();
		phonemeWordSets.set(arpaToken, created);
		return created;
	};

	for (const [word, variants] of Object.entries(data)) {
		if (variants.length > 1) {
			multiplePronunciationCount++;
		}

		for (const variant of variants) {
			const tokens = variant.split(/\s+/).filter((t) => t.length > 0);
			const syllableCount = countSyllables(tokens);
			increment(syllableCounts, syllableCount);

			for (const token of tokens) {
				if (token.length > 0) {
					increment(phonemeTokenCounts, token);
					getOrCreateWordSet(token).add(word);
				}
			}
		}
	}

	return { phonemeTokenCounts, phonemeWordSets, syllableCounts, multiplePronunciationCount };
}

function buildPhonemeStats(
	counts: AggregatedCounts,
	meta: CmudictPayload["meta"],
): CmudictStatsPayload["phonemes"] {
	const { phonemeTokenCounts, phonemeWordSets } = counts;

	// Build phoneme stats
	return Array.from(phonemeTokenCounts.entries())
		.map(([arpaToken, tokenCount]) => {
			const wordSet = phonemeWordSets.get(arpaToken);
			if (!wordSet) {
				throw new Error(`Missing word set for phoneme ${arpaToken}`);
			}
			const wordCoverage = wordSet.size;
			const averageTokensPerWord = wordCoverage > 0 ? tokenCount / wordCoverage : 0;

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
		.sort((a, b) => b.wordCoverage.percentage - a.wordCoverage.percentage);
}

function buildSyllableStats(
	syllableCounts: AggregatedCounts["syllableCounts"],
): CmudictStatsPayload["syllables"] {
	const totalWordsWithSyllables = Array.from(syllableCounts.values()).reduce((a, b) => a + b, 0);

	return Array.from(syllableCounts.entries())
		.map(([count, words]) => ({
			count,
			words,
			percentage: totalWordsWithSyllables > 0 ? (words / totalWordsWithSyllables) * 100 : 0,
		}))
		.sort((a, b) => a.count - b.count);
}

function generateStats(payload: CmudictPayload): CmudictStatsPayload {
	const { data, meta } = payload;

	const aggregated = aggregateCounts(data);
	const phonemes = buildPhonemeStats(aggregated, meta);
	const syllables = buildSyllableStats(aggregated.syllableCounts);

	const stats: CmudictStatsPayload = {
		meta: {
			generatedAt: Date.now(),
			source: meta.source,
			sourceUrl: meta.sourceUrl,
			wordCount: meta.wordCount,
			variantCount: meta.variantCount,
			multiplePronunciationCount: aggregated.multiplePronunciationCount,
		},
		overview: {
			words: meta.wordCount,
			variants: meta.variantCount,
			multiplePronunciationShare:
				meta.wordCount > 0 ? (aggregated.multiplePronunciationCount / meta.wordCount) * 100 : 0,
		},
		phonemes,
		syllables,
	};

	return stats;
}

function main(): void {
	console.log("Starting CMUDict stats generation...");

	if (!fs.existsSync(cmudictPath)) {
		throw new Error(`CMUDict JSON not found at ${cmudictPath}. Run cmudict-to-json first.`);
	}

	ensureDirectoryForFile(statsOutputPath);

	const cmudictContent = fs.readFileSync(cmudictPath, "utf-8");
	const cmudictPayload: CmudictPayload = JSON.parse(cmudictContent);

	console.log(`Loaded CMUDict with ${cmudictPayload.meta.wordCount} words`);

	const stats = generateStats(cmudictPayload);

	const bytesWritten = writeJsonFile(statsOutputPath, stats);

	console.log(`\nStats Summary:`);
	console.log(`- Phonemes analyzed: ${stats.phonemes.length}`);
	console.log(`- Syllable counts: ${stats.syllables.length}`);
	console.log(`\nSaved ${bytesWritten} bytes to ${statsOutputPath}`);
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
