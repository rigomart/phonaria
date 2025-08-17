import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { OpenAIService } from "./services/openai";
import type { G2PError, G2PResponse } from "./types/g2p";

/**
 * Hono.js API for Phonix G2P (Grapheme-to-Phoneme) conversion
 */
// Environment variables interface for Cloudflare Workers
interface CloudflareBindings {
	OPENAI_API_KEY: string;
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Add CORS middleware for frontend integration
app.use(
	"/*",
	cors({
		origin: ["http://localhost:5173", "http://localhost:3000"], // Common dev server ports
		allowHeaders: ["Content-Type"],
		allowMethods: ["GET", "POST"],
	}),
);

// Request validation schema
const g2pRequestSchema = z.object({
	text: z
		.string()
		.min(1, "Text cannot be empty")
		.max(500, "Text must be 500 characters or less")
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
		// Get OpenAI API key from environment
		const openaiApiKey = c.env?.OPENAI_API_KEY as string;
		if (!openaiApiKey) {
			const error: G2PError = {
				error: "configuration_error",
				message: "OpenAI API key not configured",
			};
			return c.json(error, 500);
		}

		// Get validated request data
		const { text } = c.req.valid("json");

		// Initialize OpenAI service
		const openaiService = new OpenAIService(openaiApiKey);

		// Convert text to phonemes
		const words = await openaiService.textToPhonemes(text);

		// Return successful response
		const response: G2PResponse = { words };
		return c.json(response, 200);
	} catch (error) {
		console.error("G2P conversion error:", error);

		const errorResponse: G2PError = {
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
