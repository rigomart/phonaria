import {
	getDiphthongVowelArticulationRegistryForLanguage,
	getIpaForPhonemeId,
	getMonophthongVowelArticulationRegistryForLanguage,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	type TargetLanguage,
} from "@phonaria/phonetics-data";

type StaticVowelFeatures = Extract<PhonemeArticulation, { vowelType: "monophthong" }>["features"];

type DiphthongVowelFeatures = Extract<PhonemeArticulation, { vowelType: "diphthong" }>["features"];

type PhonemeLabelById = Record<PhonemeSymbolId, { label: string }>;

export type StaticVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	vowelType: "monophthong";
	features: StaticVowelFeatures;
};

export type DiphthongVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	vowelType: "diphthong";
	features: DiphthongVowelFeatures;
};

export type VowelChartEntry = StaticVowelChartEntry | DiphthongVowelChartEntry;

export function getStaticVowelEntries(
	phonemeDetailsById: PhonemeLabelById,
	targetLanguage: TargetLanguage,
) {
	const monophthongs = getMonophthongVowelArticulationRegistryForLanguage(targetLanguage);
	return Object.entries(monophthongs).flatMap(([id, articulation]) => {
		if (!articulation) return [];
		const phonemeId = id as PhonemeSymbolId;
		const ipa = getIpaForPhonemeId(phonemeId);
		return [
			{
				id: phonemeId,
				ipa,
				label: phonemeDetailsById[phonemeId].label,
				vowelType: articulation.vowelType,
				features: articulation.features,
			} satisfies StaticVowelChartEntry,
		];
	});
}

export function getDiphthongVowelEntries(
	phonemeDetailsById: PhonemeLabelById,
	targetLanguage: TargetLanguage,
) {
	const diphthongs = getDiphthongVowelArticulationRegistryForLanguage(targetLanguage);
	return Object.entries(diphthongs).flatMap(([id, articulation]) => {
		if (!articulation) return [];
		const phonemeId = id as PhonemeSymbolId;
		const ipa = getIpaForPhonemeId(phonemeId);
		return [
			{
				id: phonemeId,
				ipa,
				label: phonemeDetailsById[phonemeId].label,
				vowelType: articulation.vowelType,
				features: articulation.features,
			} satisfies DiphthongVowelChartEntry,
		];
	});
}
