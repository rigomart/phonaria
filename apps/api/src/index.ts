import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import type { G2PResponse } from "./services/g2p";
import { G2PService } from "./services/g2p";
import type { ApiError } from "./types/error";

// Environment variables interface for Cloudflare Workers
interface CloudflareBindings {
	AI_PROVIDER_API_KEY: string;
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
	"/*",
	cors({
		origin: ["http://localhost:5173"],
		allowHeaders: ["Content-Type"],
		allowMethods: ["GET", "POST"],
	}),
);

const g2pRequestSchema = z.object({
	text: z
		.string()
		.min(1, "Text cannot be empty")
		.max(200, "Text must be 200 characters or less")
		.regex(/^[\w\s.,!?;:'"()-]+$/, "Text contains invalid characters"),
});

app.get("/", (c) => {
	return c.json({
		name: "Phonix G2P API",
		version: "1.0.0",
		endpoints: {
			"/api/g2p": "POST - Convert text to phonemic transcription",
		},
	});
});

/**
 * POST /api/g2p - Convert text to phonemic transcription
 */
app.post("/api/g2p", zValidator("json", g2pRequestSchema), async (c) => {
	try {
		const apiKey = c.env.AI_PROVIDER_API_KEY;

		if (!apiKey) {
			const error: ApiError = {
				error: "configuration_error",
				message: "Provider API key not configured",
			};
			return c.json(error, 500);
		}

		const { text } = c.req.valid("json");

		const g2pService = new G2PService("openai", { apiKey });

		const words = await g2pService.textToPhonemes(text);

		const response: G2PResponse = { words };
		return c.json(response, 200);
	} catch (error) {
		console.error("G2P conversion error:", error);

		const errorResponse: ApiError = {
			error: "conversion_failed",
			message: error instanceof Error ? error.message : "Failed to convert text to phonemes",
		};

		return c.json(errorResponse, 500);
	}
});

/**
 * Health check endpoint
 */
app.get("/health", (c) => {
	return c.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

export default app;
