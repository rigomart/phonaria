/**
 * Zod schemas for G2P API validation
 */

import { z } from "zod";

/**
 * G2P request schema
 */
export const g2pRequestSchema = z.object({
	text: z
		.string()
		.min(1, "Text cannot be empty")
		.max(200, "Text must be 200 characters or less")
		.regex(
			/^[\p{L}\p{N}\s.,!?;:'"()\-–—…""''‚„«»‹›@#$%&*+/=[\]{}|\\^_`~]+$/u,
			"Text contains invalid characters",
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

const g2pSyllableSchema = z.object({
	phonemes: z.array(g2pPhonemeSchema),
	stress: z.enum(["primary", "secondary", "none"]),
});

/**
 * G2P word schema
 */
export const g2pWordSchema = z.object({
	word: z.string().min(1),
	variants: z.array(z.array(g2pSyllableSchema)),
	source: z.enum(["cmudict", "fallback"]),
});

/**
 * G2P response schema
 */
export const g2pResponseSchema = z.object({
	words: z.array(g2pWordSchema),
});

/**
 * G2P error schema
 */
export const g2pErrorSchema = z.object({
	error: z.string(),
	message: z.string(),
});

/**
 * Infer types from schemas
 */
export type G2PRequestData = z.infer<typeof g2pRequestSchema>;
export type G2PPhonemeData = z.infer<typeof g2pPhonemeSchema>;
export type G2PSyllableData = z.infer<typeof g2pSyllableSchema>;
export type G2PWordData = z.infer<typeof g2pWordSchema>;
export type G2PResponseData = z.infer<typeof g2pResponseSchema>;
export type G2PErrorData = z.infer<typeof g2pErrorSchema>;
