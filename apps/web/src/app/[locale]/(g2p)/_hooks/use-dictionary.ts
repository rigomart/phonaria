import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api-client";
import { fetchDefinition } from "../_lib/dictionary-client";
import type { WordDefinition } from "../_schemas/dictionary";

export function useDictionary(word: string | null): UseQueryResult<WordDefinition, ApiError> {
	const query = useQuery({
		queryKey: ["dictionary", word],
		queryFn: async () => {
			if (!word) {
				throw new Error("No word");
			}
			return fetchDefinition(word).then((r) => r.data);
		},
		enabled: !!word,
		staleTime: 60 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
	});

	return {
		...query,
	};
}
