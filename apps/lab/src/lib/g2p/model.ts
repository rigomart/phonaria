import type { CmuStressLevel } from "@phonaria/phonetics-data";
import { z } from "zod";

export const g2pRequestSchema = z.object({
	text: z
		.string()
		.min(1, "Text cannot be empty")
		.max(200, "Text must be 200 characters or less")
		.regex(
			/^[\p{L}\p{N}\s.,!?¡¿;:'"()\-–—…""''‚„«»‹›@#$%&*+/=[\]{}|\\^_`~]+$/u,
			"Text contains unsupported characters",
		),
});

const knownPhonemeSchema = z.object({
	ipa: z.string(),
	phonemeId: z.string().min(1),
	cmuToken: z.string(),
});

const unknownPhonemeSchema = z.object({
	phonemeId: z.null(),
	cmuToken: z.string(),
});

const g2pPhonemeSchema = z.union([knownPhonemeSchema, unknownPhonemeSchema]);

export const g2pStressSchema = z.enum([
	"none",
	"primary",
	"secondary",
] as const satisfies readonly CmuStressLevel[]);

const g2pSyllableSchema = z.object({
	phonemes: z.array(g2pPhonemeSchema),
	stress: g2pStressSchema,
});

export const g2pWordSchema = z.object({
	word: z.string(),
	variants: z.array(z.array(g2pSyllableSchema)),
	source: z.enum(["cmudict", "fallback", "rules"]),
});

export const g2pResponseSchema = z.object({
	words: z.array(g2pWordSchema),
});

export type G2PRequest = z.infer<typeof g2pRequestSchema>;
export type G2PPhoneme = z.infer<typeof g2pPhonemeSchema>;
export type G2PSyllable = z.infer<typeof g2pSyllableSchema>;
export type G2PWord = z.infer<typeof g2pWordSchema>;
export type G2PResponse = z.infer<typeof g2pResponseSchema>;
