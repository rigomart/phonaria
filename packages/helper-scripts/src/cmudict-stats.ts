import * as fs from "node:fs";
import * as path from "node:path";
import type {
	CmudictPayload,
	CmudictStatsPayload,
	PhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { CmuArpaRegistry, getPhonemeIdForCmuArpa } from "@phonaria/phonetics-data";
import { ensureDirectoryForFile, writeJsonFile } from "./utils/fs";

const cmudictPath =
	process.env.CMUDICT_JSON_PATH ||
	path.resolve(__dirname, "../../phonetics-data/data/dict/cmudict.json");
const statsOutputPath =
	process.env.CMUDICT_STATS_JSON_PATH ||
	path.resolve(__dirname, "../../phonetics-data/data/dict/cmudict-stats.json");

/** Proxying vowels with stress markers to syllables. */
function countSyllables(tokens: string[]): number {
	return tokens.filter((token) => /[012]$/.test(token)).length;
}

function countSyllablesForWord(
	word: string,
	variants: string[],
	zeroSyllableWords: Set<string>,
): { syllableCount: number; tokensPerVariant: string[][] } {
	const tokensPerVariant = variants.map((variant) => variant.split(/\s+/).filter(Boolean));
	const syllableCounts = tokensPerVariant.map((tokens) => countSyllables(tokens));

	const representativeSyllableCount =
		syllableCounts.find((count) => count > 0) ?? syllableCounts[0] ?? 0;

	if (representativeSyllableCount === 0) {
		zeroSyllableWords.add(word);
		return { syllableCount: 1, tokensPerVariant };
	}

	return { syllableCount: representativeSyllableCount, tokensPerVariant };
}

function isCmuArpaToken(token: string): token is keyof typeof CmuArpaRegistry {
	return Object.hasOwn(CmuArpaRegistry, token);
}

type AggregatedCounts = {
	phonemeTokenCounts: Map<PhonemeSymbolId, number>;
	phonemeWordSets: Map<PhonemeSymbolId, Set<string>>;
	syllableCounts: Map<number, number>;
	zeroSyllableWords: Set<string>;
	multiplePronunciationCount: number;
};

const increment = <T>(map: Map<T, number>, key: T): void => {
	map.set(key, (map.get(key) || 0) + 1);
};

function aggregateCounts(data: CmudictPayload["data"]): AggregatedCounts {
	const phonemeTokenCounts = new Map<PhonemeSymbolId, number>();
	const phonemeWordSets = new Map<PhonemeSymbolId, Set<string>>();
	const syllableCounts = new Map<number, number>();
	const zeroSyllableWords = new Set<string>();
	let multiplePronunciationCount = 0;

	const getOrCreateWordSet = (phonemeId: PhonemeSymbolId): Set<string> => {
		const existing = phonemeWordSets.get(phonemeId);
		if (existing) return existing;
		const created = new Set<string>();
		phonemeWordSets.set(phonemeId, created);
		return created;
	};

	for (const [word, variants] of Object.entries(data)) {
		if (variants.length > 1) {
			multiplePronunciationCount++;
		}

		const { syllableCount, tokensPerVariant } = countSyllablesForWord(
			word,
			variants,
			zeroSyllableWords,
		);

		for (const tokens of tokensPerVariant) {
			for (const token of tokens) {
				if (!isCmuArpaToken(token)) continue;
				const phonemeId = getPhonemeIdForCmuArpa(token);
				increment(phonemeTokenCounts, phonemeId);
				getOrCreateWordSet(phonemeId).add(word);
			}
		}

		increment(syllableCounts, syllableCount);
	}

	return {
		phonemeTokenCounts,
		phonemeWordSets,
		syllableCounts,
		zeroSyllableWords,
		multiplePronunciationCount,
	};
}

function buildPhonemeStats(
	counts: AggregatedCounts,
	meta: CmudictPayload["meta"],
): CmudictStatsPayload["phonemes"] {
	const { phonemeTokenCounts, phonemeWordSets } = counts;

	// Build phoneme stats
	return Array.from(phonemeTokenCounts.entries())
		.map(([phonemeId, tokenCount]) => {
			const wordSet = phonemeWordSets.get(phonemeId);
			if (!wordSet) {
				throw new Error(`Missing word set for phoneme ${phonemeId}`);
			}
			const wordCoverage = wordSet.size;
			const averageTokensPerWord = wordCoverage > 0 ? tokenCount / wordCoverage : 0;

			return {
				phonemeId,
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

function generateStats(payload: CmudictPayload): {
	stats: CmudictStatsPayload;
	zeroSyllableWords: Set<string>;
} {
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

	return { stats, zeroSyllableWords: aggregated.zeroSyllableWords };
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

	const { stats, zeroSyllableWords } = generateStats(cmudictPayload);

	const bytesWritten = writeJsonFile(statsOutputPath, stats);

	console.log(`\nStats Summary:`);
	console.log(`- Phonemes analyzed: ${stats.phonemes.length}`);
	console.log(`- Syllable counts: ${stats.syllables.length}`);
	if (zeroSyllableWords.size > 0) {
		console.warn(
			`- Coerced ${zeroSyllableWords.size} entries with no detected syllables to 1 syllable: ${Array.from(
				zeroSyllableWords,
			)
				.slice(0, 5)
				.join(", ")}${zeroSyllableWords.size > 5 ? ", ..." : ""}`,
		);
	}
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
