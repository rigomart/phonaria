import type { TargetLanguage } from "@phonaria/phonetics-data";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TargetLanguageStore {
	targetLanguage: TargetLanguage;
	setTargetLanguage: (language: TargetLanguage) => void;
}

export const useTargetLanguageStore = create<TargetLanguageStore>()(
	persist(
		(set) => ({
			targetLanguage: "en",
			setTargetLanguage: (language: TargetLanguage) => set({ targetLanguage: language }),
		}),
		{ name: "phonaria-target-language" },
	),
);
