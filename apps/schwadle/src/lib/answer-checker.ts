import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { extractBasePhonemeId } from "@phonaria/phonetics-data/languages/en";

export type PhonemeResultStatus = "correct" | "wrong" | "missing" | "extra";

export type PhonemeResult = {
	phonemeId: EnglishPhonemeSymbolId;
	status: PhonemeResultStatus;
	/** For "wrong" status: the phoneme that was expected at this position */
	expectedPhonemeId?: EnglishPhonemeSymbolId;
};

export type AnswerResult = {
	isCorrect: boolean;
	bestMatchVariant: string;
	phonemeResults: PhonemeResult[];
};

/**
 * Converts a CMU variant string (e.g. "K AE1 T") to an array of base phoneme IDs.
 */
export function cmuVariantToPhonemeIds(variant: string): EnglishPhonemeSymbolId[] {
	return variant
		.split(" ")
		.filter((token) => token.length > 0)
		.map((token) => extractBasePhonemeId(token) as EnglishPhonemeSymbolId);
}

/**
 * Computes the Longest Common Subsequence length matrix.
 */
function lcsMatrix(a: string[], b: string[]): number[][] {
	const m = a.length;
	const n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (a[i - 1] === b[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1] + 1;
			} else {
				dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
			}
		}
	}

	return dp;
}

/**
 * Produces a per-phoneme alignment diff using LCS backtracking.
 * Handles correct matches, substitutions, insertions (extra), and deletions (missing).
 */
function alignPhonemes(
	playerInput: EnglishPhonemeSymbolId[],
	expected: EnglishPhonemeSymbolId[],
): PhonemeResult[] {
	const dp = lcsMatrix(playerInput, expected);
	const results: PhonemeResult[] = [];

	let i = playerInput.length;
	let j = expected.length;

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && playerInput[i - 1] === expected[j - 1]) {
			// Match
			results.push({ phonemeId: playerInput[i - 1], status: "correct" });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			// Deletion: expected phoneme is missing from player input
			results.push({ phonemeId: expected[j - 1], status: "missing" });
			j--;
		} else {
			// Insertion: player added an extra phoneme
			results.push({ phonemeId: playerInput[i - 1], status: "extra" });
			i--;
		}
	}

	results.reverse();
	return results;
}

/**
 * Checks the player's phoneme sequence against all CMU variants for a word.
 *
 * Returns whether the answer is correct (exact match against any variant),
 * the best matching variant, and a per-phoneme diff for the results screen.
 */
export function checkAnswer(
	playerInput: EnglishPhonemeSymbolId[],
	cmuVariants: string[],
): AnswerResult {
	const variantPhonemes = cmuVariants.map((v) => ({
		variant: v,
		phonemeIds: cmuVariantToPhonemeIds(v),
	}));

	// Check for exact match against any variant
	for (const { variant, phonemeIds } of variantPhonemes) {
		if (
			playerInput.length === phonemeIds.length &&
			playerInput.every((p, idx) => p === phonemeIds[idx])
		) {
			return {
				isCorrect: true,
				bestMatchVariant: variant,
				phonemeResults: playerInput.map((p) => ({ phonemeId: p, status: "correct" })),
			};
		}
	}

	// No exact match — find the best matching variant (highest LCS length)
	let bestVariant = variantPhonemes[0];
	let bestLcsLength = 0;

	for (const vp of variantPhonemes) {
		const dp = lcsMatrix(playerInput, vp.phonemeIds);
		const lcsLen = dp[playerInput.length][vp.phonemeIds.length];
		if (lcsLen > bestLcsLength) {
			bestLcsLength = lcsLen;
			bestVariant = vp;
		}
	}

	return {
		isCorrect: false,
		bestMatchVariant: bestVariant.variant,
		phonemeResults: alignPhonemes(playerInput, bestVariant.phonemeIds),
	};
}
