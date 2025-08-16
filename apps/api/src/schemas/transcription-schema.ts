import { z } from "zod";

// Request schema
export const TranscriptionRequestSchema = z.object({
	text: z.string().min(1).max(1000, "Text must be less than 1000 characters"),
});

// Response schema
export const TranscriptionResponseSchema = z.object({
	transcription: z.string().min(1),
	confidence: z.number().min(0).max(1),
	method: z.enum(["llm", "dictionary", "rules"]),
});

// Type definitions
export type TranscriptionRequest = z.infer<typeof TranscriptionRequestSchema>;
export type TranscriptionResponse = z.infer<typeof TranscriptionResponseSchema>;
