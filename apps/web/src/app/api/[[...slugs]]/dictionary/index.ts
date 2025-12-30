import { Elysia, t } from "elysia";
import { checkRateLimit } from "../_shared/rate-limit";
import { dictionaryQuerySchema, fetchWordDefinition } from "./service";

export const dictionary = new Elysia({ prefix: "/dictionary" }).get(
	"/",
	async ({ query, request, set }) => {
		const { isRateLimited, pending, limit, remaining, resetMs } = await checkRateLimit(request);

		if (isRateLimited) {
			const retryAfterSeconds = Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));
			const resetSecondsUnix = Math.ceil(resetMs / 1000);

			set.status = 429;
			set.headers = {
				"Retry-After": String(retryAfterSeconds),
				"X-RateLimit-Limit": String(limit),
				"X-RateLimit-Remaining": String(Math.max(0, remaining)),
				"X-RateLimit-Reset": String(resetSecondsUnix),
			};

			await pending;
			return { isRateLimited: true, error: "rate_limited", message: "Too many requests" };
		}

		const validationResult = dictionaryQuerySchema.safeParse({
			word: query.word ?? "",
		});

		if (!validationResult.success) {
			set.status = 400;
			return { error: "invalid_request", message: "Invalid request" };
		}

		const definition = await fetchWordDefinition(validationResult.data.word);

		if (!definition) {
			set.status = 404;
			return {
				error: "not_found",
				message: `No definition found for "${validationResult.data.word}"`,
			};
		}

		await pending;
		set.status = 200;
		return { success: true, data: definition };
	},
	{
		query: t.Object({
			word: t.Optional(t.String()),
		}),
	},
);
