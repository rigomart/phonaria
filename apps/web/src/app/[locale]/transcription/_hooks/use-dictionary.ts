import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api/api-error";
import { fetchDefinition } from "../_lib/dictionary-client";
import type { WordDefinition } from "../_schemas/dictionary";

export function useDictionary(word: string | null) {
	return useQuery<WordDefinition, ApiError>({
		queryKey: ["dictionary", word],
		queryFn: async () => {
			if (!word) {
				throw new Error("No word");
			}
			return fetchDefinition(word).then((r) => r.data);
		},
		retry(failureCount, error) {
			const status = error.status;
			if (status === 404 || status === 429) return false;
			return failureCount < 2;
		},
		enabled: !!word,
		staleTime: 60 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
	});
}
