"use client";

import { useEffect } from "react";
import { extractIpaText } from "@/lib/ipa-copy";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import {
	TRANSCRIPTION_HISTORY_STORAGE_KEY,
	useTranscriptionHistoryStore,
} from "@/lib/transcription/history";

/**
 * Saves each transcription that lands. A spelling suggestion or a variant pick
 * replaces `currentResult` but keeps its `timestamp`, so only a new lookup
 * counts. Runs in an effect: the G2P store is a module singleton on the server.
 */
export function useRecordTranscriptionHistory() {
	const record = useTranscriptionHistoryStore((state) => state.record);

	useEffect(
		() =>
			useG2PStore.subscribe((state, previous) => {
				const result = state.currentResult;
				if (!result || result.timestamp === previous.currentResult?.timestamp) return;
				record({
					text: result.originalText,
					ipa: extractIpaText(result, state.selectedVariants),
					at: Date.now(),
				});
			}),
		[record],
	);
}

/** Reads the stored history after hydration and follows changes from other tabs. */
export function useTranscriptionHistory() {
	const entries = useTranscriptionHistoryStore((state) => state.entries);
	const loaded = useTranscriptionHistoryStore((state) => state.loaded);
	const load = useTranscriptionHistoryStore((state) => state.load);
	const remove = useTranscriptionHistoryStore((state) => state.remove);
	const clear = useTranscriptionHistoryStore((state) => state.clear);

	useEffect(() => {
		load();
		const handleStorage = (event: StorageEvent) => {
			// `key` is null when another tab clears all storage.
			if (event.key === null || event.key === TRANSCRIPTION_HISTORY_STORAGE_KEY) load();
		};
		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, [load]);

	return { entries, loaded, remove, clear };
}
