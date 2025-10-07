import { useMemo } from "react";
import type { VowelPhoneme } from "shared-data";
import { vowels } from "shared-data";

export interface VowelGroupings {
	monophthongs: VowelPhoneme[];
	diphthongs: VowelPhoneme[];
	rhoticVowels: VowelPhoneme[];
}

export function useVowelGroupings(): VowelGroupings {
	return useMemo(() => {
		const monophthongs = vowels.filter((phoneme) => phoneme.type === "monophthong");
		const diphthongs = vowels.filter((phoneme) => phoneme.type === "diphthong");
		const rhoticVowels = vowels.filter((phoneme) => phoneme.type === "rhotic");

		return {
			monophthongs,
			diphthongs,
			rhoticVowels,
		};
	}, []);
}
