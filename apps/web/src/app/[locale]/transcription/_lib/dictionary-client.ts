import { api } from "@/lib/eden/client";

export async function fetchDefinition(word: string) {
	const { data, error } = await api.dictionary.get({ query: { word } });

	if (error) {
		const message =
			error.value && typeof error.value === "object" && "message" in error.value
				? String(error.value.message)
				: "Failed to fetch definition";
		throw new Error(message);
	}

	if (!data || !("success" in data) || !data.success || !("data" in data)) {
		throw new Error("Invalid response format");
	}

	return { data: data.data };
}
