import { create } from "zustand";
import type { TranscribedPhoneme } from "../_types/g2p";

// TODO: Replace with proper IpaPhoneme type from shared-data once new phonetics system is ready
type IpaPhoneme = {
	symbol: string;
	category: "consonant" | "vowel";
	description: string;
};

// TODO: Replace with proper phoneme lookup once new phonetics system is ready
function getPhonemeBySymbol(symbol: string): IpaPhoneme | null {
	// Mock implementation - return basic data for any symbol
	return {
		symbol,
		category: "consonant", // Simplified
		description: `Phoneme ${symbol}`,
	};
}

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
