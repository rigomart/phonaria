import { create } from "zustand";
import type { TranscribedPhoneme } from "../_types/g2p";

interface G2PStore {
	// Selected phoneme state
	selectedPhoneme: TranscribedPhoneme | null;

	// Per-word selected variant indices (aligned with current result)
	selectedVariants: number[];

	// Actions
	resetVariants: (wordCount: number) => void;
	clearResult: () => void;
	selectPhoneme: (transcribedPhoneme: TranscribedPhoneme) => void;
	setVariant: (wordIndex: number, variantIndex: number) => void;
}

export const useG2PStore = create<G2PStore>((set) => ({
	// Initial state
	selectedPhoneme: null,
	selectedVariants: [],

	// Actions
	resetVariants: (wordCount: number) => {
		set({ selectedVariants: Array(wordCount).fill(0) });
	},

	clearResult: () => {
		set({
			selectedPhoneme: null,
			selectedVariants: [],
		});
	},

	selectPhoneme: (transcribedPhoneme: TranscribedPhoneme) => {
		set({ selectedPhoneme: transcribedPhoneme });
	},

	setVariant: (wordIndex: number, variantIndex: number) => {
		set((state) => {
			const next = state.selectedVariants.slice();
			next[wordIndex] = variantIndex;
			return { selectedVariants: next };
		});
	},
}));
