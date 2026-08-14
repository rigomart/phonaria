"use client";

import { useCallback, useTransition } from "react";
import { transcribeWordsAction } from "../_actions/transcribe";
import { useG2PStore } from "../_store/g2p-store";

/**
 * Thin wrapper over the store's `transcribe`, which owns the shared result and
 * error state; each caller keeps its own `isPending`.
 */
export function useTranscribe() {
	const [isPending, startTransition] = useTransition();
	const transcribe = useG2PStore((s) => s.transcribe);
	const lastText = useG2PStore((s) => s.lastText);

	const mutate = useCallback(
		(input: { text: string }) => {
			startTransition(async () => {
				await transcribe(input.text, transcribeWordsAction);
			});
		},
		[transcribe],
	);

	const retry = useCallback(() => {
		// `lastText` is always set while an error is showing; log if that breaks.
		if (lastText) mutate({ text: lastText });
		else console.error("transcription: retry with no text to replay");
	}, [lastText, mutate]);

	return { mutate, retry, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
