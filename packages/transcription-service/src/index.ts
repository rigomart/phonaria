/**
 * @phonaria/transcription-service
 *
 * Framework-neutral transcription service for Phonaria.
 * Provides grapheme-to-phoneme (G2P) conversion with database lookups and fallback generation.
 *
 * This is the main entry point and exports client-safe types and the core service function.
 * For server-side database functionality, use @phonaria/transcription-service/server
 */

export {
	phonemeSchema,
	stressSchema,
	syllableSchema,
	TranscriptionConfigError,
	TranscriptionDatabaseError,
	type TranscriptionInput,
	type TranscriptionOutput,
	type TranscriptionPhoneme,
	type TranscriptionSyllable,
	TranscriptionValidationError,
	type TranscriptionWord,
	transcriptionInputSchema,
	transcriptionOutputSchema,
	wordSchema,
} from "./contract";
export {
	resetCache,
	type TranscriptionServiceOptions,
	transcribeWords,
} from "./service";
