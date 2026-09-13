import "server-only";

import { processWords as defaultProcessWords } from "@/lib/g2p/service";
import {
	TranscriptionError,
	type TranscriptionServiceResult,
	transcriptionWordsInputSchema,
} from "./contract";

export type { TranscriptionWordsInput, TranscriptionWordsOutput } from "./contract";
export { TranscriptionError, transcriptionWordsInputSchema } from "./contract";

export type TranscribeWordsDependencies = {
	processWords?: typeof defaultProcessWords;
};

const RETRYABLE_FAILURE =
	/timeout|network|econnreset|econnrefused|enotfound|fetch failed|503|429|busy|unavailable|temporar/i;

function validationError(message: string): TranscriptionServiceResult {
	return { ok: false, error: new TranscriptionError("validation", message) };
}

function mapProcessError(error: unknown): TranscriptionError {
	if (error instanceof TranscriptionError) {
		return error;
	}

	const message = error instanceof Error ? error.message : "Transcription lookup failed";
	if (RETRYABLE_FAILURE.test(message)) {
		return new TranscriptionError("retryable", message);
	}

	return new TranscriptionError("database", message);
}

/**
 * Framework-neutral transcription entry point. Validates the words payload,
 * looks up pronunciations, and returns a typed success or failure.
 */
export async function transcribeWords(
	input: unknown,
	dependencies: TranscribeWordsDependencies = {},
): Promise<TranscriptionServiceResult> {
	const parsed = transcriptionWordsInputSchema.safeParse(input);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		return validationError(first?.message ?? "Invalid transcription input");
	}

	try {
		const process = dependencies.processWords ?? defaultProcessWords;
		const words = await process(parsed.data.words);
		return { ok: true, words };
	} catch (error) {
		return { ok: false, error: mapProcessError(error) };
	}
}
