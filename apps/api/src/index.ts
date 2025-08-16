import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
	TranscriptionRequestSchema,
	TranscriptionResponseSchema,
} from "./schemas/transcription-schema";
import { transcribeText } from "./services/llm-transcription";

const app = new Hono();

// Add CORS middleware
app.use("/api/*", cors());

app.get("/", (c) => {
	return c.text("Phonix G2P API");
});

// POST /api/transcribe endpoint
app.post("/api/transcribe", zValidator("json", TranscriptionRequestSchema), async (c) => {
	const { text } = c.req.valid("json");

	try {
		// Transcribe the text using our multi-layer approach
		const result = await transcribeText(text, c.env as any);

		// Validate the response
		const validatedResponse = TranscriptionResponseSchema.parse(result);

		return c.json(validatedResponse);
	} catch (error) {
		console.error("Transcription error:", error);
		return c.json(
			{
				error: "Failed to transcribe text",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

export default app;
