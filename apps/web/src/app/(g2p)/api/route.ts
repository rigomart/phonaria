import { type NextRequest, NextResponse } from "next/server";
import type { ApiError } from "@/lib/g2p/schemas";
import { g2pRequestSchema } from "@/lib/g2p/schemas";
import { transcribeText } from "@/lib/g2p/service";

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
