import type { TargetAccent } from "@phonaria/phonetics-data";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Migrate from old "phonaria-target-language" key to new "phonaria-target-accent" key
if (typeof window !== "undefined") {
	try {
		const oldRaw = localStorage.getItem("phonaria-target-language");
		if (oldRaw) {
			const parsed = JSON.parse(oldRaw);
			const oldValue = parsed?.state?.targetLanguage;
			if (oldValue === "en" || oldValue === "es") {
				const newValue = oldValue === "en" ? "en-us" : "es-419";
				localStorage.setItem(
					"phonaria-target-accent",
					JSON.stringify({ state: { targetAccent: newValue }, version: 0 }),
				);
			}
			localStorage.removeItem("phonaria-target-language");
		}
	} catch {
		// Ignore migration errors
	}
}

interface TargetAccentStore {
	targetAccent: TargetAccent;
	setTargetAccent: (accent: TargetAccent) => void;
}

export const useTargetAccentStore = create<TargetAccentStore>()(
	persist(
		(set) => ({
			targetAccent: "en-us",
			setTargetAccent: (accent: TargetAccent) => set({ targetAccent: accent }),
		}),
		{ name: "phonaria-target-accent" },
	),
);
