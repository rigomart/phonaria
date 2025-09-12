import type { IpaPhoneme } from "shared-data";
import { create } from "zustand";

export type IpaSection = "consonants" | "vowels";

interface IpaChartState {
	activeSection: IpaSection;
	selectedPhoneme: IpaPhoneme | null;
	dialogOpen: boolean;
}

interface IpaChartActions {
	setActiveSection: (section: IpaSection) => void;
	selectPhoneme: (phoneme: IpaPhoneme) => void;
	setDialogOpen: (open: boolean) => void;
	clearSelection: () => void;
}

export type IpaChartStore = IpaChartState & IpaChartActions;

export const useIpaChartStore = create<IpaChartStore>((set) => ({
	activeSection: "consonants",
	selectedPhoneme: null,
	dialogOpen: false,

	setActiveSection: (section: IpaSection) => set({ activeSection: section }),

	selectPhoneme: (phoneme: IpaPhoneme) => set({ selectedPhoneme: phoneme, dialogOpen: true }),

	setDialogOpen: (open: boolean) =>
		set((state) => ({ dialogOpen: open, selectedPhoneme: open ? state.selectedPhoneme : null })),

	clearSelection: () => set({ selectedPhoneme: null, dialogOpen: false }),
}));
