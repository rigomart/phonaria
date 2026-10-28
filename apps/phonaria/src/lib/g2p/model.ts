import type { CmuStressLevel } from "@phonaria/phonetics-data";
import { z } from "zod";

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

const g2pStressSchema = z.enum([
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
	source: z.enum(["cmudict", "fallback"]),
	spellingNeighbours: z.array(z.string()).optional(),
});

export const g2pResponseSchema = z.object({
	words: z.array(g2pWordSchema),
});

export type G2PPhoneme = z.infer<typeof g2pPhonemeSchema>;
export type G2PSyllable = z.infer<typeof g2pSyllableSchema>;
export type G2PWord = z.infer<typeof g2pWordSchema>;
export type G2PResponse = z.infer<typeof g2pResponseSchema>;
