import {
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	getMonophthongVowelArticulationRegistryForLanguage,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	type TargetAccent,
} from "@phonaria/phonetics-data";

type StaticVowelFeatures = Extract<PhonemeArticulation, { vowelType: "monophthong" }>["features"];

type PhonemeLabelById = Record<PhonemeSymbolId, { label: string }>;

export type StaticVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	vowelType: "monophthong";
	features: StaticVowelFeatures;
};

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
