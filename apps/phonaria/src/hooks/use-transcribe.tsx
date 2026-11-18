import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useTransition,
} from "react";
import { type TranscribeWordsFn, useG2PStore } from "@/lib/transcription/g2p-store";

interface TranscriptionServices {
	transcribeWords: TranscribeWordsFn;
}

const TranscriptionServicesContext = createContext<TranscriptionServices | null>(null);

export function TranscriptionProvider({
	transcribeWords,
	children,
}: TranscriptionServices & { children: ReactNode }) {
	const services = useMemo(() => ({ transcribeWords }), [transcribeWords]);
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
	const { transcribeWords } = useTranscriptionServices();

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

	return { mutate, retry, isPending };
}

export function useCurrentTranscription() {
	const currentResult = useG2PStore((s) => s.currentResult);
	return { data: currentResult };
}
