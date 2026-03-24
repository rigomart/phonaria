import type { PhonemeSymbolId, VowelArticulatoryFeatures } from "@phonaria/phonetics-data";
import {
	getIpaForPhonemeId,
	getLanguagePhonemeIds,
	getMonophthongVowelArticulationRegistryForLanguage,
} from "@phonaria/phonetics-data";
import { phonemeLabels } from "@/lib/phoneme-labels";

export type StaticVowelFeatures = {
	height: VowelArticulatoryFeatures["height"];
	backness: VowelArticulatoryFeatures["backness"];
	roundness: VowelArticulatoryFeatures["roundness"];
	rhoticity?: VowelArticulatoryFeatures["rhoticity"];
};

export type StaticVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	features: StaticVowelFeatures;
};

export function getMonophthongEntries(): StaticVowelChartEntry[] {
	const registry = getMonophthongVowelArticulationRegistryForLanguage("en-us");
	const monophthongIds = getLanguagePhonemeIds("en-us", "monophthongs");

	return monophthongIds.map((id) => {
		const articulation = registry[id];
		return {
			id,
			ipa: getIpaForPhonemeId(id),
			label: phonemeLabels[id],
			features: {
				height: articulation.features.height,
				backness: articulation.features.backness,
				roundness: articulation.features.roundness,
				rhoticity: articulation.features.rhoticity,
			},
		};
	});
}
