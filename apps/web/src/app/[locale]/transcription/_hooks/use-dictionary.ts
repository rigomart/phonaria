"use client";

import { useQuery } from "@tanstack/react-query";
import { lookupDictionaryAction } from "../_actions/dictionary";

/**
 * Hook to look up dictionary definitions.
 * Uses TanStack Query for client-side caching and race condition handling.
 * Server-side caching is handled by unstable_cache in the service layer (24h TTL).
 */
export function useDictionary(word: string | null) {
	const normalizedWord = word?.trim().toLowerCase() ?? "";

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["dictionary", normalizedWord],
		queryFn: async () => {
			const result = await lookupDictionaryAction({ word: normalizedWord });

			if (result?.serverError) {
				throw new Error(result.serverError.message);
			}

			return result?.data ?? null;
		},
		enabled: normalizedWord.length > 0,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return { data: data ?? null, isLoading, isError, error };
}
