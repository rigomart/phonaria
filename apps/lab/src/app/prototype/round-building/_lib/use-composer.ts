"use client";

/**
 * PROTOTYPE ONLY — throwaway.
 *
 * The composer's behaviour, with no opinion about layout. Every variant shares
 * this hook and renders its own field and palette, so a variant is free to throw
 * out the entire arrangement without reimplementing search or commit.
 */

import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { type KeyboardEvent, useState } from "react";
import { searchKeys } from "./palette";

const MAX_MATCHES = 5;

export interface Composer {
	query: string;
	setQuery: (value: string) => void;
	matches: ReturnType<typeof searchKeys>;
	highlight: number;
	setHighlight: (index: number) => void;
	commit: (id: EnglishPhonemeSymbolId) => void;
	onFieldKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

interface UseComposerOptions {
	onAppend: (id: EnglishPhonemeSymbolId) => void;
	onRemoveLast: () => void;
}

export function useComposer({ onAppend, onRemoveLast }: UseComposerOptions): Composer {
	const [query, setQueryState] = useState("");
	const [highlight, setHighlight] = useState(0);

	const matches = searchKeys(query).slice(0, MAX_MATCHES);

	function setQuery(value: string) {
		setQueryState(value);
		setHighlight(0);
	}

	function commit(id: EnglishPhonemeSymbolId) {
		onAppend(id);
		setQueryState("");
		setHighlight(0);
	}

	function onFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Backspace" && query === "") {
			onRemoveLast();
			return;
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setHighlight(Math.min(highlight + 1, matches.length - 1));
			return;
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			setHighlight(Math.max(highlight - 1, 0));
			return;
		}
		if (event.key === "Enter" && matches[highlight]) {
			event.preventDefault();
			commit(matches[highlight].id);
			return;
		}
		if (event.key === "Escape") setQueryState("");
	}

	return { query, setQuery, matches, highlight, setHighlight, commit, onFieldKeyDown };
}
