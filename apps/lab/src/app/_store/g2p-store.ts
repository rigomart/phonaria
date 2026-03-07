import { create } from "zustand";
import type { TranscriptionResult } from "@/lib/types/g2p";

interface G2PStore {
	currentResult: TranscriptionResult | null;
	selectedVariants: number[];

	setCurrentResult: (result: TranscriptionResult | null) => void;
	resetVariants: (wordCount: number) => void;
	clearResult: () => void;
	setVariant: (wordIndex: number, variantIndex: number) => void;
}

export const useG2PStore = create<G2PStore>((set) => ({
	currentResult: null,
	selectedVariants: [],

	setCurrentResult: (result: TranscriptionResult | null) => {
		set({ currentResult: result });
	},

	resetVariants: (wordCount: number) => {
		set({ selectedVariants: Array(wordCount).fill(0) });
	},

	clearResult: () => {
		set({
			currentResult: null,
			selectedVariants: [],
		});
	},

	setVariant: (wordIndex: number, variantIndex: number) => {
		set((state) => {
			const next = state.selectedVariants.slice();
			next[wordIndex] = variantIndex;
			return { selectedVariants: next };
		});
	},
}));
