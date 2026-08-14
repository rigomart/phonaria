"use client";

import { useCallback, useTransition } from "react";
import { transcribeWordsAction } from "../_actions/transcribe";
import { useG2PStore } from "../_store/g2p-store";

/**
 * Thin wrapper over the store's `transcribe`: the orchestration and its
 * staleness token live in the store so every caller (form, example chips,
 * Retry) shares one result and one error, while each keeps its own `isPending`.
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
		// Retry only ever renders alongside an error, which implies a submitted
		// text. Logging keeps a broken invariant from becoming a dead button.
		if (lastText) mutate({ text: lastText });
		else console.error("transcription: retry with no text to replay");
	}, [lastText, mutate]);

	return { mutate, retry, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
