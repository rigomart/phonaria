import { useQuery } from "@tanstack/react-query";
import { fetchDefinition } from "../_lib/dictionary-client";

export function useDictionary(word: string | null) {
	return useQuery({
		queryKey: ["dictionary", word],
		queryFn: async () => {
			if (!word) {
				throw new Error("No word");
			}
			const result = await fetchDefinition(word);
			return result.data;
		},
		retry(failureCount, error) {
			// Don't retry on 404 or rate limit errors
			if (error instanceof Error) {
				if (error.message.includes("not found") || error.message.includes("rate")) {
					return false;
				}
			}
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
