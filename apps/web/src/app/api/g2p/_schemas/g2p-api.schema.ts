import { z } from "zod";

export const g2pRequestSchema = z.object({
	text: z
		.string()
		.min(1, "Text cannot be empty")
		.max(200, "Text must be 200 characters or less")
		.regex(
			/^[\p{L}\p{N}\s.,!?;:'"()\-–—…""''‚„«»‹›@#$%&*+/=[\]{}|\\^_`~]+$/u,
			"Text contains unsupported characters",
		),
});

export const g2pWordSchema = z.object({
	word: z.string(),
	variants: z.array(z.array(z.string())),
});

export const g2pResponseSchema = z.object({
	words: z.array(g2pWordSchema),
});

export type G2PRequest = z.infer<typeof g2pRequestSchema>;
export type G2PWord = z.infer<typeof g2pWordSchema>;
export type G2PResponse = z.infer<typeof g2pResponseSchema>;
