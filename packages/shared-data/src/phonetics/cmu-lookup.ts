import {
	type PhonemeCategory,
	type PhonemeSymbol,
	type PhonemeSymbolId,
	allPhonemeSymbols,
} from "./symbols-registry";

export type CmuPhonemeMapping = {
	phonemeId: PhonemeSymbolId;
	category: PhonemeCategory;
	ipa: PhonemeSymbol["ipa"];
	arpa: PhonemeSymbol["arpa"];
};

const cmuTokenToPhonemeMap = (() => {
	const map = new Map<string, CmuPhonemeMapping>();

	for (const [phonemeId, symbol] of Object.entries(allPhonemeSymbols) as [
		PhonemeSymbolId,
		PhonemeSymbol,
	][]) {
		for (const token of symbol.cmuArpa) {
			const normalizedToken = normalizeCmuToken(token);
			map.set(normalizedToken, {
				phonemeId,
				category: symbol.category,
				ipa: symbol.ipa,
				arpa: symbol.arpa,
			});
		}
	}

	return map;
})();

/**
 * Normalize a CMU token so lookups remain stable regardless of casing/spacing.
 */
export function normalizeCmuToken(token: string): string {
	return token.trim().toUpperCase();
}

/**
 * Resolve a CMU token to rich phoneme metadata when available.
 */
export function getPhonemeForCmuToken(token: string): CmuPhonemeMapping | undefined {
	return cmuTokenToPhonemeMap.get(normalizeCmuToken(token));
}

export type CmuTokenMappingResult =
	| ({
			token: string;
			found: true;
	  } & CmuPhonemeMapping)
	| {
			token: string;
			found: false;
	  };

/**
 * Convert a CMU sequence into phoneme metadata while preserving unknown tokens.
 */
export function mapCmuSequenceToPhonemes(tokens: string[]): CmuTokenMappingResult[] {
	return tokens.map((token) => {
		const match = getPhonemeForCmuToken(token);
		if (match) {
			return {
				token,
				found: true as const,
				...match,
			};
		}

		return {
			token,
			found: false as const,
		};
	});
}

/**
 * Expose the full CMU token map for read-only inspection or tooling.
 */
export function getAllCmuTokenMappings(): ReadonlyMap<string, CmuPhonemeMapping> {
	return cmuTokenToPhonemeMap;
}
