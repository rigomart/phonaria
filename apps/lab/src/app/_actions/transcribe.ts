"use server";

import {
	transcribeWords,
	type TranscriptionWord,
} from "@phonaria/transcription-service";

/**
 * Next.js server action adapter for transcription.
 * Thin wrapper over the framework-neutral transcription service.
 */
export async function transcribeWordsAction(input: {
	words: string[];
}): Promise<TranscriptionWord[]> {
	const result = await transcribeWords({ words: input.words });
	return result.words;
}
