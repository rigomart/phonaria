/**
 * Map failed server-function calls, non-JSON 5xx bodies, and other catchable
 * platform failures onto a thrown Error the client store already treats as
 * the stable retryable "service" lookup state. Cloudflare 1102 / exceededCpu
 * cannot be caught inside the Worker; the browser still uses this mapper when
 * a failed response is available.
 */
export function toRetryableLearnerError(error: unknown): Error {
	if (error instanceof Error) {
		return error;
	}

	return new Error("Transcription lookup failed");
}

export async function invokeTranscribeServerFunction<T>(run: () => Promise<T>): Promise<T> {
	try {
		return await run();
	} catch (error) {
		throw toRetryableLearnerError(error);
	}
}
