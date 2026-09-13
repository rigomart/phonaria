/**
 * @phonaria/transcription-service
 *
 * Framework-neutral transcription service for Phonaria.
 * Provides grapheme-to-phoneme (G2P) conversion with database lookups and fallback generation.
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

export {
	createDbClient,
	createDbClientFromEnv,
	getDefaultDbClient,
	resetDefaultDbClient,
	type DbClient,
	type DbConfig,
} from "./db/client";
