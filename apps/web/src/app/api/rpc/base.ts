import { os } from "@orpc/server";
import * as z from "zod";

// Define common errors that can be used across all procedures
export const base = os.$context<{ request: Request }>().errors({
	RATE_LIMITED: {
		status: 429,
		message: "Too many requests",
		data: z.object({
			retryAfter: z.number(),
		}),
	},
	NOT_FOUND: {
		status: 404,
		message: "Resource not found",
	},
	INVALID_INPUT: {
		status: 400,
		message: "Invalid input",
		data: z.object({
			details: z.string().optional(),
		}),
	},
});
