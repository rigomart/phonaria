/**
 * CORS Middleware Configuration
 */

import { cors } from "hono/cors";

/**
 * CORS configuration for development and production
 */
export const corsMiddleware = cors({
	origin: ["http://localhost:5173"], // Frontend development server
	allowHeaders: ["Content-Type"],
	allowMethods: ["GET", "POST"],
});
