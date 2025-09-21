import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../_lib/rate-limit";
import { cmudict } from "./_core/dictionary";
import { fallbackG2P } from "./_core/phoneme-generator";
import type { G2PResponse, G2PWord } from "./_schemas/g2p-api.schema";
import { tokenizeText } from "./_utils/text-processing";
import { isValidText, validateRequest } from "./_utils/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const rateLimitResult = await checkRateLimit(request);
	if (rateLimitResult.isRateLimited) {
		return NextResponse.json(
			{ error: "rate_limit_exceeded", message: "Too many requests" },
			{ status: 429 },
		);
	}

	let body: unknown;
	try {
		body = (await request.json()) as unknown;
	} catch (error) {
		return NextResponse.json(
			{ error: "invalid_json", message: "Invalid JSON in request body" },
			{ status: 400 },
		);
	}

	const validationResult = validateRequest(body);

	try {
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: "invalid_request", message: "Invalid request" },
				{ status: 400 },
			);
		}

		const { text } = validationResult.data;

		if (!isValidText(text)) {
			return NextResponse.json({ words: [] }, { status: 200 });
		}

		await cmudict.load();

		const words = tokenizeText(text);
		const results: G2PWord[] = [];

		for (const word of words) {
			if (word.length === 0) continue;

			const variants = cmudict.lookup(word);
			let ipaVariants: string[][];

			if (variants && variants.length > 0) {
				ipaVariants = variants;
			} else {
				ipaVariants = [fallbackG2P.generatePronunciation(word)];
			}

			results.push({
				word: word.toLowerCase(),
				variants: ipaVariants,
			});
		}

		const response: G2PResponse = { words: results };
		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		console.error("G2P API error:", error);
		return NextResponse.json(
			{ error: "internal_server_error", message: "Failed to process request" },
			{ status: 500 },
		);
	}
}
