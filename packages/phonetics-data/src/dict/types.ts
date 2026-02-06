import type { PhonemeSymbolId } from "../core/ipa-map";

export type PhonemeTrieNode = {
	words: string[];
	count: number;
	next: Record<string, PhonemeTrieNode>;
};

export type CmudictPayload = {
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
	data: Record<string, string[]>;
};

export type CmudictStatsPayload = {
	meta: {
		generatedAt: number;
		source: string;
		sourceUrl: string;
		wordCount: number;
		variantCount: number;
		multiplePronunciationCount: number;
	};
	overview: {
		words: number;
		variants: number;
		multiplePronunciationShare: number;
	};
	phonemes: Array<{
		phonemeId: PhonemeSymbolId;
		tokenCount: number;
		wordCoverage: {
			count: number;
			percentage: number;
		};
		averageTokensPerWord: number;
	}>;
	syllables: Array<{
		count: number;
		words: number;
		percentage: number;
	}>;
};
