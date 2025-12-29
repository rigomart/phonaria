import { like } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { words } from "@/db/schema";
import { checkRateLimit } from "../_lib/rate-limit";
import {
	arpabetToIpa,
	buildPhonemeKeyPrefix,
	extractNextPhoneme,
	isValidArpabetLabel,
	parsePath,
} from "./_lib/phoneme-utils";
import { phonemeSearchQuerySchema } from "./_schemas/phoneme-search.schema";

type NextPhonemeAggregation = Map<string, number>;

function aggregateNextPhonemes(phonemeKeys: string[], pathLength: number): NextPhonemeAggregation {
	const aggregation = new Map<string, number>();

	for (const phonemeKey of phonemeKeys) {
		const nextPhoneme = extractNextPhoneme(phonemeKey, pathLength);
		if (nextPhoneme) {
			aggregation.set(nextPhoneme, (aggregation.get(nextPhoneme) ?? 0) + 1);
		}
	}

	return aggregation;
}

function formatNextPhonemes(
	aggregation: NextPhonemeAggregation,
): Array<{ arpabet: string; ipa: string; count: number }> {
	return Array.from(aggregation.entries())
		.map(([arpabet, count]) => ({
			arpabet,
			ipa: arpabetToIpa(arpabet) ?? `/${arpabet}/`,
			count,
		}))
		.sort((a, b) => b.count - a.count);
}

export async function GET(request: NextRequest) {
	const rateLimitResult = await checkRateLimit(request);
	if (rateLimitResult.isRateLimited) {
		await rateLimitResult.pending;
		return NextResponse.json(
			{ error: "rate_limit_exceeded", message: "Too many requests" },
			{ status: 429 },
		);
	}

	const { searchParams } = new URL(request.url);
	const rawPath = searchParams.get("path") ?? "";
	const rawLimit = searchParams.get("limit") ?? "50";

	const validationResult = phonemeSearchQuerySchema.safeParse({
		path: rawPath,
		limit: rawLimit,
	});

	if (!validationResult.success) {
		return NextResponse.json(
			{ error: "invalid_request", message: "Invalid request parameters" },
			{ status: 400 },
		);
	}

	const { path: pathString, limit } = validationResult.data;

	const pathArray = parsePath(pathString);

	if (pathArray.length === 0) {
		await rateLimitResult.pending;
		return NextResponse.json({
			words: [],
			totalCount: 0,
			nextPhonemes: [],
			path: [],
		});
	}

	const invalidLabels = pathArray.filter((label) => !isValidArpabetLabel(label));
	if (invalidLabels.length > 0) {
		await rateLimitResult.pending;
		return NextResponse.json(
			{
				error: "invalid_path",
				message: `Invalid ARPABET labels: ${invalidLabels.join(", ")}`,
				invalidLabels,
			},
			{ status: 400 },
		);
	}

	const prefix = buildPhonemeKeyPrefix(pathArray);

	const matchingWords = await db
		.select({ word: words.word, phonemeKey: words.phonemeKey })
		.from(words)
		.where(like(words.phonemeKey, `${prefix}%`))
		.limit(limit);

	const wordsList = matchingWords.map((row) => row.word.toLowerCase());
	const phonemeKeys = matchingWords.map((row) => row.phonemeKey);

	const nextPhonemeAggregation = aggregateNextPhonemes(phonemeKeys, pathArray.length);
	const nextPhonemes = formatNextPhonemes(nextPhonemeAggregation);

	await rateLimitResult.pending;
	return NextResponse.json({
		words: wordsList,
		totalCount: wordsList.length,
		nextPhonemes,
		path: pathArray,
	});
}
