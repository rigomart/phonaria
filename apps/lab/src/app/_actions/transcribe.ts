"use server";

import { z } from "zod";
import type { G2PWord } from "@/lib/g2p/model";
import { processWords } from "@/lib/g2p/service";

const inputSchema = z.object({
	words: z.array(z.string().min(1)).min(1).max(200),
});

export async function transcribeWordsAction(
	input: z.input<typeof inputSchema>,
): Promise<G2PWord[]> {
	const parsed = inputSchema.parse(input);
	return processWords(parsed.words);
}
