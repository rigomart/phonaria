import { inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { words } from "@/db/schema";
import type { G2PSyllable } from "../_schemas/g2p-api.schema";
import { normalizeCmuWord } from "../_utils/text-processing";
import { syllabify } from "./syllabifier";

type CmudictVariant = G2PSyllable[];
export type CmudictLookupResult = CmudictVariant[] | undefined;

// Module-level cache: may persist between requests in long-lived runtimes, but safe in serverless too.
const cache = new Map<string, CmudictVariant[] | null>();

function mapVariants(variants: string[]): CmudictVariant[] {
	const mappedVariants: CmudictVariant[] = [];

	for (const variant of variants) {
		if (typeof variant !== "string") continue;

		const tokens = variant
			.split(" ")
			.map((token) => token.trim())
			.filter((token) => token.length > 0);

		if (tokens.length === 0) continue;

		const syllables = syllabify(tokens);
		mappedVariants.push(syllables);
	}

	return mappedVariants;
}

/**
 * Look up one word in CMUDict (DB-backed).
 * Note: result is `undefined` when the word is not present.
 */
export async function lookupCmudict(rawWord: string): Promise<CmudictLookupResult> {
	const normalizedWord = normalizeCmuWord(rawWord);
	if (normalizedWord.length === 0) return undefined;

	if (cache.has(normalizedWord)) {
		return cache.get(normalizedWord) ?? undefined;
	}

	const results = await lookupManyCmudict([normalizedWord]);
	return results.get(normalizedWord);
}

/**
 * Look up many words in CMUDict (DB-backed).
 * Returns a map keyed by normalized CMU word (uppercase, variant suffix stripped).
 */
export async function lookupManyCmudict(
	rawWords: string[],
): Promise<Map<string, CmudictVariant[] | undefined>> {
	const normalized = rawWords
		.map((word) => normalizeCmuWord(word))
		.filter((word) => word.length > 0);
	const unique = Array.from(new Set(normalized));
	const missing = unique.filter((word) => !cache.has(word));

	if (missing.length > 0) {
		const rows = await db
			.select({ word: words.word, cmuVariants: words.cmuVariants })
			.from(words)
			.where(inArray(words.word, missing));

		for (const row of rows) {
			const mapped = mapVariants(row.cmuVariants);
			cache.set(row.word, mapped.length > 0 ? mapped : null);
		}

		// Cache misses too, so repeated lookups don't re-query.
		for (const word of missing) {
			if (!cache.has(word)) {
				cache.set(word, null);
			}
		}
	}

	const output = new Map<string, CmudictVariant[] | undefined>();
	for (const word of unique) {
		output.set(word, cache.get(word) ?? undefined);
	}

	return output;
}

// Test helper: keep it internal-ish but usable.
export function __resetCmudictCache(): void {
	cache.clear();
}
