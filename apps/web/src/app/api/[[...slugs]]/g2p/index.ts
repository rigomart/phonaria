import { Elysia, t } from "elysia";
import { checkRateLimit } from "../_shared/rate-limit";
import { type G2PResponse, g2pRequestSchema } from "./model";
import { processG2P } from "./service";

export const g2p = new Elysia({ prefix: "/g2p" }).post(
	"/",
	async ({ body, request, set }) => {
		const { isRateLimited, pending } = await checkRateLimit(request);
		if (isRateLimited) {
			await pending;
			set.status = 429;
			return { error: "rate_limit_exceeded", message: "Too many requests" };
		}

		const validationResult = g2pRequestSchema.safeParse(body);

		if (!validationResult.success) {
			await pending;
			set.status = 400;
			return { error: "invalid_request", message: "Invalid request" };
		}

		try {
			const response: G2PResponse = await processG2P(validationResult.data.text);
			await pending;
			set.status = 200;
			return response;
		} catch (error) {
			console.error("G2P API error:", error);
			await pending;
			set.status = 500;
			return { error: "internal_server_error", message: "Failed to process request" };
		}
	},
	{
		body: t.Object({
			text: t.String(),
		}),
	},
);
