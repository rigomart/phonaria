import { skipToken, useQuery } from "@tanstack/react-query";
import { isDefinedError, orpc } from "@/lib/orpc";

export function useDictionary(word: string | null) {
	return useQuery(
		orpc.dictionary.lookup.queryOptions({
			input: word ? { word } : skipToken,
			staleTime: 60 * 60 * 1000,
			gcTime: 24 * 60 * 60 * 1000,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: false,
			retry: (failureCount, error) => {
				// Don't retry on NOT_FOUND or RATE_LIMITED
				if (isDefinedError(error)) return false;
				return failureCount < 2;
			},
		}),
	);
}
