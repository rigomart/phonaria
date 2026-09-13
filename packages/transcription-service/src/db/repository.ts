import { inArray } from "drizzle-orm";
import { TranscriptionDatabaseError } from "../contract";
import type { DbClient } from "./client";
import { words } from "./schema";

export interface WordLookupResult {
	word: string;
	pronunciations: string;
}

/**
 * Look up multiple words in the database.
 * Returns a map of normalized word -> pronunciation data.
 *
 * @param dbClient - The database client to use
 * @param normalizedWords - Array of normalized words to look up
 * @returns Map of word to pronunciation data
 * @throws {TranscriptionDatabaseError} If the database query fails
 */
export async function lookupWords(
	dbClient: DbClient,
	normalizedWords: string[],
): Promise<Map<string, WordLookupResult>> {
	if (normalizedWords.length === 0) {
		return new Map();
	}

	try {
		const rows = await dbClient
			.select({ word: words.word, pronunciations: words.pronunciations })
			.from(words)
			.where(inArray(words.word, normalizedWords));

		const result = new Map<string, WordLookupResult>();
		for (const row of rows) {
			result.set(row.word, row);
		}

		return result;
	} catch (error) {
		throw new TranscriptionDatabaseError(
			"Failed to query dictionary words from database",
			error,
		);
	}
}
