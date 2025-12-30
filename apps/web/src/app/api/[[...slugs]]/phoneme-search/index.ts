import { Elysia, t } from "elysia";
import { checkRateLimit } from "../_shared/rate-limit";
import { phonemeSearchQuerySchema } from "./model";
import { searchPhonemes } from "./service";

export const phonemeSearch = new Elysia({ prefix: "/phoneme-search" }).get(
	"/",
	async ({ query, request, set }) => {
		const { isRateLimited, pending } = await checkRateLimit(request);
		if (isRateLimited) {
			await pending;
			set.status = 429;
			return { error: "rate_limit_exceeded", message: "Too many requests" };
		}

		const rawPath = query.path ?? "";
		const rawLimit = query.limit ?? "50";

		const validationResult = phonemeSearchQuerySchema.safeParse({
			path: rawPath,
			limit: rawLimit,
		});

		if (!validationResult.success) {
			await pending;
			set.status = 400;
			return { error: "invalid_request", message: "Invalid request parameters" };
		}

		const { path: pathString, limit } = validationResult.data;

		const result = await searchPhonemes(pathString, limit);

		if ("error" in result) {
			await pending;
			set.status = 400;
			return result;
		}

		await pending;
		set.status = 200;
		return result;
	},
	{
		query: t.Object({
			path: t.Optional(t.String()),
			limit: t.Optional(t.String()),
		}),
	},
);
