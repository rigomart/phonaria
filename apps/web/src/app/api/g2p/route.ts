import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/app/api/_lib/rate-limit";
import { g2pRequestSchema } from "./_schemas/g2p-api.schema";
import { transcribeText } from "./_services/g2p.service";

/**
 * POST /api/g2p - Convert text to phonemic transcription
 */
export async function POST(request: NextRequest) {
	const { isRateLimited, pending, limit, remaining, resetMs } = await checkRateLimit(request);

	if (isRateLimited) {
		const retryAfterSeconds = Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));
		const resetSecondsUnix = Math.ceil(resetMs / 1000);
		await pending;
		return NextResponse.json(
			{ error: "rate_limited", message: "Too many requests" },
			{
				status: 429,
				headers: {
					"Retry-After": String(retryAfterSeconds),
					"X-RateLimit-Limit": String(limit),
					"X-RateLimit-Remaining": String(Math.max(0, remaining)),
					"X-RateLimit-Reset": String(resetSecondsUnix),
				},
			},
		);
	}

	let body: unknown;
	try {
		body = (await request.json()) as unknown;
	} catch {
		return NextResponse.json({ error: "invalid_json", message: "Invalid JSON" }, { status: 400 });
	}

	// Validate request
	const validationResult = g2pRequestSchema.safeParse(body);

	if (!validationResult.success) {
		return NextResponse.json(
			{ error: "invalid_request", message: "Invalid request" },
			{ status: 400 },
		);
	}

	// Use the G2P service to transcribe
	const response = await transcribeText({ text: validationResult.data.text });

	// Ensure rate-limit analytics are flushed before responding
	await pending;
	return NextResponse.json(response, { status: 200 });
}
