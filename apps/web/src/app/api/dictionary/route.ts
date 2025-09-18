import { NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/ratelimit";
import { dictionaryQuerySchema, fetchWordDefinition } from "./_services/dictionary-service";

/**
 * GET /api/dictionary?word=<word>
 */
export async function GET(request: Request) {
	try {
		const { success, pending } = await applyRateLimit(request);

		// Handle analytics properly for serverless environments
		await pending;

		if (!success) {
			return NextResponse.json(
				{ success: false, error: "rate_limited", message: "Too many requests" },
				{ status: 429 },
			);
		}

		const { searchParams } = new URL(request.url);
		const wordParam = searchParams.get("word") || "";

		const { word } = dictionaryQuerySchema.parse({ word: wordParam });

		const definition = await fetchWordDefinition(word);
		if (!definition) {
			return NextResponse.json(
				{ error: "not_found", message: `No definition found for "${word}"` },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true, data: definition }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ success: false, error: "definition_error", message: "Internal error" },
			{ status: 500 },
		);
	}
}
