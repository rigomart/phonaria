import type { IpaPhoneme } from "shared-data";
import { create } from "zustand";
import { getPhonemeBySymbol } from "../_lib/g2p-client";
import type { TranscribedPhoneme } from "../_types/g2p";

interface G2PStore {
	// Selected phoneme state
	selectedPhoneme: IpaPhoneme | null;

	// Per-word selected variant indices (aligned with current result)
	selectedVariants: number[];

	// Actions
	resetVariants: (wordCount: number) => void;
	clearResult: () => void;
	selectPhoneme: (transcribedPhoneme: TranscribedPhoneme) => void;
	closePhonemePanel: () => void;
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
		const phonemeData = getPhonemeBySymbol(transcribedPhoneme.symbol);

		if (phonemeData) {
			set({ selectedPhoneme: phonemeData });
		} else {
			console.log(`Phoneme /${transcribedPhoneme.symbol}/ not found in database`);
			set({ selectedPhoneme: null });
		}
	},

	closePhonemePanel: () => {
		set({ selectedPhoneme: null });
	},

	setVariant: (wordIndex: number, variantIndex: number) => {
		set((state) => {
			const next = state.selectedVariants.slice();
			next[wordIndex] = variantIndex;
			return { selectedVariants: next };
		});
	},
}));
