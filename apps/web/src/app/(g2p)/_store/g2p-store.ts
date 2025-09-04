import type { IpaPhoneme } from "shared-data";
import { toast } from "sonner";
import { create } from "zustand";
import { fetchDefinition } from "../_lib/dictionary-client";
import { getPhonemeBySymbol, transcribeText } from "../_lib/g2p-client";
import type { WordDefinition } from "../_types/dictionary";
import type { TranscribedPhoneme, TranscriptionResult } from "../_types/g2p";

interface G2PStore {
	// Transcription state
	result: TranscriptionResult | null;
	error: string | null;
	isLoading: boolean;

	// Selected phoneme state
	selectedPhoneme: IpaPhoneme | null;

	// Dictionary state
	selectedWord: string | null;
	wordDefinition: WordDefinition | null;
	definitionStatus: "idle" | "loading" | "loaded" | "error" | "not_found";
	definitionError: string | null;

	// Actions
	transcribe: (text: string) => Promise<void>;
	clearResult: () => void;
	selectPhoneme: (transcribedPhoneme: TranscribedPhoneme) => void;
	selectWord: (word: string) => Promise<void>;
	clearDefinition: () => void;
	closePhonemePanel: () => void;
}

export const useG2PStore = create<G2PStore>((set) => ({
	// Initial state
	result: null,
	error: null,
	isLoading: false,
	selectedPhoneme: null,
	selectedWord: null,
	wordDefinition: null,
	definitionStatus: "idle",
	definitionError: null,

	// Actions
	transcribe: async (text: string) => {
		if (!text.trim()) {
			set({ error: "Please enter some text to transcribe" });
			toast.error("Please enter some text to transcribe");
			return;
		}

		set({ error: null, isLoading: true });

		try {
			const transcriptionResult = await transcribeText(text.trim());
			set({ result: transcriptionResult, isLoading: false });
			toast.success("Text transcribed successfully!");
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to transcribe text";

			set({ error: errorMessage, result: null, isLoading: false });
			toast.error(`Transcription failed: ${errorMessage}`);
		}
	},

	clearResult: () => {
		set({
			result: null,
			error: null,
			selectedPhoneme: null,
			selectedWord: null,
			wordDefinition: null,
			definitionStatus: "idle",
			definitionError: null,
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

	selectWord: async (word: string) => {
		const trimmed = word.trim();
		if (!trimmed) return;
		set({ selectedWord: trimmed, definitionStatus: "loading", definitionError: null });
		try {
			const { data } = await fetchDefinition(trimmed);
			set({ wordDefinition: data, definitionStatus: "loaded" });
		} catch (e) {
			const message = e instanceof Error ? e.message : "Failed to load definition";
			// Heuristic: the API client includes status code in ApiError, but we keep it simple here
			if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("404")) {
				set({ definitionStatus: "not_found", definitionError: null, wordDefinition: null });
				return;
			}
			set({ definitionStatus: "error", definitionError: message, wordDefinition: null });
		}
	},

	clearDefinition: () => {
		set({
			selectedWord: null,
			wordDefinition: null,
			definitionStatus: "idle",
			definitionError: null,
		});
	},
}));
