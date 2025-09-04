import { createApiClient } from "@/lib/api-client";
import { dictionarySuccessSchema } from "../_types/dictionary";

const client = createApiClient({
	baseUrl: "",
	defaultHeaders: { "Content-Type": "application/json" },
	timeout: 10000,
});

export async function fetchDefinition(word: string) {
	const url = `/api/g2p/dictionary?word=${encodeURIComponent(word)}`;
	return client.get(url, dictionarySuccessSchema);
}
