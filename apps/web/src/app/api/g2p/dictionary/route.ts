import { NextResponse } from "next/server";
import { dictionaryQuerySchema, fetchWordDefinition } from "../_lib/dictionary-service";

export const runtime = "nodejs";

/**
 * GET /api/g2p/dictionary?word=<word>
 */
export async function GET(request: Request) {
	try {
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
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unexpected error";
		return NextResponse.json(
			{ success: false, error: "definition_error", message },
			{ status: 400 },
		);
	}
}
