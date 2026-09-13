import type { CmuStressLevel } from "@phonaria/phonetics-data";
import { z } from "zod";

/**
 * Input validation schema for transcription requests.
 * Enforces a maximum of 200 words with character limits and allowed characters.
 */
export const transcriptionInputSchema = z.object({
	words: z.array(z.string().min(1)).min(1).max(200),
});

/**
 * Known phoneme with IPA representation and CMU token.
 */
const knownPhonemeSchema = z.object({
	ipa: z.string(),
	phonemeId: z.string().min(1),
	cmuToken: z.string(),
});

/**
 * Unknown phoneme (not found in our phoneme map).
 */
const unknownPhonemeSchema = z.object({
	phonemeId: z.null(),
	cmuToken: z.string(),
});

export const phonemeSchema = z.union([knownPhonemeSchema, unknownPhonemeSchema]);

export const stressSchema = z.enum([
	"none",
	"primary",
	"secondary",
] as const satisfies readonly CmuStressLevel[]);

export const syllableSchema = z.object({
	phonemes: z.array(phonemeSchema),
	stress: stressSchema,
});

export const wordSchema = z.object({
	word: z.string(),
	variants: z.array(z.array(syllableSchema)),
	source: z.enum(["cmudict", "fallback", "rules"]),
});

export const transcriptionOutputSchema = z.object({
	words: z.array(wordSchema),
});

/**
 * Input types
 */
export type TranscriptionInput = z.infer<typeof transcriptionInputSchema>;

/**
 * Output types
 */
export type TranscriptionPhoneme = z.infer<typeof phonemeSchema>;
export type TranscriptionSyllable = z.infer<typeof syllableSchema>;
export type TranscriptionWord = z.infer<typeof wordSchema>;
export type TranscriptionOutput = z.infer<typeof transcriptionOutputSchema>;

/**
 * Error types for transcription failures
 */
export class TranscriptionValidationError extends Error {
	constructor(
		message: string,
		public readonly validationErrors: z.ZodError,
	) {
		super(message);
		this.name = "TranscriptionValidationError";
	}
}

export class TranscriptionDatabaseError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown,
	) {
		super(message);
		this.name = "TranscriptionDatabaseError";
	}
}

export class TranscriptionConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TranscriptionConfigError";
	}
}
