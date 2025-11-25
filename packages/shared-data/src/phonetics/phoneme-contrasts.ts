import exampleWordsData from "../../data/example-words.json";
import type {
	ConsonantArticulatoryFeatures,
	PhonemeArticulatoryFeatureKey,
	PhonemeSymbolId,
	VowelArticulatoryFeatures,
} from "./symbols-registry";

type PhonemeContrastPair = {
	word: string;
	phonemic: string;
};

type PhonemeContrastType = keyof ConsonantArticulatoryFeatures | keyof VowelArticulatoryFeatures;

export type PhonemeContrast = {
	phonemeIds: [PhonemeSymbolId, PhonemeSymbolId]; // The pair. e.g. ["voiced-bilabial-plosive", "voiced-labiodental-fricative"]
	contrastType: PhonemeArticulatoryFeatureKey[]; // Usually one, but can be multiple. e.g. ["manner", "place"]
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

// Import contrast data from shared JSON, cast to proper types
export const PhonemeContrastCatalog: PhonemeContrast[] =
	exampleWordsData.contrasts as PhonemeContrast[];

export type PhonemeContrastMatch = {
	partnerId: PhonemeSymbolId;
	contrastType: PhonemeContrastType[];
	minimalPairs: [PhonemeContrastPair, PhonemeContrastPair][];
};

// Scoped record generation using IIFE for O(1) access in consumption
export const ContrastsByPhonemeIdRegistry: Partial<
	Record<PhonemeSymbolId, PhonemeContrastMatch[]>
> = (() => {
	const record: Partial<Record<PhonemeSymbolId, PhonemeContrastMatch[]>> = {};

	for (const contrast of PhonemeContrastCatalog) {
		const [leftId, rightId] = contrast.phonemeIds;

		const addEntry = (fromId: PhonemeSymbolId, toId: PhonemeSymbolId) => {
			const entry: PhonemeContrastMatch = {
				partnerId: toId,
				contrastType: contrast.contrastType,
				minimalPairs: contrast.minimalPairs,
			};

			const existing = record[fromId];
			if (existing) {
				existing.push(entry);
			} else {
				record[fromId] = [entry];
			}
		};

		addEntry(leftId, rightId);
		addEntry(rightId, leftId);
	}

	return record;
})();
