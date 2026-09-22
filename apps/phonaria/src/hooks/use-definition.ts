"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DefinitionLookupOutput, DefinitionSenseGroup } from "@/lib/definition/contract";
import { lookupDefinitionDeduped } from "@/lib/definition/inflight";
import { lookupDefinitionFromStart } from "@/server/lookup-definition";

export type DefinitionViewStatus = "idle" | "loading" | "found" | "not_found" | "error";

export type DefinitionViewState =
	| { status: "idle" | "loading" | "not_found"; groups: []; errorMessage: null }
	| { status: "found"; groups: DefinitionSenseGroup[]; errorMessage: null }
	| { status: "error"; groups: []; errorMessage: string };

const IDLE: DefinitionViewState = { status: "idle", groups: [], errorMessage: null };
const LOADING: DefinitionViewState = { status: "loading", groups: [], errorMessage: null };
const NOT_FOUND: DefinitionViewState = { status: "not_found", groups: [], errorMessage: null };

function toViewState(result: DefinitionLookupOutput): DefinitionViewState {
	if (result.found) {
		return { status: "found", groups: result.groups, errorMessage: null };
	}
	return NOT_FOUND;
}

function errorState(error: unknown): DefinitionViewState {
	const message =
		error instanceof Error && error.message.trim().length > 0
			? error.message
			: "We couldn't load that definition. Please try again.";
	return { status: "error", groups: [], errorMessage: message };
}

async function fetchDefinition(word: string): Promise<DefinitionLookupOutput> {
	return lookupDefinitionDeduped(word, (normalized) =>
		lookupDefinitionFromStart({ word: normalized }),
	);
}

/**
 * Fetch a definition when `word` is set (popover open). In-flight requests for
 * the same normalized word are shared; completed results are not cached.
 */
export function useDefinition(word: string | null) {
	const [state, setState] = useState<DefinitionViewState>(IDLE);
	const requestIdRef = useRef(0);

	const load = useCallback((target: string) => {
		const requestId = ++requestIdRef.current;
		setState(LOADING);
		fetchDefinition(target)
			.then((result) => {
				if (requestIdRef.current === requestId) setState(toViewState(result));
			})
			.catch((error: unknown) => {
				if (requestIdRef.current === requestId) setState(errorState(error));
			});
	}, []);

	useEffect(() => {
		if (!word) {
			requestIdRef.current += 1;
			setState(IDLE);
			return;
		}

		load(word);
	}, [word, load]);

	const retry = useCallback(() => {
		if (word) load(word);
	}, [word, load]);

	return { ...state, retry };
}
