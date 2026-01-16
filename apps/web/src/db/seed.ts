import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import {
	type CmudictPayload,
	type CmudictStatsPayload,
	extractBasePhonemeId,
	getArpabetForPhonemeId,
	isValidPhonemeToken,
	type PhonemeSymbolId,
} from "@phonaria/phonetics-data";
import { and, eq } from "drizzle-orm";

function normalizeCmuWord(input: string): string {
	const trimmed = input.trim();
	const withoutVariant = trimmed.replace(/\(\d+\)$/, "");
	return withoutVariant.toUpperCase();
}

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

function buildPhonemeKey(variant: string): string {
	const tokens = variant.split(/\s+/).filter(Boolean);
	const labels: string[] = [];
	for (const token of tokens) {
		if (!isValidPhonemeToken(token)) continue;
		const phonemeId = extractBasePhonemeId(token);
		labels.push(getArpabetForPhonemeId(phonemeId));
	}
	return labels.join("-");
}

type AggregatedCounts = {
	phonemeTokenCounts: Map<PhonemeSymbolId, number>;
	phonemeWordCoverageCounts: Map<PhonemeSymbolId, number>;
	syllableCounts: Map<number, number>;
	zeroSyllableWords: Set<string>;
	multiplePronunciationCount: number;
};

const increment = <T>(map: Map<T, number>, key: T, by = 1): void => {
	map.set(key, (map.get(key) || 0) + by);
};

function aggregateCounts(data: CmudictPayload["data"]): AggregatedCounts {
	const phonemeTokenCounts = new Map<PhonemeSymbolId, number>();
	const phonemeWordCoverageCounts = new Map<PhonemeSymbolId, number>();
	const syllableCounts = new Map<number, number>();
	const zeroSyllableWords = new Set<string>();
	let multiplePronunciationCount = 0;

	for (const [word, variants] of Object.entries(data)) {
		if (variants.length > 1) {
			multiplePronunciationCount++;
		}

		const { syllableCount, tokensPerVariant } = countSyllablesForWord(
			word,
			variants,
			zeroSyllableWords,
		);

		const uniquePhonemesInWord = new Set<PhonemeSymbolId>();

		for (const tokens of tokensPerVariant) {
			for (const token of tokens) {
				if (!isValidPhonemeToken(token)) continue;
				const phonemeId = extractBasePhonemeId(token);
				increment(phonemeTokenCounts, phonemeId);
				uniquePhonemesInWord.add(phonemeId);
			}
		}

		for (const phonemeId of uniquePhonemesInWord) {
			increment(phonemeWordCoverageCounts, phonemeId);
		}

		increment(syllableCounts, syllableCount);
	}

	return {
		phonemeTokenCounts,
		phonemeWordCoverageCounts,
		syllableCounts,
		zeroSyllableWords,
		multiplePronunciationCount,
	};
}

