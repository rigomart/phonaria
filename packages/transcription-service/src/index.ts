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
	transcribeWords,
	resetCache,
	type TranscriptionServiceOptions,
} from "./service";

export {
	transcriptionInputSchema,
	transcriptionOutputSchema,
	wordSchema,
	syllableSchema,
	phonemeSchema,
	stressSchema,
	TranscriptionValidationError,
	TranscriptionDatabaseError,
	TranscriptionConfigError,
	type TranscriptionInput,
	type TranscriptionOutput,
	type TranscriptionWord,
	type TranscriptionSyllable,
	type TranscriptionPhoneme,
} from "./contract";
