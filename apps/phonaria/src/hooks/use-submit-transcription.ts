"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import { useTranscribe } from "@/hooks/use-transcribe";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import {
	normalizeTranscriptionQuery,
	suppressActiveTranscriptionQuery,
} from "@/lib/transcription/search";

/**
 * Form submit, example chips, and spelling suggestions all land here.
 * A new query pushes a history entry. The same text leaves the URL alone and
 * runs the lookup directly, because the search effect will not see a change.
 */
export function useSubmitTranscription() {
	const { q } = useSearch({ from: "/" });
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
			void navigate({ to: "/", search: { q: next } });
		},
		[isTranscribing, mutate, navigate, q, setDraftText],
	);

	const clear = useCallback(() => {
		if (q !== undefined) suppressActiveTranscriptionQuery(q);
		clearResult();
		if (q !== undefined) {
			void navigate({ to: "/", search: { q: undefined } });
		}
	}, [clearResult, navigate, q]);

	// The transition that started a same-query rerun stays pending until that
	// request settles. Clear already drops the store flag, so the field follows
	// the store and becomes editable again immediately.
	return { submit, clear, isPending: isTranscribing };
}
