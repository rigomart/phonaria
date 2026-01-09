"use server";

import { z } from "zod";
import { rateLimitedAction } from "@/lib/safe-action";
import { g2pRequestSchema, g2pWordSchema, g2pWordsRequestSchema } from "../_lib/g2p/model";
import { processG2P, processWords } from "../_lib/g2p/service";

/**
 * Full text transcription action.
 * Tokenizes text and processes all words through CMUDict lookup.
 * Consider using transcribeWordsAction with client-side tiered lookup for better performance.
 */
export const transcribeAction = rateLimitedAction
	.metadata({ actionName: "g2p-transcribe" })
	.inputSchema(g2pRequestSchema)
	.action(async ({ parsedInput }) => {
		return processG2P(parsedInput.text);
	});

/**
 * Partial transcription action for specific words.
 * Used by tiered lookup to process only words not found in client tiers.
 * Returns an array of G2PWord objects (not wrapped in G2PResponse).
 */
export const transcribeWordsAction = rateLimitedAction
	.metadata({ actionName: "g2p-transcribe-words" })
	.inputSchema(g2pWordsRequestSchema)
	.outputSchema(z.array(g2pWordSchema))
	.action(async ({ parsedInput }) => {
		return processWords(parsedInput.words);
	});
