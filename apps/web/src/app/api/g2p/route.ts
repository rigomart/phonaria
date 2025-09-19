import { type NextRequest, NextResponse } from "next/server";
import { g2pRequestSchema } from "./_schemas/g2p-api.schema";
import { transcribeText } from "./_services/g2p.service";

/**
 * POST /api/g2p - Convert text to phonemic transcription
 */
export async function POST(request: NextRequest) {
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
	return NextResponse.json(response, { status: 200 });
}
