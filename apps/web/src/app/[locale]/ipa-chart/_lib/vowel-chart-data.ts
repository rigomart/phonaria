import {
	DiphthongSymbolRegistry,
	DiphthongVowelArticulationRegistry,
	MonophthongSymbolRegistry,
	MonophthongVowelArticulationRegistry,
	type PhonemeArticulation,
	type PhonemeSymbolId,
	RhoticSymbolRegistry,
	RhoticVowelArticulationRegistry,
} from "shared-data";
import { phonemeDetailsById } from "@/data/phoneme-details";

type StaticVowelFeatures = Extract<
	PhonemeArticulation,
	{ category: "vowel/monophthong" | "vowel/rhotic" }
>["features"];

type DiphthongVowelFeatures = Extract<
	PhonemeArticulation,
	{ category: "vowel/diphthong" }
>["features"];

export type StaticVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	category: "vowel/monophthong" | "vowel/rhotic";
	features: StaticVowelFeatures;
};

export type DiphthongVowelChartEntry = {
	id: PhonemeSymbolId;
	ipa: string;
	label: string;
	category: "vowel/diphthong";
	features: DiphthongVowelFeatures;
};

export type VowelChartEntry = StaticVowelChartEntry | DiphthongVowelChartEntry;

function mapMonophthongs() {
	return Object.entries(MonophthongVowelArticulationRegistry).map(([id, articulation]) => {
		const symbolEntry = MonophthongSymbolRegistry[id as keyof typeof MonophthongSymbolRegistry];
		if (!symbolEntry) return null;
		const phonemeId = id as PhonemeSymbolId;
		return {
			id: phonemeId,
			ipa: symbolEntry.ipa,
			label: phonemeDetailsById[phonemeId].label,
			category: articulation.category,
			features: articulation.features,
		} satisfies StaticVowelChartEntry;
	});
}

function mapRhotics() {
	return Object.entries(RhoticVowelArticulationRegistry).map(([id, articulation]) => {
		const symbolEntry = RhoticSymbolRegistry[id as keyof typeof RhoticSymbolRegistry];
		if (!symbolEntry) return null;
		const phonemeId = id as PhonemeSymbolId;
		return {
			id: phonemeId,
			ipa: symbolEntry.ipa,
			label: phonemeDetailsById[phonemeId].label,
			category: articulation.category,
			features: articulation.features,
		} satisfies StaticVowelChartEntry;
	});
}

function mapDiphthongs() {
	return Object.entries(DiphthongVowelArticulationRegistry).map(([id, articulation]) => {
		const symbolEntry = DiphthongSymbolRegistry[id as keyof typeof DiphthongSymbolRegistry];
		if (!symbolEntry) {
			return null;
		}
		const phonemeId = id as PhonemeSymbolId;
		return {
			id: phonemeId,
			ipa: symbolEntry.ipa,
			label: phonemeDetailsById[phonemeId].label,
			category: articulation.category,
			features: articulation.features,
		} satisfies DiphthongVowelChartEntry;
	});
}

export const staticVowelEntries = [...mapMonophthongs(), ...mapRhotics()].filter(
	Boolean,
) as StaticVowelChartEntry[];

export const diphthongVowelEntries = mapDiphthongs().filter(Boolean) as DiphthongVowelChartEntry[];
