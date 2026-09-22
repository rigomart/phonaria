import { inArray } from "drizzle-orm";
import { getDb, type AppDatabase } from "@/db/drizzle";
import { words } from "@/db/schema";
import type { G2PSyllable } from "./model";
import { syllabify } from "./syllabifier";
import { normalizeCmuWord } from "./text-processing";

type CmudictVariant = G2PSyllable[];
type CmudictCacheValue = CmudictVariant[] | null;

const MAX_CMUDICT_CACHE_ENTRIES = 5_000;
const cache = new Map<string, CmudictCacheValue>();

function cacheValue(word: string, value: CmudictCacheValue): void {
	cache.delete(word);
	cache.set(word, value);

	if (cache.size > MAX_CMUDICT_CACHE_ENTRIES) {
		const oldestWord = cache.keys().next().value;
		if (oldestWord !== undefined) cache.delete(oldestWord);
	}
}

function mapVariants(pronunciationsJson: string): CmudictVariant[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(pronunciationsJson);
	} catch {
		return [];
	}

	if (!Array.isArray(parsed)) return [];

	const mapped: CmudictVariant[] = [];
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

export type CmudictLookupOptions = {
	/** When false, misses are not written to the LRU cache. Hits still are. */
	cacheNegatives?: boolean;
};

export async function lookupManyCmudict(
	rawWords: string[],
	db: AppDatabase = getDb(),
	options: CmudictLookupOptions = {},
): Promise<Map<string, CmudictVariant[] | undefined>> {
	const cacheNegatives = options.cacheNegatives !== false;
	const normalized = rawWords.map((w) => normalizeCmuWord(w)).filter((w) => w.length > 0);
	const unique = Array.from(new Set(normalized));
	const resolved = new Map<string, CmudictCacheValue>();
	const missing: string[] = [];

	for (const word of unique) {
		if (cache.has(word)) {
			const value = cache.get(word) ?? null;
			cacheValue(word, value);
			resolved.set(word, value);
		} else {
			missing.push(word);
		}
	}

	if (missing.length > 0) {
		const rows = await db
			.select({ word: words.word, pronunciations: words.pronunciations })
			.from(words)
			.where(inArray(words.word, missing));

		for (const row of rows) {
			const mapped = mapVariants(row.pronunciations);
			const value = mapped.length > 0 ? mapped : null;
			resolved.set(row.word, value);
			cacheValue(row.word, value);
		}

		for (const w of missing) {
			if (!resolved.has(w)) {
				resolved.set(w, null);
				if (cacheNegatives) cacheValue(w, null);
			}
		}
	}

	const output = new Map<string, CmudictVariant[] | undefined>();
	for (const w of unique) {
		output.set(w, resolved.get(w) ?? undefined);
	}

	return output;
}

const MEMBERSHIP_CHUNK = 400;

export async function findExistingCmudictWords(
	rawWords: string[],
	db: AppDatabase = getDb(),
): Promise<string[]> {
	const unique = Array.from(
		new Set(rawWords.map((word) => word.toLowerCase().trim()).filter((word) => word.length > 0)),
	);
	const hits: string[] = [];

	for (let start = 0; start < unique.length; start += MEMBERSHIP_CHUNK) {
		const chunk = unique.slice(start, start + MEMBERSHIP_CHUNK);
		const found = await lookupManyCmudict(chunk, db, { cacheNegatives: false });
		for (const word of chunk) {
			const variants = found.get(normalizeCmuWord(word));
			if (variants && variants.length > 0) hits.push(word);
		}
	}

	return hits;
}

export function __resetCmudictCache(): void {
	cache.clear();
}
