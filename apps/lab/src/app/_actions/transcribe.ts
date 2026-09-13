"use server";

import { type TranscriptionWord, transcribeWords } from "@phonaria/transcription-service";

/**
 * Next.js server action adapter for transcription.
 * Thin wrapper over the framework-neutral transcription service.
 *
 * The service uses lazy database initialization, so this action can be
 * imported without requiring TURSO_DATABASE_URL to be set at build time.
 * The database client is only created when this action is called.
 */
export async function transcribeWordsAction(input: {
	words: string[];
}): Promise<TranscriptionWord[]> {
	// Database client is created lazily from environment variables
	const result = await transcribeWords({ words: input.words });
	return result.words;
}
