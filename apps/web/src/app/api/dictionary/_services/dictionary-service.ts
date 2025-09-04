import { z } from "zod";
import {
	freeDictionaryErrorSchema,
	freeDictionarySuccessSchema,
	type WordDefinition,
} from "../_schemas/dictionary-schemas";

const FREE_DICT_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

export async function fetchWordDefinition(word: string): Promise<WordDefinition | null> {
	const safeWord = word.trim().toLowerCase();
	if (!safeWord) return null;

	const url = `${FREE_DICT_BASE}/${encodeURIComponent(safeWord)}`;
	const res = await fetch(url, {
		method: "GET",
		headers: { Accept: "application/json" },
		cache: "no-store",
	});

	// Free Dictionary uses 200 with array for success, 404 with error JSON when not found
	const text = await res.text();
	try {
		const json = text ? JSON.parse(text) : null;

		if (res.ok) {
			const data = freeDictionarySuccessSchema.parse(json);
			// Take first entry as primary
			const entry = data[0];
			const audioUrl = (entry.phonetics || [])
				.map((p) => p.audio || "")
				.find((a) => typeof a === "string" && a.trim().length > 0);
			return {
				word: entry.word,
				phonetic: entry.phonetic,
				audioUrl,
				meanings: entry.meanings.map((m) => ({
					partOfSpeech: m.partOfSpeech,
					definitions: m.definitions.map((d) => ({
						definition: d.definition,
						example: d.example,
					})),
				})),
			};
		}

		// Not OK: try to parse error shape
		const error = freeDictionaryErrorSchema.safeParse(json);
		if (!res.ok && (res.status === 404 || error.success)) {
			// Treat as not found
			return null;
		}

		throw new Error(`Dictionary request failed: ${res.status} ${res.statusText}`);
	} catch (e) {
		// If JSON parsing failed or validation failed, surface generic error
		throw new Error(
			`Failed to parse dictionary response for "${safeWord}": ${e instanceof Error ? e.message : String(e)}`,
		);
	}
}

export const dictionaryQuerySchema = z.object({
	word: z
		.string()
		.min(1, "Word is required")
		.max(64, "Word too long")
		.regex(/^[A-Za-z'-]+$/u, "Only letters, apostrophes, and hyphens allowed"),
});
