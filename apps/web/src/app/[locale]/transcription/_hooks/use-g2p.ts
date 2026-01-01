import { toastManager } from "@phonaria/ui/components/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isDefinedError, orpc } from "@/lib/orpc";
import { transformToTranscriptionResult } from "../_lib/g2p-client";
import { useG2PStore } from "../_store/g2p-store";
import type { TranscriptionResult } from "../_types/g2p";

export function useTranscribe() {
	const queryClient = useQueryClient();
	const resetVariants = useG2PStore((s) => s.resetVariants);

	return useMutation(
		orpc.g2p.transcribe.mutationOptions({
			onSuccess: (data, variables) => {
				const result = transformToTranscriptionResult(data, variables.text);
				queryClient.setQueryData(["g2p", "current"], result);
				resetVariants(result.words.length);
			},
			onError: (error) => {
				let message = "Failed to transcribe text";
				if (isDefinedError(error)) {
					message = error.message;
				} else if (error instanceof Error) {
					message = error.message;
				}
				toastManager.add({
					title: "Transcription failed",
					description: message,
					type: "error",
				});
			},
		}),
	);
}

export function useCurrentTranscription() {
	return useQuery<TranscriptionResult | null>({
		queryKey: ["g2p", "current"],
		queryFn: async () => null,
		staleTime: Infinity,
	});
}
