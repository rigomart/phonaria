import {
	DiphthongVowelArticulationRegistry,
	getIpaForPhonemeId,
	MonophthongVowelArticulationRegistry,
	type PhonemeArticulation,
	type PhonemeSymbolId,
} from "shared-data";

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

export function getStaticVowelEntries(phonemeDetailsById: PhonemeLabelById) {
	return Object.entries(MonophthongVowelArticulationRegistry).map(([id, articulation]) => {
		const phonemeId = id as PhonemeSymbolId;
		const ipa = getIpaForPhonemeId(phonemeId);
		return {
			id: phonemeId,
			ipa,
			label: phonemeDetailsById[phonemeId].label,
			vowelType: articulation.vowelType,
			features: articulation.features,
		} satisfies StaticVowelChartEntry;
	});
}

export function getDiphthongVowelEntries(phonemeDetailsById: PhonemeLabelById) {
	return Object.entries(DiphthongVowelArticulationRegistry).map(([id, articulation]) => {
		const phonemeId = id as PhonemeSymbolId;
		const ipa = getIpaForPhonemeId(phonemeId);
		return {
			id: phonemeId,
			ipa,
			label: phonemeDetailsById[phonemeId].label,
			vowelType: articulation.vowelType,
			features: articulation.features,
		} satisfies DiphthongVowelChartEntry;
	});
}
