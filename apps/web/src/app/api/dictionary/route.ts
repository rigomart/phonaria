import { NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/ratelimit";
import { dictionaryQuerySchema, fetchWordDefinition } from "./_services/dictionary-service";

export const runtime = "nodejs";

/**
 * GET /api/dictionary?word=<word>
 */
export async function GET(request: Request) {
	try {
		const rl = await applyRateLimit(request, "dictionary");
		if (!rl.success) {
			return new NextResponse(
				JSON.stringify({ success: false, error: "rate_limited", message: "Too many requests" }),
				{ status: 429, headers: rl.headers },
			);
		}
		const { searchParams } = new URL(request.url);
		const wordParam = searchParams.get("word") || "";

		const { word } = dictionaryQuerySchema.parse({ word: wordParam });

		const definition = await fetchWordDefinition(word);
		if (!definition) {
			return NextResponse.json(
				{ error: "not_found", message: `No definition found for "${word}"` },
				{ status: 404, headers: rl.headers },
			);
		}

		return NextResponse.json(
			{ success: true, data: definition },
			{ status: 200, headers: rl.headers },
		);
	} catch {
		return NextResponse.json(
			{ success: false, error: "definition_error", message: "Internal error" },
			{ status: 500 },
		);
	}
}
