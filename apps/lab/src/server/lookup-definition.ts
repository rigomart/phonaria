import { createServerFn } from "@tanstack/react-start";
import type { DefinitionLookupOutput } from "@/lib/definition/contract";

/**
 * TanStack Start adapter for dictionary lookups. Worker bindings stay inside
 * the handler so the client stub cannot initialize them.
 */
export const lookupDefinitionFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => data)
	.handler(async ({ data }) => {
		const [
			{ getRequestHeader, setResponseStatus },
			{ DefinitionError },
			{ getWorkerEnv },
			{ lookupDefinitionOnWorker },
		] = await Promise.all([
			import("@tanstack/react-start/server"),
			import("@/lib/definition/contract"),
			import("@/server/cloudflare/env"),
			import("@/server/definition"),
		]);
		const workerEnv = getWorkerEnv();

		try {
			return await lookupDefinitionOnWorker(data, workerEnv, {
				rateLimitKey: getRequestHeader("cf-connecting-ip") ?? "anonymous",
			});
		} catch (error) {
			if (error instanceof DefinitionError && error.status !== undefined) {
				setResponseStatus(error.status);
			}
			throw error;
		}
	});

export async function lookupDefinitionFromStart(input: {
	word: string;
}): Promise<DefinitionLookupOutput> {
	try {
		return await lookupDefinitionFn({ data: input });
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error("We couldn't load that definition. Please try again.");
	}
}
