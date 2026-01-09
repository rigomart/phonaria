import { z } from "zod";

export const phonemeSearchQuerySchema = z.object({
	path: z.string().optional().default(""),
	limit: z.coerce.number().int().min(1).max(200).default(50),
});

const wordResultSchema = z.object({
	word: z.string(),
	ipa: z.string(),
});

export const phonemeSearchResponseSchema = z.object({
	words: z.array(wordResultSchema),
	totalCount: z.number(),
	nextPhonemes: z.array(
		z.object({
			arpabet: z.string(),
			ipa: z.string(),
			count: z.number(),
		}),
	),
	path: z.array(z.string()),
});

export const phonemeSearchErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	invalidLabels: z.array(z.string()).optional(),
});

export type PhonemeSearchQuery = z.infer<typeof phonemeSearchQuerySchema>;
export type PhonemeSearchResponse = z.infer<typeof phonemeSearchResponseSchema>;
export type PhonemeSearchErrorResponse = z.infer<typeof phonemeSearchErrorResponseSchema>;
