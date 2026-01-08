/**
 * Server action client with rate limiting middleware.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { z } from "zod";

/**
 * Custom error class for action-specific errors.
 * Throw this in action handlers to return a structured error.
 */
export class ActionError extends Error {
	constructor(
		message: string,
		public code: string = "ACTION_ERROR",
		public details?: unknown,
	) {
		super(message);
		this.name = "ActionError";
	}
}

/**
 * Rate limiter instance using Upstash Redis.
 * 20 requests per 10 seconds sliding window.
 */
const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(20, "10 s"),
	analytics: true,
	timeout: 10000,
});

/**
 * Get client IP address from request headers.
 */
async function getClientIP(): Promise<string> {
	const headersList = await headers();

	const forwardedFor = headersList.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	const realIP = headersList.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	return "unknown";
}

/**
 * Base action client without rate limiting.
 */
export const actionClient = createSafeActionClient({
	defineMetadataSchema() {
		return z.object({
			actionName: z.string(),
		});
	},
	handleServerError(e) {
		console.error("[Action Error]", e.message);

		if (e instanceof ActionError) {
			return {
				code: e.code,
				message: e.message,
				details: e.details,
			};
		}

		return {
			code: "SERVER_ERROR",
			message: DEFAULT_SERVER_ERROR_MESSAGE,
		};
	},
});

/**
 * Rate-limited action client.
 * Use this for public-facing actions.
 */
export const rateLimitedAction = actionClient.use(async ({ next }) => {
	const ip = await getClientIP();
	const { success, pending, reset } = await ratelimit.limit(ip);

	if (!success) {
		await pending;
		const retryAfter = Math.ceil((reset - Date.now()) / 1000);
		throw new ActionError("Too many requests. Please try again later.", "RATE_LIMITED", {
			retryAfter,
		});
	}

	const result = await next();
	await pending;
	return result;
});
