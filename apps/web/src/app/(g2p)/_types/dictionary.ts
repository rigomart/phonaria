import { z } from "zod";

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

export const dictionarySuccessSchema = z.object({
	success: z.literal(true),
	data: wordDefinitionSchema,
});
