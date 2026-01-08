"use client";

import { useEffect, useState, useTransition } from "react";
import { lookupDictionaryAction } from "../_actions/dictionary";
import type { WordDefinition } from "../_lib/dictionary/model";

/**
 * Session-level cache for dictionary lookups.
 * Persists for the page lifecycle (SPA navigation), resets on full page reload.
 * "not_found" sentinel indicates we looked up the word but it wasn't in the dictionary.
 */
const sessionCache = new Map<string, WordDefinition | "not_found">();

export function useDictionary(word: string | null) {
	const [isPending, startTransition] = useTransition();
	const [data, setData] = useState<WordDefinition | null>(null);
	const [error, setError] = useState<{
		code: string;
		message: string;
		details?: unknown;
	} | null>(null);

	useEffect(() => {
		if (!word) {
			setData(null);
			setError(null);
			return;
		}

		const normalizedWord = word.trim().toLowerCase();

		// Check session cache first
		const cached = sessionCache.get(normalizedWord);
		if (cached !== undefined) {
			if (cached === "not_found") {
				setData(null);
				setError({ code: "NOT_FOUND", message: `No definition found for "${word}"` });
			} else {
				setData(cached);
				setError(null);
			}
			return;
		}

		startTransition(async () => {
			setError(null);
			const result = await lookupDictionaryAction({ word });

			// Wrap post-await state updates in a separate startTransition
			// so they are properly tracked as transition work
			startTransition(() => {
				if (result?.serverError) {
					// Cache "not found" errors to avoid repeated failed lookups
					if (result.serverError.code === "NOT_FOUND") {
						sessionCache.set(normalizedWord, "not_found");
					}
					setError(result.serverError);
					setData(null);
					return;
				}

				if (result?.data) {
					sessionCache.set(normalizedWord, result.data);
					setData(result.data);
				}
			});
		});
	}, [word]);

	return { data, isLoading: isPending, isError: !!error, error };
}
