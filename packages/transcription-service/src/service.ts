import {
	TranscriptionDatabaseError,
	type TranscriptionInput,
	type TranscriptionOutput,
	type TranscriptionSyllable,
	TranscriptionValidationError,
	type TranscriptionWord,
	transcriptionInputSchema,
} from "./contract";
import type { DbClient } from "./db/client";
import { getDefaultDbClient } from "./db/client";
import { lookupWords } from "./db/repository";
import { fallbackG2P } from "./phoneme-generator";
import { syllabify } from "./syllabifier";
import { normalizeCmuWord } from "./text-processing";

/**
 * Service configuration options.
 */
export interface TranscriptionServiceOptions {
	/**
	 * Database client to use for word lookups.
	 * If not provided, uses the default client from environment variables.
	 */
	dbClient?: DbClient;
}

/**
 * In-memory cache for CMUdict lookups.
 * Maps normalized word -> pronunciation variants.
 */
const cache = new Map<string, TranscriptionSyllable[] | null>();

/**
 * Reset the pronunciation cache (useful for testing).
 */
export function resetCache(): void {
	cache.clear();
}

/**
 * Parse pronunciations JSON from the database.
 */
function parseVariants(pronunciationsJson: string): TranscriptionSyllable[][] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(pronunciationsJson);
	} catch {
		return [];
	}

	if (!Array.isArray(parsed)) return [];

	const mapped: TranscriptionSyllable[][] = [];
	for (const variant of parsed) {
		if (typeof variant !== "string") continue;

		const tokens = variant
			.split(" ")
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		if (tokens.length === 0) continue;
		mapped.push(syllabify(tokens));
	}

	return mapped;
}

/**
 * Look up multiple words in CMUdict with caching.
 */
async function lookupManyCmudict(
	rawWords: string[],
	dbClient: DbClient,
): Promise<Map<string, TranscriptionSyllable[][] | undefined>> {
	const normalized = rawWords.map((w) => normalizeCmuWord(w)).filter((w) => w.length > 0);
	const unique = Array.from(new Set(normalized));
	const missing = unique.filter((w) => !cache.has(w));

	if (missing.length > 0) {
		const rows = await lookupWords(dbClient, missing);

		for (const [word, data] of rows.entries()) {
			const mapped = parseVariants(data.pronunciations);
			cache.set(word, mapped.length > 0 ? mapped[0] : null);
		}

		for (const w of missing) {
			if (!cache.has(w)) {
				cache.set(w, null);
			}
		}
	}

	const output = new Map<string, TranscriptionSyllable[][] | undefined>();
	for (const w of unique) {
		const cached = cache.get(w);
		if (cached !== null) {
			// Convert single variant back to array of variants
			output.set(w, cached ? [cached] : undefined);
		}
	}

	return output;
}

/**
 * Process words and generate transcriptions.
 * This is the main entry point for the transcription service.
 *
 * @param input - Input words to transcribe
 * @param options - Service options (including optional database client)
 * @returns Transcription output with words and their pronunciations
 * @throws {TranscriptionValidationError} If input validation fails
 * @throws {TranscriptionDatabaseError} If database query fails
 */
export async function transcribeWords(
	input: TranscriptionInput,
	options: TranscriptionServiceOptions = {},
): Promise<TranscriptionOutput> {
	// Validate input
	const parseResult = transcriptionInputSchema.safeParse(input);
	if (!parseResult.success) {
		throw new TranscriptionValidationError("Invalid transcription input", parseResult.error);
	}

	const { words: inputWords } = parseResult.data;

	if (inputWords.length === 0) {
		return { words: [] };
	}

	// Get database client (either provided or default)
	const dbClient = options.dbClient ?? getDefaultDbClient();

	// Look up words in CMUdict
	let lookups: Map<string, TranscriptionSyllable[][] | undefined>;
	try {
		lookups = await lookupManyCmudict(inputWords, dbClient);
	} catch (error) {
		if (error instanceof TranscriptionDatabaseError) {
			throw error;
		}
		throw new TranscriptionDatabaseError("Unexpected error during word lookup", error);
	}

	// Process each word
	const results: TranscriptionWord[] = [];

	for (const word of inputWords) {
		if (word.length === 0) continue;

		const variants = lookups.get(normalizeCmuWord(word));

		if (variants && variants.length > 0) {
			results.push({
				word: word.toLowerCase(),
				variants,
				source: "cmudict",
			});
		} else {
			const lowerWord = word.toLowerCase();
			results.push({
				word: lowerWord,
				variants: [fallbackG2P.generatePronunciation(lowerWord)],
				source: "fallback",
			});
		}
	}

	return { words: results };
}
