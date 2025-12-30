import { api } from "@/lib/eden/client";

export async function fetchPhonemeSearch(args: { path: string[]; limit?: number }) {
	const limit = Math.max(1, Math.min(200, args.limit ?? 50));
	const path = args.path.map((t) => t.trim().toUpperCase()).filter(Boolean);

	const { data, error } = await api["phoneme-search"].get({
		query: {
			path: path.join(","),
			limit: String(limit),
		},
	});

	if (error) {
		const message =
			error.value && typeof error.value === "object" && "message" in error.value
				? String(error.value.message)
				: "Failed to search phonemes";
		throw new Error(message);
	}

	if (!data) {
		throw new Error("No data received from phoneme search service");
	}

	if ("error" in data) {
		throw new Error(data.message || "Failed to search phonemes");
	}

	return data;
}
