import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { create } from "zustand";

interface G2PStore {
	// Selected phoneme state
	selectedPhonemeId: PhonemeSymbolId | null;
	hasSelection: boolean;
	phonemeDialogOpen: boolean;

	// Per-word selected variant indices (aligned with current result)
	selectedVariants: number[];

	// Actions
	resetVariants: (wordCount: number) => void;
	clearResult: () => void;
	selectPhoneme: (phonemeId: PhonemeSymbolId | null) => void;
	setVariant: (wordIndex: number, variantIndex: number) => void;
	setPhonemeDialogOpen: (open: boolean) => void;
}

export const useG2PStore = create<G2PStore>((set) => ({
	// Initial state
	selectedPhonemeId: null,
	hasSelection: false,
	phonemeDialogOpen: false,
	selectedVariants: [],

	// Actions
	resetVariants: (wordCount: number) => {
		set({ selectedVariants: Array(wordCount).fill(0) });
	},

	clearResult: () => {
		set({
			selectedPhonemeId: null,
			hasSelection: false,
			phonemeDialogOpen: false,
			selectedVariants: [],
		});
	},

	selectPhoneme: (phonemeId: PhonemeSymbolId | null) => {
		set({ selectedPhonemeId: phonemeId, hasSelection: true });
	},

	setVariant: (wordIndex: number, variantIndex: number) => {
		set((state) => {
			const next = state.selectedVariants.slice();
			next[wordIndex] = variantIndex;
			return { selectedVariants: next };
		});
	},

	setPhonemeDialogOpen: (open: boolean) => {
		set({ phonemeDialogOpen: open });
	},
}));
