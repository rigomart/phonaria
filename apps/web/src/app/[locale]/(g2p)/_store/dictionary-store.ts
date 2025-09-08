import { create } from "zustand";

interface DictionaryState {
	selectedWord: string | null;
}

interface DictionaryActions {
	setSelectedWord: (word: string | null) => void;
	clear: () => void;
}

export type DictionaryStore = DictionaryState & DictionaryActions;

export const useDictionaryStore = create<DictionaryStore>((set) => ({
	selectedWord: null,

	setSelectedWord: (word: string | null) => {
		const trimmed = typeof word === "string" ? word.trim() : null;
		set({ selectedWord: trimmed && trimmed.length > 0 ? trimmed : null });
	},

	clear: () => set({ selectedWord: null }),
}));
