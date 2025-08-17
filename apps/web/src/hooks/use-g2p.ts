/**
 * Custom hook for G2P (Grapheme-to-Phoneme) functionality using TanStack Query
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { transcribeText } from "@/lib/g2p-client";
import type { TranscriptionResult } from "@/types/g2p";

/**
 * Query keys for G2P operations
 */
export const g2pQueryKeys = {
	all: ["g2p"] as const,
	transcription: (text: string) => ["g2p", "transcription", text] as const,
};

/**
 * Hook for managing G2P transcription with TanStack Query
 */
export function useG2P() {
	const queryClient = useQueryClient();

	const transcribeMutation = useMutation({
		mutationFn: async (text: string): Promise<TranscriptionResult> => {
			if (!text.trim()) {
				throw new Error("Please enter some text to transcribe");
			}
			return transcribeText(text.trim());
		},
		onSuccess: (data, text) => {
			// Cache the successful transcription
			queryClient.setQueryData(g2pQueryKeys.transcription(text), data);
			toast.success("Text transcribed successfully!");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof ApiError
					? error.message
					: error instanceof Error
						? error.message
						: "Failed to transcribe text";

			toast.error(`Transcription failed: ${errorMessage}`);
		},
	});

	const clear = () => {
		// Clear the mutation state
		transcribeMutation.reset();
		// Optionally clear all cached transcriptions
		queryClient.removeQueries({ queryKey: g2pQueryKeys.all });
	};

	return {
		// State mapping from mutation to our custom state names
		state: transcribeMutation.isPending
			? "loading"
			: transcribeMutation.isError
				? "error"
				: transcribeMutation.isSuccess
					? "success"
					: "idle",

		// Result and error from mutation
		result: transcribeMutation.data || null,
		error: transcribeMutation.error
			? transcribeMutation.error instanceof ApiError
				? transcribeMutation.error.message
				: transcribeMutation.error instanceof Error
					? transcribeMutation.error.message
					: "An unknown error occurred"
			: null,

		// Actions
		transcribe: transcribeMutation.mutate,
		transcribeAsync: transcribeMutation.mutateAsync,
		clear,

		// Additional mutation state for advanced usage
		isPending: transcribeMutation.isPending,
		isError: transcribeMutation.isError,
		isSuccess: transcribeMutation.isSuccess,
		isIdle: transcribeMutation.isIdle,
	};
}

/**
 * Hook to get cached transcription result without triggering a new request
 */
export function useCachedTranscription(text: string) {
	const queryClient = useQueryClient();

	return queryClient.getQueryData<TranscriptionResult>(g2pQueryKeys.transcription(text));
}

/**
 * Hook to invalidate and refresh G2P cache
 */
export function useInvalidateG2P() {
	const queryClient = useQueryClient();

	return {
		invalidateAll: () => queryClient.invalidateQueries({ queryKey: g2pQueryKeys.all }),
		invalidateTranscription: (text: string) =>
			queryClient.invalidateQueries({ queryKey: g2pQueryKeys.transcription(text) }),
		clearCache: () => queryClient.removeQueries({ queryKey: g2pQueryKeys.all }),
	};
}
