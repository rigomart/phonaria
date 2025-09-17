import { type NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/ratelimit";
import type { ApiError } from "./_schemas/g2p-api.schema";
import { g2pRequestSchema } from "./_schemas/g2p-api.schema";
import { transcribeText } from "./_services/g2p.service";

export const runtime = "nodejs";

/**
 * POST /api/g2p - Convert text to phonemic transcription
 */
export async function POST(request: NextRequest) {
	try {
		// Rate limit (per IP)
		const rl = await applyRateLimit(request, "g2p");
		if (!rl.success) {
			return new NextResponse(
				JSON.stringify({ error: "rate_limited", message: "Too many requests" }),
				{ status: 429, headers: rl.headers },
			);
		}

		// Body size guard
		const contentLength = request.headers.get("content-length");
		const MAX_BYTES = 4096; // ~4KB
		if (contentLength && Number(contentLength) > MAX_BYTES) {
			return NextResponse.json(
				{ error: "payload_too_large", message: "Request body too large" },
				{ status: 413, headers: rl.headers },
			);
		}
		const raw = await request.text();
		if (raw.length > MAX_BYTES) {
			return NextResponse.json(
				{ error: "payload_too_large", message: "Request body too large" },
				{ status: 413, headers: rl.headers },
			);
		}
		let body: unknown;
		try {
			body = raw ? JSON.parse(raw) : {};
		} catch {
			return NextResponse.json(
				{ error: "invalid_json", message: "Invalid JSON" satisfies ApiError["message"] },
				{ status: 400, headers: rl.headers },
			);
		}

		// Validate request
		const validationResult = g2pRequestSchema.parse(body);

		// Use the G2P service to transcribe
		const response = await transcribeText({ text: validationResult.text });

		return NextResponse.json(response, { status: 200, headers: rl.headers });
	} catch (error) {
		console.error("G2P conversion error:", error);

		const errorResponse: ApiError = {
			error: "conversion_failed",
			message: "Internal error",
		};

		return NextResponse.json(errorResponse, { status: 500 });
	}
}
