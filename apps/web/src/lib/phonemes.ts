import { consonants, type IpaPhoneme, vowels } from "shared-data";

const phonemeMap = new Map<string, IpaPhoneme>();
[...consonants, ...vowels].forEach((phoneme) => {
	phonemeMap.set(phoneme.symbol, phoneme);
});

export function getPhonemeBySymbol(symbol: string): IpaPhoneme | undefined {
	return phonemeMap.get(symbol);
}

export function getManyPhonemes(symbols: string[]): IpaPhoneme[] {
	return symbols
		.map((symbol) => phonemeMap.get(symbol))
		.filter((value): value is IpaPhoneme => Boolean(value));
}

export function getPhonemeSummary(symbol: string): string | undefined {
	const phoneme = phonemeMap.get(symbol);
	return phoneme?.description;
}
