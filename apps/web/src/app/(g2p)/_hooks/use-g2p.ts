import { useState, useTransition } from "react";
import { toast } from "sonner";
import { transcribeText } from "@/app/(g2p)/_lib/g2p-client";
import type { TranscriptionResult } from "@/app/(g2p)/_types/g2p";
import { ApiError } from "@/lib/api-client";

/**
 * Hook for managing G2P transcription with React state
 */
export function useG2P() {
	const [result, setResult] = useState<TranscriptionResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const transcribe = (text: string) => {
		if (!text.trim()) {
			setError("Please enter some text to transcribe");
			toast.error("Please enter some text to transcribe");
			return;
		}

		setError(null);

		startTransition(async () => {
			try {
				const transcriptionResult = await transcribeText(text.trim());
				setResult(transcriptionResult);
				toast.success("Text transcribed successfully!");
			} catch (error) {
				const errorMessage =
					error instanceof ApiError
						? error.message
						: error instanceof Error
							? error.message
							: "Failed to transcribe text";

				setError(errorMessage);
				setResult(null);
				toast.error(`Transcription failed: ${errorMessage}`);
			}
		});
	};

	const clear = () => {
		setResult(null);
		setError(null);
	};

	return {
		// State mapping
		state: isPending ? "loading" : error ? "error" : result ? "success" : "idle",

		// Result and error
		result,
		error,

		// Actions
		transcribe,

		// Clear function
		clear,

		// Additional state for advanced usage
		isPending,
	};
}

// Note: Additional caching hooks removed as we're using React state for simplicity
// If you need advanced caching features, consider adding TanStack Query back
