import {
	getDiphthongVowelArticulationRegistryForLanguage,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	getMonophthongVowelArticulationRegistryForLanguage,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	type TargetAccent,
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

function getEnglishStaticVowelEntries(phonemeDetailsById: PhonemeLabelById) {
	const monophthongs = getMonophthongVowelArticulationRegistryForLanguage("en-us");
	const monophthongIds = getLanguagePhonemeIds("en-us", "monophthongs");

	return monophthongIds.map((phonemeId) => {
		const articulation = monophthongs[phonemeId];
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

function getSpanishStaticVowelEntries(phonemeDetailsById: PhonemeLabelById) {
	const monophthongs = getMonophthongVowelArticulationRegistryForLanguage("es-419");
	const monophthongIds = getLanguagePhonemeIds("es-419", "monophthongs");

	return monophthongIds.map((phonemeId) => {
		const articulation = monophthongs[phonemeId];
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

export function getStaticVowelEntries(
	phonemeDetailsById: PhonemeLabelById,
	targetAccent: TargetAccent,
) {
	if (targetAccent === "en-us") {
		return getEnglishStaticVowelEntries(phonemeDetailsById);
	}
	return getSpanishStaticVowelEntries(phonemeDetailsById);
}

function getEnglishDiphthongVowelEntries(phonemeDetailsById: PhonemeLabelById) {
	const diphthongs = getDiphthongVowelArticulationRegistryForLanguage("en-us");
	const diphthongIds = getLanguagePhonemeIds("en-us", "diphthongs");

	return diphthongIds.map((phonemeId) => {
		const articulation = diphthongs[phonemeId];
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

function getSpanishDiphthongVowelEntries(_phonemeDetailsById: PhonemeLabelById) {
	const entries: DiphthongVowelChartEntry[] = [];
	return entries;
}

export function getDiphthongVowelEntries(
	phonemeDetailsById: PhonemeLabelById,
	targetAccent: TargetAccent,
) {
	if (targetAccent === "en-us") {
		return getEnglishDiphthongVowelEntries(phonemeDetailsById);
	}
	return getSpanishDiphthongVowelEntries(phonemeDetailsById);
}
