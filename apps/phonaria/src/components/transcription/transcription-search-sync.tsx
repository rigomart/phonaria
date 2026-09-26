"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranscribe } from "@/hooks/use-transcribe";
import { useG2PStore } from "@/lib/transcription/g2p-store";
import {
	isSuppressedTranscriptionQuery,
	resolveTranscriptionSearchSync,
} from "@/lib/transcription/search";

/**
 * Mirrors `?q=` into the store. Runs in the browser only: the 10k word tier is
 * an empty stub in the Worker build, and the store is a module singleton that
 * would leak across requests if a loader or SSR pass transcribed.
 */
export function TranscriptionSearchSync({ query }: { query: string | undefined }) {
	const lastText = useG2PStore((state) => state.lastText);
	const resultShowing = useG2PStore(
		(state) => state.currentResult !== null || state.lookupError !== null || state.isTranscribing,
	);
	const setDraftText = useG2PStore((state) => state.setDraftText);
	const clearResult = useG2PStore((state) => state.clearResult);
	const { mutate } = useTranscribe();
	const dispatchedQuery = useRef<string | undefined>(undefined);
	const hasAligned = useRef(false);
	const alignedQuery = useRef<string | undefined>(undefined);

	useLayoutEffect(() => {
		if (isSuppressedTranscriptionQuery(query)) {
			hasAligned.current = true;
			alignedQuery.current = query;
			return;
		}

		// Draft is only an input when the URL's query changed. A later render
		// (the result landing, a lookup ending) must not snap an edit back.
		const queryChanged = !hasAligned.current || alignedQuery.current !== query;
		hasAligned.current = true;
		alignedQuery.current = query;

		const action = resolveTranscriptionSearchSync({
			q: query,
			lastText,
			resultShowing,
			draftText: queryChanged ? useG2PStore.getState().draftText : undefined,
		});
		if (action.type === "transcribe") {
			// A query that never becomes lastText (no tokens) must not be retried.
			if (dispatchedQuery.current === action.text) return;
			dispatchedQuery.current = action.text;
			setDraftText(action.text);
			mutate({ text: action.text });
			return;
		}

		dispatchedQuery.current = undefined;
		if (action.type === "restore-draft") {
			setDraftText(action.text);
			return;
		}
		if (action.type === "clear") clearResult();
	}, [clearResult, lastText, mutate, query, resultShowing, setDraftText]);

	return null;
}
