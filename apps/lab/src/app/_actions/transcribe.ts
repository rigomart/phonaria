"use server";

import type { G2PWord } from "@/lib/g2p/model";
import { type TranscriptionWordsInput, transcribeWords } from "@/lib/transcription/service";

export async function transcribeWordsAction(input: TranscriptionWordsInput): Promise<G2PWord[]> {
	const result = await transcribeWords(input);
	if (!result.ok) {
		throw result.error;
	}
	return result.words;
}
