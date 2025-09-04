import { z } from "zod";

// Free Dictionary API response types (subset used)
export const freeDictionaryDefinitionSchema = z.object({
	definition: z.string(),
	example: z.string().optional(),
	synonyms: z.array(z.string()).optional(),
	antonyms: z.array(z.string()).optional(),
});

export const freeDictionaryMeaningSchema = z.object({
	partOfSpeech: z.string(),
	definitions: z.array(freeDictionaryDefinitionSchema),
});

export const freeDictionaryEntrySchema = z.object({
	word: z.string(),
	phonetic: z.string().optional(),
	phonetics: z
		.array(
			z.object({
				text: z.string().optional(),
				audio: z.string().optional(),
			}),
		)
		.optional(),
	meanings: z.array(freeDictionaryMeaningSchema),
});

export const freeDictionarySuccessSchema = z.array(freeDictionaryEntrySchema);

export const freeDictionaryErrorSchema = z.object({
	title: z.string(),
	message: z.string().optional(),
	resolution: z.string().optional(),
});

// Normalized response returned by our API
export const wordDefinitionSchema = z.object({
	word: z.string(),
	phonetic: z.string().optional(),
	audioUrl: z.string().url().optional(),
	meanings: z.array(
		z.object({
			partOfSpeech: z.string(),
			definitions: z.array(
				z.object({
					definition: z.string(),
					example: z.string().optional(),
				}),
			),
		}),
	),
});

export type WordDefinition = z.infer<typeof wordDefinitionSchema>;

export const notFoundResponseSchema = z.object({
	error: z.literal("not_found"),
	message: z.string(),
});

export type NotFoundResponse = z.infer<typeof notFoundResponseSchema>;