function buildStats(payload: CmudictPayload): {
	stats: CmudictStatsPayload;
	zeroSyllableWords: Set<string>;
} {
	const { data, meta } = payload;
	const aggregated = aggregateCounts(data);

	const phonemes = Array.from(aggregated.phonemeTokenCounts.entries())
		.map(([phonemeId, tokenCount]) => {
			const wordCoverageCount = aggregated.phonemeWordCoverageCounts.get(phonemeId) || 0;
			return {
				phonemeId,
				tokenCount,
				wordCoverage: {
					count: wordCoverageCount,
					percentage: meta.wordCount > 0 ? (wordCoverageCount / meta.wordCount) * 100 : 0,
				},
				averageTokensPerWord: wordCoverageCount > 0 ? tokenCount / wordCoverageCount : 0,
			};
		})
		.sort((a, b) => b.wordCoverage.percentage - a.wordCoverage.percentage);

	const totalWordsWithSyllables = Array.from(aggregated.syllableCounts.values()).reduce(
		(a, b) => a + b,
		0,
	);

	const syllables = Array.from(aggregated.syllableCounts.entries())
		.map(([count, words]) => ({
			count,
			words,
			percentage: totalWordsWithSyllables > 0 ? (words / totalWordsWithSyllables) * 100 : 0,
		}))
		.sort((a, b) => a.count - b.count);

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

function getDefaultCmudictJsonPath(projectDir: string): string {
	const repoRoot = path.resolve(projectDir, "../..");
	return path.resolve(repoRoot, "packages/phonetics-data/data/dict/cmudict.json");
}

async function loadFullPayload(projectDir: string): Promise<CmudictPayload> {
	const cmudictJsonPath = process.env.CMUDICT_JSON_PATH || getDefaultCmudictJsonPath(projectDir);

	if (!fs.existsSync(cmudictJsonPath)) {
		throw new Error(
			`CMUDict JSON not found at ${cmudictJsonPath}. Generate it with the helper script and try again.`,
		);
	}

	const raw = fs.readFileSync(cmudictJsonPath, "utf-8");
	const parsed = JSON.parse(raw) as unknown;

	// Intentionally light validation: this is a local, generated artifact.
	if (
		!parsed ||
		typeof parsed !== "object" ||
		!("meta" in parsed) ||
		!("data" in parsed) ||
		typeof (parsed as { data?: unknown }).data !== "object"
	) {
		throw new Error(`Invalid CMUDict JSON payload at ${cmudictJsonPath}`);
	}

	return parsed as CmudictPayload;
}

async function seedWordsAndStats(payload: CmudictPayload): Promise<void> {
	const { stats, zeroSyllableWords } = buildStats(payload);

	console.log(`\nSeeding ${payload.meta.wordCount} words (${payload.meta.variantCount} variants)`);

	const { db } = await import("./drizzle");
	const { dictionaryStats, words } = await import("./schema");

	// NOTE: `drizzle-orm/neon-http` does not support interactive transactions (`db.transaction()`).
	// For Neon HTTP, prefer `db.batch([...])` for multi-statement atomicity where needed.

	await db.batch([db.delete(dictionaryStats), db.delete(words)]);

	const zeroSyllableWordsDuringInsert = new Set<string>();

	const entries = Object.entries(payload.data);
	const BATCH_SIZE = 1000;

	for (let offset = 0; offset < entries.length; offset += BATCH_SIZE) {
		const batch = entries.slice(offset, offset + BATCH_SIZE);
		const rows = batch.map(([rawWord, variants]) => {
			const word = normalizeCmuWord(rawWord);
			const representativeVariant = variants[0] ?? "";
			const { syllableCount } = countSyllablesForWord(
				word,
				variants,
				zeroSyllableWordsDuringInsert,
			);

			return {
				word,
				phonemeKey: buildPhonemeKey(representativeVariant),
				cmuVariants: variants,
				syllableCount,
			};
		});

		// Avoid inserting empty batches if the input is weirdly sparse.
		if (rows.length > 0) {
			await db.insert(words).values(rows);
		}

		if (offset === 0 || offset + BATCH_SIZE >= entries.length || offset % (BATCH_SIZE * 50) === 0) {
			console.log(
				`- Inserted ${Math.min(offset + BATCH_SIZE, entries.length)} / ${entries.length}`,
			);
		}
	}

	// Store the full payload shape so Phase 5 can migrate Insights with minimal reshaping.
	// (We always wipe for `sample`, and we require --wipe for `--full`, but keep the delete
	// anyway to be robust if that policy ever changes.)
	await db
		.delete(dictionaryStats)
		.where(and(eq(dictionaryStats.statType, "overview"), eq(dictionaryStats.statKey, "global")));

	await db.insert(dictionaryStats).values({
		statType: "overview",
		statKey: "global",
		data: stats,
	});

	if (zeroSyllableWordsDuringInsert.size > 0) {
		console.warn(
			`Coerced ${zeroSyllableWordsDuringInsert.size} words with 0 detected syllables to 1 (during insert).`,
		);
	}

	if (zeroSyllableWords.size > 0) {
		console.warn(
			`Coerced ${zeroSyllableWords.size} words with 0 detected syllables to 1 (during stats).`,
		);
	}

	console.log("Seed complete.");
}

async function main(): Promise<void> {
	// Ensure env loading is stable even if the script is executed from the repo root.
	const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
	loadEnvConfig(projectDir);

	const payload = await loadFullPayload(projectDir);
	await seedWordsAndStats(payload);
}

main().catch((error) => {
	console.error("Seed failed:", error);
	process.exit(1);
});
