import { z } from "zod";
import { type G2PWord, g2pWordSchema } from "@/lib/g2p/model";

export const MAX_TRANSCRIPTION_WORDS = 200;

export const transcriptionWordsInputSchema = z.object({
	words: z.array(z.string().min(1)).min(1).max(MAX_TRANSCRIPTION_WORDS),
});

export type TranscriptionWordsInput = z.input<typeof transcriptionWordsInputSchema>;

export const transcriptionWordsOutputSchema = z.array(g2pWordSchema);
export type TranscriptionWordsOutput = G2PWord[];

export type TranscriptionFailureKind = "validation" | "database" | "retryable";

export class TranscriptionError extends Error {
	readonly kind: TranscriptionFailureKind;
	readonly retryable: boolean;

	constructor(kind: TranscriptionFailureKind, message: string) {
		super(message);
		this.name = "TranscriptionError";
		this.kind = kind;
		this.retryable = kind !== "validation";
	}
}

export type TranscriptionServiceResult =
	| { ok: true; words: TranscriptionWordsOutput }
	| { ok: false; error: TranscriptionError };
