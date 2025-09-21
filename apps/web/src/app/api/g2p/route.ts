import { type NextRequest, NextResponse } from "next/server";
import { g2pRequestSchema } from "./_schemas/g2p-api.schema";
import { transcribeText } from "./_services/g2p.service";

export const runtime = "nodejs";
/**
 * POST /api/g2p - Convert text to phonemic transcription
 */
export async function POST(request: NextRequest) {
	const body = (await request.json()) as unknown;

	const validationResult = g2pRequestSchema.safeParse(body);

	if (!validationResult.success) {
		return NextResponse.json(
			{ error: "invalid_request", message: "Invalid request" },
			{ status: 400 },
		);
	}

	const response = await transcribeText({ text: validationResult.data.text });

	return NextResponse.json(response, { status: 200 });
}
