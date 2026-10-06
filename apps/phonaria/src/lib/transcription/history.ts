import { getIpaForPhonemeId, getLanguagePhonemeIds } from "@phonaria/phonetics-data";
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

/** Case-insensitive match on the text or its IPA. A blank query keeps everything. */
export function filterHistory(
	entries: readonly TranscriptionHistoryEntry[],
	query: string,
): TranscriptionHistoryEntry[] {
	const needle = historyEntryKey(query);
	if (!needle) return [...entries];
	return entries.filter(
		(entry) => historyEntryKey(entry.text).includes(needle) || entry.ipa.includes(needle),
	);
}

/**
 * The sound-chip row appears once history is long enough to be worth scanning,
 * and it never offers more chips than fit in one wrapping row.
 */
export const HISTORY_SOUND_FILTER_MIN_ENTRIES = 10;
export const HISTORY_SOUND_FILTER_LIMIT = 8;

/** Stress marks, syllable dots (stored "." and displayed "·"), and spaces. */
const HISTORY_IPA_SEPARATORS = new Set([" ", ".", "·", "ˈ", "ˌ"]);

const historyIpaSymbols = getLanguagePhonemeIds("en-us").map((id) => getIpaForPhonemeId(id));
const historyIpaSymbolsLongestFirst = [...historyIpaSymbols].sort(
	(left, right) => right.length - left.length,
);
const historyIpaInventoryOrder = new Map(historyIpaSymbols.map((symbol, index) => [symbol, index]));

export type HistoryIpaSegment = { kind: "sound"; symbol: string } | { kind: "mark"; text: string };

/**
 * Splits a stored IPA string into en-us sounds and the marks between them.
 * Matching is longest-first, so each diphthong and affricate is one symbol.
 */
export function segmentHistoryIpa(ipa: string): HistoryIpaSegment[] {
	const segments: HistoryIpaSegment[] = [];
	let marks = "";
	let index = 0;

	const flushMarks = () => {
		if (marks.length === 0) return;
		segments.push({ kind: "mark", text: marks });
		marks = "";
	};

	while (index < ipa.length) {
		const character = ipa[index] ?? "";
		if (HISTORY_IPA_SEPARATORS.has(character)) {
			marks += character;
			index += 1;
			continue;
		}

		const rest = ipa.slice(index);
		const symbol = historyIpaSymbolsLongestFirst.find((candidate) => rest.startsWith(candidate));
		if (symbol) {
			flushMarks();
			segments.push({ kind: "sound", symbol });
			index += symbol.length;
			continue;
		}

		marks += character;
		index += 1;
	}

	flushMarks();
	return segments;
}

/** Sound symbols in order, with repeats. Marks are dropped. */
export function splitHistoryIpa(ipa: string): string[] {
	return segmentHistoryIpa(ipa).flatMap((segment) =>
		segment.kind === "sound" ? [segment.symbol] : [],
	);
}

/** Entries whose IPA contains `sound` as a whole en-us symbol. */
export function filterHistoryBySound(
	entries: readonly TranscriptionHistoryEntry[],
	sound: string,
): TranscriptionHistoryEntry[] {
	if (!sound) return [...entries];
	return entries.filter((entry) => splitHistoryIpa(entry.ipa).includes(sound));
}

/**
 * Sounds that show up in the most entries, at most {@link HISTORY_SOUND_FILTER_LIMIT}.
 * Each entry counts once per sound. Ties follow en-us inventory order.
 * Fewer than {@link HISTORY_SOUND_FILTER_MIN_ENTRIES} entries yield no chips.
 */
export function rankHistorySounds(entries: readonly TranscriptionHistoryEntry[]): string[] {
	if (entries.length < HISTORY_SOUND_FILTER_MIN_ENTRIES) return [];

	const counts = new Map<string, number>();
	for (const entry of entries) {
		for (const sound of new Set(splitHistoryIpa(entry.ipa))) {
			counts.set(sound, (counts.get(sound) ?? 0) + 1);
		}
	}

	return [...counts.entries()]
		.sort((left, right) => {
			const byCount = right[1] - left[1];
			if (byCount !== 0) return byCount;
			return (
				(historyIpaInventoryOrder.get(left[0]) ?? Number.MAX_SAFE_INTEGER) -
				(historyIpaInventoryOrder.get(right[0]) ?? Number.MAX_SAFE_INTEGER)
			);
		})
		.slice(0, HISTORY_SOUND_FILTER_LIMIT)
		.map(([sound]) => sound);
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
