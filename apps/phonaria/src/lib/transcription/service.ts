import { processWords as defaultProcessWords } from "@/lib/g2p/service";
import {
	TranscriptionError,
	type TranscriptionServiceResult,
	transcriptionWordsInputSchema,
} from "./contract";

export { TranscriptionError } from "./contract";

export type TranscribeWordsDependencies = {
	processWords?: typeof defaultProcessWords;
};

const RETRYABLE_FAILURE =
	/timeout|network|econnreset|econnrefused|enotfound|fetch failed|503|429|busy|unavailable|temporar/i;
const RETRYABLE_ERROR_NAME = /^(TimeoutError|AbortError)$/;

/** Fixed text for the browser; a lookup's own error can hold SQL and the learner's words. */
export const TRANSCRIPTION_RETRYABLE_MESSAGE =
	"The pronunciation lookup didn't respond. Please try again.";
export const TRANSCRIPTION_DATABASE_MESSAGE = "The pronunciation lookup failed. Please try again.";

function validationError(message: string): TranscriptionServiceResult {
	return { ok: false, error: new TranscriptionError("validation", message) };
}

const MAX_REASON_LENGTH = 120;
const MAX_CAUSE_DEPTH = 8;

/**
 * Drizzle wraps libsql's error in one whose message is the query and its
 * parameters, which are the learner's words.
 */
function isQueryWrapper(error: Error): boolean {
	return "params" in error;
}

/** The error and its `cause`s, outermost first, without Drizzle's query wrapper. */
function errorChain(error: unknown): Error[] {
	const seen: Error[] = [];
	let current: unknown = error;
	while (current instanceof Error && seen.length < MAX_CAUSE_DEPTH && !seen.includes(current)) {
		seen.push(current);
		current = current.cause;
	}
	return seen.filter((entry) => !isQueryWrapper(entry));
}

function isRetryable(chain: Error[]): boolean {
	return chain.some(
		(error) => RETRYABLE_ERROR_NAME.test(error.name) || RETRYABLE_FAILURE.test(error.message),
	);
}

/**
 * What went wrong, for the Worker log only: the innermost error's name, the
 * first error code, and its message with URLs dropped so a database host never
 * reaches the log.
 */
function describeFailure(chain: Error[]): string | undefined {
	const root = chain.at(-1);
	if (!root) return undefined;
	const code = chain.find(
		(error): error is Error & { code: string } => "code" in error && typeof error.code === "string",
	)?.code;
	const message = root.message.replace(/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[url]");
	// libsql already starts its own messages with the code.
	const prefix = code && !message.startsWith(`${code}:`) ? code : undefined;
	const reason = [root.name, prefix, message].filter(Boolean).join(": ");
	return reason.length > MAX_REASON_LENGTH ? `${reason.slice(0, MAX_REASON_LENGTH - 1)}…` : reason;
}

function mapProcessError(error: unknown): { error: TranscriptionError; reason?: string } {
	if (error instanceof TranscriptionError) {
		return { error };
	}

	const chain = errorChain(error);
	const reason = describeFailure(chain);
	if (isRetryable(chain)) {
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
