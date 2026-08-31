import {
	type DiphthongVowelArticulation,
	type DiphthongVowelArticulatoryFeatures,
	getDiphthongVowelArticulationRegistryForLanguage,
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	getMonophthongVowelArticulationRegistryForLanguage,
	type MonophthongVowelArticulation,
	type PhonemeSymbolId,
	type TargetAccent,
	type VowelArticulatoryFeatures,
} from "@phonaria/phonetics-data";
import { phonemeLabels } from "@/lib/phoneme-labels";

export type StaticVowelFeatures = {
	height: VowelArticulatoryFeatures["height"];
	backness: VowelArticulatoryFeatures["backness"];
	roundness: VowelArticulatoryFeatures["roundness"];
	rhoticity?: VowelArticulatoryFeatures["rhoticity"];
};

export type StaticMonophthongVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	vowelType: "monophthong";
	features: StaticVowelFeatures;
};

export type StaticDiphthongVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	vowelType: "diphthong";
	features: DiphthongVowelArticulatoryFeatures;
};

export type StaticVowelChartEntry =
	| StaticMonophthongVowelChartEntry
	| StaticDiphthongVowelChartEntry;

export function getMonophthongEntries(
	targetAccent: TargetAccent,
): StaticMonophthongVowelChartEntry[] {
	const registry = getMonophthongVowelArticulationRegistryForLanguage(targetAccent);
	const articulations: Partial<Record<PhonemeSymbolId, MonophthongVowelArticulation>> = registry;
	const monophthongIds = getLanguagePhonemeIds(targetAccent, "monophthongs");

	return monophthongIds.map((id) => {
		const articulation = articulations[id];
		if (!articulation) throw new Error(`Missing monophthong articulation for ${id}`);
		return {
			id,
			ipa: getIpaForPhonemeId(id),
			label: phonemeLabels[id],
			vowelType: "monophthong",
			features: {
				height: articulation.features.height,
				backness: articulation.features.backness,
				roundness: articulation.features.roundness,
				rhoticity: articulation.features.rhoticity,
			},
		};
	});
}

export function getDiphthongEntries(targetAccent: TargetAccent): StaticDiphthongVowelChartEntry[] {
	const registry = getDiphthongVowelArticulationRegistryForLanguage(targetAccent);
	const articulations: Partial<Record<PhonemeSymbolId, DiphthongVowelArticulation>> = registry;
	const diphthongIds = getLanguagePhonemeIds(targetAccent, "diphthongs");

	return diphthongIds.map((id) => {
		const articulation = articulations[id];
		if (!articulation) throw new Error(`Missing diphthong articulation for ${id}`);
		return {
			id,
			ipa: getIpaForPhonemeId(id),
			label: phonemeLabels[id],
			vowelType: "diphthong",
			features: articulation.features,
		};
	});
}
