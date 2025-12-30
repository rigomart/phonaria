import { phonemeSearchResponseSchema } from "@/app/api/[[...slugs]]/phoneme-search/model";
import { createApiClient } from "@/lib/api/api-client";

const phonemeSearchApiClient = createApiClient({
	baseUrl: "",
	defaultHeaders: {
		"Content-Type": "application/json",
	},
	timeout: 15000,
});

export async function fetchPhonemeSearch(args: { path: string[]; limit?: number }): Promise<{
	words: string[];
	totalCount: number;
	nextPhonemes: Array<{ arpabet: string; ipa: string; count: number }>;
	path: string[];
}> {
	const limit = Math.max(1, Math.min(200, args.limit ?? 50));
	const path = args.path.map((t) => t.trim().toUpperCase()).filter(Boolean);

	const params = new URLSearchParams();
	params.set("path", path.join(","));
	params.set("limit", String(limit));

	return await phonemeSearchApiClient.get(
		`/api/phoneme-search?${params.toString()}`,
		phonemeSearchResponseSchema,
	);
}
