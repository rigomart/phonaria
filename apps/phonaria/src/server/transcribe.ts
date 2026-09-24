import { createServerFn } from "@tanstack/react-start";
import type { G2PWord } from "@/lib/g2p/model";
import { invokeTranscribeServerFunction } from "@/lib/transcription/server-function-error";

/**
 * TanStack Start adapter for transcription. Server-only Turso and Worker
 * bindings stay inside the handler so the client stub cannot initialize them.
 */
export const transcribeWordsFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => data)
	.handler(async ({ data }) => {
		const [
			{ createClient },
			{ getRequestHeader, setResponseStatus },
			{ TranscriptionError },
			{ getWorkerEnv },
			{ transcribeWordsOnWorker },
		] = await Promise.all([
			import("@libsql/client/web"),
			import("@tanstack/react-start/server"),
			import("@/lib/transcription/contract"),
			import("@/server/cloudflare/env"),
			import("@/server/transcription"),
		]);
		const workerEnv = getWorkerEnv();

		try {
			return await transcribeWordsOnWorker(data, workerEnv, {
				createClient,
				rateLimitKey: getRequestHeader("cf-connecting-ip") ?? "anonymous",
			});
		} catch (error) {
			if (error instanceof TranscriptionError && error.status !== undefined) {
				setResponseStatus(error.status);
			}
			throw error;
		}
	});

export async function transcribeWordsFromStart(input: { words: string[] }): Promise<G2PWord[]> {
	return invokeTranscribeServerFunction(() => transcribeWordsFn({ data: input }));
}
