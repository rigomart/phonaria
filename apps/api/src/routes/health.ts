/**
 * Health Check Routes with inline handlers (Hono best practices)
 */

import { Hono } from "hono";
import type { HealthResponse } from "../schemas/g2p";
import { isHealthy } from "../services/g2p";

const healthRouter = new Hono();

/**
 * GET / - API information
 */
healthRouter.get("/", (c) => {
	return c.json({
		name: "Phonix G2P API",
		version: "0.0.1",
		endpoints: {
			"/api/g2p": "POST - Convert text to phonemic transcription",
		},
	});
});

/**
 * GET /health - Health check endpoint
 */
healthRouter.get("/health", (c) => {
	const healthy = isHealthy();

	const response: HealthResponse = {
		status: healthy ? "healthy" : "unhealthy",
		timestamp: new Date().toISOString(),
		dictionary: healthy ? "loaded" : "not loaded",
	};

	return c.json(response);
});

export default healthRouter;
