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
		const [{ createClient }, { getWorkerEnv }, { transcribeWordsOnWorker }] = await Promise.all([
			import("@libsql/client/web"),
			import("@/server/cloudflare/env"),
			import("@/server/transcription"),
		]);
		const workerEnv = getWorkerEnv();

		return transcribeWordsOnWorker(
			data,
			{
				TURSO_DATABASE_URL: workerEnv.TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN: workerEnv.TURSO_AUTH_TOKEN,
			},
			{ createClient },
		);
	});

export async function transcribeWordsFromStart(input: { words: string[] }): Promise<G2PWord[]> {
	return invokeTranscribeServerFunction(() => transcribeWordsFn({ data: input }));
}
