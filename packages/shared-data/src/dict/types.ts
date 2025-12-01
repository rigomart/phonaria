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
		generatedAt: string;
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
		arpa: string;
		ipa: string | null;
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
	sequences?: {
		onsets: Array<{
			bigram: string;
			count: number;
		}>;
		codas: Array<{
			bigram: string;
			count: number;
		}>;
		trigrams: Array<{
			trigram: string;
			count: number;
		}>;
	};
};
