/**
 * G2P API Routes with inline handlers (Hono best practices)
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { type ApiError, type G2PResponse, g2pRequestSchema } from "../schemas/g2p";
import { transcribeText } from "../services/g2p";

const g2pRouter = new Hono();

/**
 * POST /api/g2p - Convert text to phonemic transcription
 */
g2pRouter.post("/", zValidator("json", g2pRequestSchema), async (c) => {
	try {
		const { text } = c.req.valid("json");

		// Use the G2P service to transcribe
		const response: G2PResponse = await transcribeText({ text });

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

export default g2pRouter;
