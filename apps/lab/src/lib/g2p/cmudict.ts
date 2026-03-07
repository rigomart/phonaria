import { inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { words } from "@/db/schema";
import type { G2PSyllable } from "./model";
import { syllabify } from "./syllabifier";
import { normalizeCmuWord } from "./text-processing";

type CmudictVariant = G2PSyllable[];

const cache = new Map<string, CmudictVariant[] | null>();

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

export async function lookupManyCmudict(
	rawWords: string[],
): Promise<Map<string, CmudictVariant[] | undefined>> {
	const normalized = rawWords.map((w) => normalizeCmuWord(w)).filter((w) => w.length > 0);
	const unique = Array.from(new Set(normalized));
	const missing = unique.filter((w) => !cache.has(w));

	if (missing.length > 0) {
		const rows = await db
			.select({ word: words.word, pronunciations: words.pronunciations })
			.from(words)
			.where(inArray(words.word, missing));

		for (const row of rows) {
			const mapped = mapVariants(row.pronunciations);
			cache.set(row.word, mapped.length > 0 ? mapped : null);
		}

		for (const w of missing) {
			if (!cache.has(w)) {
				cache.set(w, null);
			}
		}
	}

	const output = new Map<string, CmudictVariant[] | undefined>();
	for (const w of unique) {
		output.set(w, cache.get(w) ?? undefined);
	}

	return output;
}
