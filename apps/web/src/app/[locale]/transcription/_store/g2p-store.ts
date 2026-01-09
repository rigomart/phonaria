import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { create } from "zustand";
import type { TranscriptionResult } from "../_types/g2p";

interface G2PStore {
	// Current transcription result
	currentResult: TranscriptionResult | null;

	// Selected phoneme state
	selectedPhonemeId: PhonemeSymbolId | null;
	hasSelection: boolean;
	phonemeDialogOpen: boolean;

	// Per-word selected variant indices (aligned with current result)
	selectedVariants: number[];

	// Actions
	setCurrentResult: (result: TranscriptionResult | null) => void;
	resetVariants: (wordCount: number) => void;
	clearResult: () => void;
	selectPhoneme: (phonemeId: PhonemeSymbolId | null) => void;
	setVariant: (wordIndex: number, variantIndex: number) => void;
	setPhonemeDialogOpen: (open: boolean) => void;
}

export const useG2PStore = create<G2PStore>((set) => ({
	// Initial state
	currentResult: null,
	selectedPhonemeId: null,
	hasSelection: false,
	phonemeDialogOpen: false,
	selectedVariants: [],

	// Actions
	setCurrentResult: (result: TranscriptionResult | null) => {
		set({ currentResult: result });
	},

	resetVariants: (wordCount: number) => {
		set({ selectedVariants: Array(wordCount).fill(0) });
	},

	clearResult: () => {
		set({
			currentResult: null,
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
