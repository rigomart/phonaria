const RETRYABLE_FAILURE =
	/timeout|network|econnreset|econnrefused|enotfound|fetch failed|503|429|busy|unavailable|temporar/i;
const RETRYABLE_ERROR_NAME = /^(TimeoutError|AbortError)$/;

const MAX_REASON_LENGTH = 120;
const MAX_CAUSE_DEPTH = 8;

/**
 * Drizzle wraps libsql's error in one whose message is the query and its
 * parameters, which are the learner's words.
 */
function isQueryWrapper(error: Error): boolean {
	return "params" in error;
}

function errorChain(error: unknown): Error[] {
	const seen: Error[] = [];
	let current: unknown = error;
	while (current instanceof Error && seen.length < MAX_CAUSE_DEPTH && !seen.includes(current)) {
		seen.push(current);
		current = current.cause;
	}
	return seen.filter((entry) => !isQueryWrapper(entry));
}

/** Whether a failed database lookup is worth retrying: a timeout, abort or transient network or server error. */
export function isRetryableLookupFailure(error: unknown): boolean {
	return errorChain(error).some(
		(entry) => RETRYABLE_ERROR_NAME.test(entry.name) || RETRYABLE_FAILURE.test(entry.message),
	);
}

/**
 * A short, log-safe description of a failed database lookup: the innermost
 * error's name, code and message, without Drizzle's query and parameters, and
 * with URLs dropped so a database host never reaches the log.
 */
export function describeLookupFailure(error: unknown): string | undefined {
	const chain = errorChain(error);
	const root = chain.at(-1);
	if (!root) return undefined;
	const code = chain.find(
		(entry): entry is Error & { code: string } => "code" in entry && typeof entry.code === "string",
	)?.code;
	const message = root.message.replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s)]+/gi, "[url]");
	// libsql already starts its own messages with the code.
	const prefix = code && !message.startsWith(`${code}:`) ? code : undefined;
	const reason = [root.name, prefix, message].filter(Boolean).join(": ");
	return reason.length > MAX_REASON_LENGTH ? `${reason.slice(0, MAX_REASON_LENGTH - 1)}…` : reason;
}
