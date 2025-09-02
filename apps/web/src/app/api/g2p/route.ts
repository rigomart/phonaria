import { type NextRequest, NextResponse } from "next/server";
import type { ApiError } from "./_lib/schemas";
import { g2pRequestSchema } from "./_lib/schemas";
import { transcribeText } from "./_lib/service";

export const runtime = "nodejs";

/**
 * POST /api/g2p - Convert text to phonemic transcription
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request
		const validationResult = g2pRequestSchema.parse(body);

		// Use the G2P service to transcribe
		const response = await transcribeText({ text: validationResult.text });

		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		console.error("G2P conversion error:", error);

		const errorResponse: ApiError = {
			error: "conversion_failed",
			message: error instanceof Error ? error.message : "Failed to convert text to phonemes",
		};

		return NextResponse.json(errorResponse, { status: 500 });
	}
}
