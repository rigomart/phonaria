import { createServerFn } from "@tanstack/react-start";
import type {
	SpellingContextInput,
	SpellingContextOutput,
} from "@/lib/transcription/spelling-context";

/**
 * TanStack Start adapter for context-aware spelling suggestions. Worker bindings and the
 * OpenRouter key stay inside the handler so the client stub cannot reach them.
 */
export const chooseSpellingInContextFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => data)
	.handler(async ({ data }) => {
		const [
			{ getRequestHeader, setResponseStatus },
			{ SpellingContextValidationError },
			{ getWorkerEnv },
			{ chooseSpellingOnWorker },
		] = await Promise.all([
			import("@tanstack/react-start/server"),
			import("@/lib/transcription/spelling-context-service"),
			import("@/server/cloudflare/env"),
			import("@/server/spelling-context"),
		]);

		try {
			return await chooseSpellingOnWorker(data, getWorkerEnv(), {
				rateLimitKey: getRequestHeader("cf-connecting-ip") ?? "anonymous",
			});
		} catch (error) {
			if (error instanceof SpellingContextValidationError) setResponseStatus(400);
			throw error;
		}
	});

export function chooseSpellingInContextFromStart(
	input: SpellingContextInput,
): Promise<SpellingContextOutput> {
	return chooseSpellingInContextFn({ data: input });
}
