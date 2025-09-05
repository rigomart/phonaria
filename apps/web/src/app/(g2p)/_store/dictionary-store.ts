import { create } from "zustand";
import { fetchDefinition } from "../_lib/dictionary-client";
import type { WordDefinition } from "../_schemas/dictionary";

export type DictionaryStatus = "idle" | "loading" | "loaded" | "error" | "not_found";

interface DictionaryState {
	selectedWord: string | null;
	wordDefinition: WordDefinition | null;
	status: DictionaryStatus;
	error: string | null;
}

interface DictionaryActions {
	selectWord: (word: string) => Promise<void>;
	clear: () => void;
}

export type DictionaryStore = DictionaryState & DictionaryActions;

export const useDictionaryStore = create<DictionaryStore>((set) => ({
	selectedWord: null,
	wordDefinition: null,
	status: "idle",
	error: null,

	selectWord: async (word: string) => {
		const trimmed = word.trim();
		if (!trimmed) return;
		set({ selectedWord: trimmed, status: "loading", error: null, wordDefinition: null });
		try {
			const { data } = await fetchDefinition(trimmed);
			set({ wordDefinition: data, status: "loaded" });
		} catch (e) {
			const message = e instanceof Error ? e.message : "Failed to load definition";
			if (message.toLowerCase().includes("not found") || message.includes("404")) {
				set({ status: "not_found", error: null, wordDefinition: null });
				return;
			}
			set({ status: "error", error: message, wordDefinition: null });
		}
	},

	clear: () => set({ selectedWord: null, wordDefinition: null, status: "idle", error: null }),
}));
