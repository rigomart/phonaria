import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import { useTranscribe } from "@/hooks/use-transcribe";
import { SEARCH_PATH } from "@/lib/home-metadata";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import {
	normalizeTranscriptionQuery,
	suppressActiveTranscriptionQuery,
} from "@/lib/transcription/search";

/**
 * Form submit, example chips, and spelling suggestions all land here.
 * A new query opens /search?q= and pushes a history entry. The same text
 * leaves the URL alone and runs the lookup directly, because the search effect
 * will not see a change.
 */
export function useSubmitTranscription() {
	const { q } = useSearch({ strict: false });
	const navigate = useNavigate();
	const { mutate } = useTranscribe();
	const setDraftText = useG2PStore((state) => state.setDraftText);
	const clearResult = useG2PStore((state) => state.clearResult);
	const isTranscribing = useG2PStore((state) => state.isTranscribing);

	const submit = useCallback(
		(text: string) => {
			const next = normalizeTranscriptionQuery(text);
			if (!next || isTranscribing) return;
			setDraftText(next);
			if (next === q) {
				mutate({ text: next });
				return;
			}
			void navigate({ to: SEARCH_PATH, search: { q: next } });
		},
		[isTranscribing, mutate, navigate, q, setDraftText],
	);

	/**
	 * Empties the field; the result stays until the next search. A lookup still
	 * running is dropped instead, so a slow one can't keep the field disabled.
	 */
	const clear = useCallback(() => {
		if (!isTranscribing) {
			setDraftText("");
			return;
		}
		if (q !== undefined) suppressActiveTranscriptionQuery(q);
		clearResult();
	}, [clearResult, isTranscribing, q, setDraftText]);

	// The transition that started a same-query rerun stays pending until that
	// request settles. Clear already drops the store flag, so the field follows
	// the store and becomes editable again immediately.
	return { submit, clear, isPending: isTranscribing };
}
