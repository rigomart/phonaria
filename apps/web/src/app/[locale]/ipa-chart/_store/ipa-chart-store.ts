import type { IpaPhoneme } from "shared-data";
import { create } from "zustand";

interface IpaChartState {
	selectedPhoneme: IpaPhoneme | null;
	dialogOpen: boolean;
}

interface IpaChartActions {
	selectPhoneme: (phoneme: IpaPhoneme) => void;
	setDialogOpen: (open: boolean) => void;
	clearSelection: () => void;
}

export type IpaChartStore = IpaChartState & IpaChartActions;

export const useIpaChartStore = create<IpaChartStore>((set) => ({
	selectedPhoneme: null,
	dialogOpen: false,

	selectPhoneme: (phoneme: IpaPhoneme) => set({ selectedPhoneme: phoneme, dialogOpen: true }),

	setDialogOpen: (open: boolean) =>
		set((state) => ({ dialogOpen: open, selectedPhoneme: open ? state.selectedPhoneme : null })),

	clearSelection: () => set({ selectedPhoneme: null, dialogOpen: false }),
}));
