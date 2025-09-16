import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { fetchDefinition } from "../_lib/dictionary-client";
import type { WordDefinition } from "../_schemas/dictionary";

export function useDictionary(word: string | null) {
	const query = useQuery({
		queryKey: ["dictionary", word ?? ""],
		queryFn: () => {
			if (!word) {
				throw new Error("No word");
			}
			return fetchDefinition(word).then((r) => r.data);
		},
		enabled: !!word,
		retry: (failureCount, error) => {
			if (error instanceof ApiError && error.status === 404) return false;
			return failureCount < 2;
		},
		staleTime: 60 * 60 * 1000,
		gcTime: 24 * 60 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
	});

	const isNotFound = query.error instanceof ApiError && query.error.status === 404;
	const errorMessage =
		query.error && !isNotFound ? String((query.error as Error).message || "") : null;

	return {
		...query,
		data: (query.data as WordDefinition | undefined) ?? null,
		isLoading: query.isPending,
		isNotFound,
		errorMessage,
	};
}
