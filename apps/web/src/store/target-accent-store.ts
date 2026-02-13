import type { TargetAccent } from "@phonaria/phonetics-data";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
