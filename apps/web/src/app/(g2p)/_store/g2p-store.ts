import type { IpaPhoneme } from "shared-data";
import { toast } from "sonner";
import { create } from "zustand";
import { getPhonemeBySymbol, transcribeText } from "../_lib/g2p-client";
import type { TranscribedPhoneme, TranscriptionResult } from "../_types/g2p";

interface G2PStore {
	// Transcription state
	result: TranscriptionResult | null;
	error: string | null;
	isLoading: boolean;

	// Selected phoneme state
	selectedPhoneme: IpaPhoneme | null;

	// Actions
	transcribe: (text: string) => Promise<void>;
	clearResult: () => void;
	selectPhoneme: (transcribedPhoneme: TranscribedPhoneme) => void;
	closePhonemePanel: () => void;
}

export const useG2PStore = create<G2PStore>((set) => ({
	// Initial state
	result: null,
	error: null,
	isLoading: false,
	selectedPhoneme: null,

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
		set({ result: null, error: null, selectedPhoneme: null });
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
}));
