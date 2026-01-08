"use client";

import { useEffect, useState, useTransition } from "react";
import { lookupDictionaryAction } from "../_actions/dictionary";
import type { WordDefinition } from "../_lib/dictionary/model";

export function useDictionary(word: string | null) {
	const [isPending, startTransition] = useTransition();
	const [data, setData] = useState<WordDefinition | null>(null);
	const [error, setError] = useState<{ message: string } | null>(null);

	useEffect(() => {
		if (!word) {
			setData(null);
			setError(null);
			return;
		}

		startTransition(async () => {
			setError(null);
			const result = await lookupDictionaryAction({ word });

			if (result?.serverError) {
				setError(result.serverError);
				setData(null);
				return;
			}

			if (result?.data) {
				setData(result.data);
			}
		});
	}, [word]);

	return { data, isLoading: isPending, isError: !!error, error };
}
