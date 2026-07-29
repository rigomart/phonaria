"use client";

/** PROTOTYPE ONLY — throwaway. In-memory draft state, no persistence, no grading. */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { useCallback, useState } from "react";
import { ROUND_COUNT } from "./palette";

export type RoundDraft = EnglishPhonemeSymbolId[];

export function useSessionDraft() {
	const [drafts, setDrafts] = useState<RoundDraft[]>(() =>
		Array.from({ length: ROUND_COUNT }, () => []),
	);

	const mutate = useCallback((round: number, next: (draft: RoundDraft) => RoundDraft) => {
		setDrafts((current) => current.map((draft, i) => (i === round ? next(draft) : draft)));
	}, []);

	const append = useCallback(
		(round: number, id: EnglishPhonemeSymbolId) => mutate(round, (draft) => [...draft, id]),
		[mutate],
	);

	const removeLast = useCallback(
		(round: number) => mutate(round, (draft) => draft.slice(0, -1)),
		[mutate],
	);

	const removeAt = useCallback(
		(round: number, index: number) => mutate(round, (draft) => draft.filter((_, i) => i !== index)),
		[mutate],
	);

	const clear = useCallback((round: number) => mutate(round, () => []), [mutate]);

	const filledCount = drafts.filter((draft) => draft.length > 0).length;

	return { drafts, append, removeLast, removeAt, clear, filledCount };
}
