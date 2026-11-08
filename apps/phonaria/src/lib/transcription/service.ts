import { processWords as defaultProcessWords } from "@/lib/g2p/service";
import {
	TranscriptionError,
	type TranscriptionServiceResult,
	transcriptionWordsInputSchema,
} from "./contract";
import { describeLookupFailure, isRetryableLookupFailure } from "./lookup-failure";

export { TranscriptionError } from "./contract";

export type TranscribeWordsDependencies = {
	processWords?: typeof defaultProcessWords;
};

/** Fixed text for the browser; a lookup's own error can hold SQL and the learner's words. */
export const TRANSCRIPTION_RETRYABLE_MESSAGE =
	"The pronunciation lookup didn't respond. Please try again.";
export const TRANSCRIPTION_DATABASE_MESSAGE = "The pronunciation lookup failed. Please try again.";

function validationError(message: string): TranscriptionServiceResult {
	return { ok: false, error: new TranscriptionError("validation", message) };
}

function mapProcessError(error: unknown): { error: TranscriptionError; reason?: string } {
	if (error instanceof TranscriptionError) {
		return { error };
	}

	const reason = describeLookupFailure(error);
	if (isRetryableLookupFailure(error)) {
		return { error: new TranscriptionError("retryable", TRANSCRIPTION_RETRYABLE_MESSAGE), reason };
	}

	return { error: new TranscriptionError("database", TRANSCRIPTION_DATABASE_MESSAGE), reason };
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
		return { ok: false, ...mapProcessError(error) };
	}
}
