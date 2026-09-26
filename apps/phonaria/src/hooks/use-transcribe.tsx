"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useTransition,
} from "react";
import { type TranscribeWordsFn, useG2PStore } from "@/lib/transcription/g2p-store";
import type { ChooseSpellingInContextFn } from "@/lib/transcription/spelling-context";

interface TranscriptionServices {
	transcribeWords: TranscribeWordsFn;
	chooseSpellingInContext?: ChooseSpellingInContextFn;
}

const TranscriptionServicesContext = createContext<TranscriptionServices | null>(null);

export function TranscriptionProvider({
	transcribeWords,
	chooseSpellingInContext,
	children,
}: TranscriptionServices & { children: ReactNode }) {
	const services = useMemo(
		() => ({ transcribeWords, chooseSpellingInContext }),
		[transcribeWords, chooseSpellingInContext],
	);
	return (
		<TranscriptionServicesContext.Provider value={services}>
			{children}
		</TranscriptionServicesContext.Provider>
	);
}

function useTranscriptionServices(): TranscriptionServices {
	const services = useContext(TranscriptionServicesContext);
	if (!services) {
		throw new Error("useTranscribe must be used within TranscriptionProvider");
	}
	return services;
}

/**
 * Thin wrapper over the store's `transcribe`, which owns the shared result and
 * error state; each caller keeps its own `isPending`. The server adapters are
 * injected by the route-level provider.
 */
export function useTranscribe() {
	const [isPending, startTransition] = useTransition();
	const transcribe = useG2PStore((s) => s.transcribe);
	const lastText = useG2PStore((s) => s.lastText);
	const acceptSpellingSuggestionOnStore = useG2PStore((s) => s.acceptSpellingSuggestion);
	const { transcribeWords, chooseSpellingInContext } = useTranscriptionServices();
	const spelling = useMemo(
		() => ({ chooseInContext: chooseSpellingInContext }),
		[chooseSpellingInContext],
	);

	const mutate = useCallback(
		(input: { text: string }) => {
			startTransition(async () => {
				await transcribe(input.text, transcribeWords, undefined, spelling);
			});
		},
		[transcribe, transcribeWords, spelling],
	);

	const retry = useCallback(() => {
		if (lastText) mutate({ text: lastText });
		else console.error("transcription: retry with no text to replay");
	}, [lastText, mutate]);

	const acceptSpellingSuggestion = useCallback(() => {
		startTransition(async () => {
			await acceptSpellingSuggestionOnStore(transcribeWords, undefined, spelling);
		});
	}, [acceptSpellingSuggestionOnStore, transcribeWords, spelling]);

	return { mutate, retry, acceptSpellingSuggestion, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
