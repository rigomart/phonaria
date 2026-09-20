"use client";

import { createContext, type ReactNode, useCallback, useContext, useTransition } from "react";
import { type TranscribeWordsFn, useG2PStore } from "@/lib/transcription/g2p-store";

const TranscriptionFnContext = createContext<TranscribeWordsFn | null>(null);

export function TranscriptionProvider({
	transcribeWords,
	children,
}: {
	transcribeWords: TranscribeWordsFn;
	children: ReactNode;
}) {
	return (
		<TranscriptionFnContext.Provider value={transcribeWords}>
			{children}
		</TranscriptionFnContext.Provider>
	);
}

function useTranscribeWordsFn(): TranscribeWordsFn {
	const transcribeWords = useContext(TranscriptionFnContext);
	if (!transcribeWords) {
		throw new Error("useTranscribe must be used within TranscriptionProvider");
	}
	return transcribeWords;
}

/**
 * Thin wrapper over the store's `transcribe`, which owns the shared result and
 * error state; each caller keeps its own `isPending`. The server adapter is
 * injected by the route-level provider (Next server action or Start function).
 */
export function useTranscribe() {
	const [isPending, startTransition] = useTransition();
	const transcribe = useG2PStore((s) => s.transcribe);
	const lastText = useG2PStore((s) => s.lastText);
	const acceptSpellingSuggestionOnStore = useG2PStore((s) => s.acceptSpellingSuggestion);
	const transcribeWords = useTranscribeWordsFn();

	const mutate = useCallback(
		(input: { text: string }) => {
			startTransition(async () => {
				await transcribe(input.text, transcribeWords);
			});
		},
		[transcribe, transcribeWords],
	);

	const retry = useCallback(() => {
		if (lastText) mutate({ text: lastText });
		else console.error("transcription: retry with no text to replay");
	}, [lastText, mutate]);

	const acceptSpellingSuggestion = useCallback(() => {
		startTransition(async () => {
			await acceptSpellingSuggestionOnStore(transcribeWords);
		});
	}, [acceptSpellingSuggestionOnStore, transcribeWords]);

	return { mutate, retry, acceptSpellingSuggestion, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
