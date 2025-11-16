import type { PhonemeSymbolId } from "shared-data";
import { create } from "zustand";

interface IpaChartStore {
	selectedPhonemeId: PhonemeSymbolId | null;
	dialogOpen: boolean;

	selectPhoneme: (phonemeId: PhonemeSymbolId | null) => void;
	setDialogOpen: (open: boolean) => void;
	clearSelection: () => void;
}

export const useIpaChartStore = create<IpaChartStore>((set) => ({
	selectedPhonemeId: null,
	dialogOpen: false,

	selectPhoneme: (phonemeId: PhonemeSymbolId | null) =>
		set({ selectedPhonemeId: phonemeId, dialogOpen: true }),

	setDialogOpen: (open: boolean) =>
		set((state) => ({
			dialogOpen: open,
			selectedPhonemeId: open ? state.selectedPhonemeId : null,
		})),

	clearSelection: () => set({ selectedPhonemeId: null, dialogOpen: false }),
}));
