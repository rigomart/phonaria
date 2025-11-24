import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transcribeText } from "../_lib/g2p-client";
import { useG2PStore } from "../_store/g2p-store";
import type { TranscriptionResult } from "../_types/g2p";

export function useTranscribe() {
	const queryClient = useQueryClient();
	const resetVariants = useG2PStore((s) => s.resetVariants);

	return useMutation({
		mutationFn: async (text: string) => {
			const trimmed = text.trim();
			if (!trimmed) {
				throw new Error("Please enter some text to transcribe");
			}
			return transcribeText(trimmed);
		},
		onSuccess: (data: TranscriptionResult) => {
			queryClient.setQueryData(["g2p", "current"], data);
			resetVariants(data.words.length);
		},
		onError: (error: unknown) => {
			const message = error instanceof Error ? error.message : "Failed to transcribe text";
			toast.error(`Transcription failed: ${message}`);
		},
	});
}

export function useCurrentTranscription() {
	return useQuery<TranscriptionResult | null>({
		queryKey: ["g2p", "current"],
		queryFn: async () => null,
		staleTime: Infinity,
	});
}
