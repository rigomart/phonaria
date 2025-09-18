import { NextResponse } from "next/server";
import { checkRateLimit } from "@/app/api/_lib/rate-limit";
import { dictionaryQuerySchema, fetchWordDefinition } from "./_services/dictionary-service";

/**
 * GET /api/dictionary?word=<word>
 */
export async function GET(request: Request) {
	const { isRateLimited } = await checkRateLimit(request);

	if (isRateLimited) {
		return NextResponse.json(
			{ isRateLimited: true, error: "rate_limited", message: "Too many requests" },
			{ status: 429 },
		);
	}

	const { searchParams } = new URL(request.url);
	const word = searchParams.get("word") || "";

	const validationResult = dictionaryQuerySchema.safeParse({ word });

	if (!validationResult.success) {
		return NextResponse.json(
			{ error: "invalid_request", message: "Invalid request" },
			{ status: 400 },
		);
	}

	const definition = await fetchWordDefinition(validationResult.data.word);

	if (!definition) {
		return NextResponse.json(
			{ error: "not_found", message: `No definition found for "${validationResult.data.word}"` },
			{ status: 404 },
		);
	}

	return NextResponse.json({ success: true, data: definition }, { status: 200 });
}
