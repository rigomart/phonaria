import { create } from "zustand";

/**
 * Recent transcriptions, kept in this browser only. An entry holds the text and
 * an IPA preview, not the result: reopening one re-submits the text, so it
 * always reflects the current word lists.
 */
export const TRANSCRIPTION_HISTORY_LIMIT = 50;
export const TRANSCRIPTION_HISTORY_STORAGE_KEY = "transcription-history";
const STORAGE_VERSION = 1;

export interface TranscriptionHistoryEntry {
	text: string;
	ipa: string;
	/** Epoch milliseconds of the latest time this text was transcribed. */
	at: number;
}

/** "Hello  World" and "hello world" are the same entry. */
export function historyEntryKey(text: string): string {
	return text.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Newest first. A repeat moves to the top instead of adding a copy. */
export function addHistoryEntry(
	entries: readonly TranscriptionHistoryEntry[],
	entry: TranscriptionHistoryEntry,
	limit = TRANSCRIPTION_HISTORY_LIMIT,
): TranscriptionHistoryEntry[] {
	const key = historyEntryKey(entry.text);
	const rest = entries.filter((existing) => historyEntryKey(existing.text) !== key);
	return [entry, ...rest].slice(0, limit);
}

export function removeHistoryEntry(
	entries: readonly TranscriptionHistoryEntry[],
	text: string,
): TranscriptionHistoryEntry[] {
	const key = historyEntryKey(text);
	return entries.filter((entry) => historyEntryKey(entry.text) !== key);
}

function isHistoryEntry(value: unknown): value is TranscriptionHistoryEntry {
	if (typeof value !== "object" || value === null) return false;
	const entry = value as Record<string, unknown>;
	return (
		typeof entry.text === "string" &&
		entry.text.trim().length > 0 &&
		typeof entry.ipa === "string" &&
		typeof entry.at === "number" &&
		Number.isFinite(entry.at)
	);
}

/**
 * Anything unreadable — corrupt JSON, another version, a hand edit — reads as
 * an empty history rather than an error. Invalid entries are dropped one by one.
 */
export function parseStoredHistory(raw: string | null): TranscriptionHistoryEntry[] {
	if (!raw) return [];
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return [];
	}
	if (typeof parsed !== "object" || parsed === null) return [];
	const { version, entries } = parsed as Record<string, unknown>;
	if (version !== STORAGE_VERSION || !Array.isArray(entries)) return [];

	const history: TranscriptionHistoryEntry[] = [];
	const seen = new Set<string>();
	for (const entry of entries) {
		if (!isHistoryEntry(entry)) continue;
		// Keep stored order; a later repeat is dropped.
		const key = historyEntryKey(entry.text);
		if (seen.has(key)) continue;
		seen.add(key);
		history.push({ text: entry.text, ipa: entry.ipa, at: entry.at });
	}
	return history.slice(0, TRANSCRIPTION_HISTORY_LIMIT);
}

export function serializeHistory(entries: readonly TranscriptionHistoryEntry[]): string {
	return JSON.stringify({ version: STORAGE_VERSION, entries });
}

/**
 * `null` means storage is unavailable (server, private mode, blocked site
 * data), which is different from an empty history.
 */
function readStoredHistory(): TranscriptionHistoryEntry[] | null {
	try {
		return parseStoredHistory(globalThis.localStorage.getItem(TRANSCRIPTION_HISTORY_STORAGE_KEY));
	} catch {
		return null;
	}
}

function writeStoredHistory(entries: readonly TranscriptionHistoryEntry[]) {
	try {
		if (entries.length === 0) {
			globalThis.localStorage.removeItem(TRANSCRIPTION_HISTORY_STORAGE_KEY);
		} else {
			globalThis.localStorage.setItem(TRANSCRIPTION_HISTORY_STORAGE_KEY, serializeHistory(entries));
		}
	} catch (error) {
		// Quota or blocked storage: the history still works for this page view.
		console.warn("transcription history: could not save", error);
	}
}

interface TranscriptionHistoryStore {
	entries: TranscriptionHistoryEntry[];
	/** Re-reads storage. Call from an effect so the server render never depends on it. */
	load: () => void;
	record: (entry: TranscriptionHistoryEntry) => void;
	remove: (text: string) => void;
	clear: () => void;
}

/**
 * Every write starts from what is stored, not from memory, so another tab's
 * entries are kept. Memory is the fallback when storage cannot be read.
 */
export const useTranscriptionHistoryStore = create<TranscriptionHistoryStore>((set, get) => {
	const update = (
		change: (entries: TranscriptionHistoryEntry[]) => TranscriptionHistoryEntry[],
	) => {
		const next = change(readStoredHistory() ?? get().entries);
		writeStoredHistory(next);
		set({ entries: next });
	};

	return {
		entries: [],
		load: () => {
			const stored = readStoredHistory();
			if (stored) set({ entries: stored });
		},
		record: (entry) => update((entries) => addHistoryEntry(entries, entry)),
		remove: (text) => update((entries) => removeHistoryEntry(entries, text)),
		clear: () => update(() => []),
	};
});
