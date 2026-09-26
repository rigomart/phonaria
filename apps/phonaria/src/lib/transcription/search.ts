/**
 * Home-route search for transcription. `q` is the submitted text.
 *
 * TanStack Router merges this result onto the parsed search, so `q` is always
 * returned. An omitted key would leave a blank `?q=` in place.
 */
export const TRANSCRIPTION_INPUT_MAX_LENGTH = 200;

export type TranscriptionSearch = {
	q?: string;
};

export type TranscriptionSearchSyncAction =
	| { type: "transcribe"; text: string }
	| { type: "restore-draft"; text: string }
	| { type: "clear" }
	| { type: "none" };

/**
 * The query Clear has just dropped. The URL can lag one render behind the
 * store; without this, that render looks like a fresh `?q=` load and starts
 * the lookup again.
 */
let suppressedQuery: string | undefined;

export function normalizeTranscriptionQuery(value: unknown): string | undefined {
	if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
		return undefined;
	}
	const text = String(value).trim().slice(0, TRANSCRIPTION_INPUT_MAX_LENGTH);
	return text.length === 0 ? undefined : text;
}

export function validateTranscriptionSearch(search: Record<string, unknown>): TranscriptionSearch {
	return { q: normalizeTranscriptionQuery(search.q) };
}

/**
 * URL → store. The same `q` as `lastText` does not look the text up again.
 * Pass `draftText` when the query just changed (including the first pass): a
 * draft that drifted from that `q` is restored, and a missing `q` clears a
 * draft even when the text never became a transcription (punctuation only).
 * Omit `draftText` on later renders so an in-progress edit is left alone.
 */
export function resolveTranscriptionSearchSync(input: {
	q: string | undefined;
	lastText: string | null;
	resultShowing: boolean;
	draftText?: string;
}): TranscriptionSearchSyncAction {
	if (input.q !== undefined && input.q !== input.lastText) {
		return { type: "transcribe", text: input.q };
	}
	if (input.q !== undefined && input.draftText !== undefined && input.draftText !== input.q) {
		return { type: "restore-draft", text: input.q };
	}
	const draftLeftBehind = input.draftText !== undefined && input.draftText.length > 0;
	if (
		input.q === undefined &&
		(input.resultShowing || input.lastText !== null || draftLeftBehind)
	) {
		return { type: "clear" };
	}
	return { type: "none" };
}

/** Examples stay hidden while a shared `?q=` is waiting to run or still in flight. */
export function shouldShowTranscriptionEmptyState(input: {
	q: string | undefined;
	hasResult: boolean;
	hasError: boolean;
}): boolean {
	return input.q === undefined && !input.hasResult && !input.hasError;
}

export function suppressActiveTranscriptionQuery(query: string | undefined) {
	suppressedQuery = query;
}

export function isSuppressedTranscriptionQuery(query: string | undefined): boolean {
	if (suppressedQuery === undefined) return false;
	if (query === suppressedQuery) return true;
	suppressedQuery = undefined;
	return false;
}

export function resetTranscriptionQuerySuppression() {
	suppressedQuery = undefined;
}
