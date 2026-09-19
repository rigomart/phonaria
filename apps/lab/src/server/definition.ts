import {
	DefinitionError,
	type DefinitionLookupOutput,
	type DefinitionServiceResult,
} from "@/lib/definition/contract";
import { lookupDefinition as defaultLookupDefinition } from "@/lib/definition/service";
import type { WorkerRateLimit } from "@/server/cloudflare/env";
import { logWorkerEvent } from "@/server/cloudflare/log";

export type LookupDefinitionOnWorkerDependencies = {
	lookupDefinition?: typeof defaultLookupDefinition;
	rateLimitKey?: string;
	log?: typeof logWorkerEvent;
};

export type DefinitionWorkerEnv = {
	DEFINITION_RATE_LIMIT: WorkerRateLimit;
};

/**
 * Framework-neutral Worker handler. Applies the Cloudflare IP rate limit, then
 * delegates to the shared definition service. Does not import `cloudflare:workers`.
 */
export async function lookupDefinitionOnWorker(
	input: unknown,
	env: DefinitionWorkerEnv,
	dependencies: LookupDefinitionOnWorkerDependencies = {},
): Promise<DefinitionLookupOutput> {
	const log = dependencies.log ?? logWorkerEvent;
	const lookup = dependencies.lookupDefinition ?? defaultLookupDefinition;

	if (!env.DEFINITION_RATE_LIMIT) {
		const error = new DefinitionError("retryable", "Definition lookup is temporarily unavailable.");
		log({
			level: "error",
			message: "definition_lookup_failed",
			details: { kind: error.kind, retryable: error.retryable },
		});
		throw error;
	}

	const limited = await env.DEFINITION_RATE_LIMIT.limit({
		key: dependencies.rateLimitKey?.trim() || "anonymous",
	});
	if (!limited.success) {
		const error = new DefinitionError(
			"rate_limit",
			"Too many definition requests. Please try again shortly.",
		);
		log({
			level: "warn",
			message: "definition_lookup_failed",
			details: { kind: error.kind, retryable: error.retryable },
		});
		throw error;
	}

	let result: DefinitionServiceResult;
	try {
		result = await lookup(input);
	} catch {
		const error = new DefinitionError(
			"retryable",
			"We couldn't load that definition. Please try again.",
		);
		log({
			level: "error",
			message: "definition_lookup_failed",
			details: { kind: error.kind, retryable: error.retryable },
		});
		throw error;
	}

	if (!result.ok) {
		log({
			level:
				result.error.kind === "validation" || result.error.kind === "rate_limit" ? "warn" : "error",
			message: "definition_lookup_failed",
			details: {
				kind: result.error.kind,
				retryable: result.error.retryable,
			},
		});
		throw result.error;
	}

	return result.result;
}
