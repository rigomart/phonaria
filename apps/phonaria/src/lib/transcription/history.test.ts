import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	addHistoryEntry,
	parseStoredHistory,
	removeHistoryEntry,
	serializeHistory,
	TRANSCRIPTION_HISTORY_LIMIT,
	TRANSCRIPTION_HISTORY_STORAGE_KEY,
	type TranscriptionHistoryEntry,
	useTranscriptionHistoryStore,
} from "./history";

function entry(text: string, at = 1): TranscriptionHistoryEntry {
	return { text, ipa: `ipa of ${text}`, at };
}

function memoryStorage(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
		removeItem: (key: string) => {
			values.delete(key);
		},
		values,
	};
}

describe("addHistoryEntry", () => {
	it("puts the newest entry first", () => {
		const entries = addHistoryEntry([entry("hello")], entry("world", 2));
		expect(entries.map((e) => e.text)).toEqual(["world", "hello"]);
	});

	it("moves a repeat to the top instead of adding a copy, ignoring case and spacing", () => {
		const entries = addHistoryEntry(
			[entry("rhythm"), entry("Hello  world"), entry("thorough")],
			entry("hello world", 9),
		);
		expect(entries).toEqual([entry("hello world", 9), entry("rhythm"), entry("thorough")]);
	});

	it("drops the oldest entries past the limit", () => {
		let entries: TranscriptionHistoryEntry[] = [];
		for (let i = 0; i < TRANSCRIPTION_HISTORY_LIMIT + 5; i += 1) {
			entries = addHistoryEntry(entries, entry(`word ${i}`, i));
		}
		expect(entries).toHaveLength(TRANSCRIPTION_HISTORY_LIMIT);
		expect(entries[0]?.text).toBe(`word ${TRANSCRIPTION_HISTORY_LIMIT + 4}`);
		expect(entries.at(-1)?.text).toBe("word 5");
	});
});

describe("removeHistoryEntry", () => {
	it("removes the matching entry only", () => {
		expect(removeHistoryEntry([entry("Hello"), entry("world")], "hello")).toEqual([entry("world")]);
	});
});

describe("parseStoredHistory", () => {
	it("round-trips serialized history", () => {
		const entries = [entry("hello", 2), entry("world", 1)];
		expect(parseStoredHistory(serializeHistory(entries))).toEqual(entries);
	});

	it.each([
		["nothing stored", null],
		["corrupt JSON", "{not json"],
		["another version", JSON.stringify({ version: 99, entries: [entry("hello")] })],
		["a bare array", JSON.stringify([entry("hello")])],
		["entries that are not a list", JSON.stringify({ version: 1, entries: "hello" })],
	])("reads %s as empty", (_label, raw) => {
		expect(parseStoredHistory(raw)).toEqual([]);
	});

	it("drops invalid and repeated entries, keeps stored order, and strips extra fields", () => {
		const raw = JSON.stringify({
			version: 1,
			entries: [
				{ ...entry("hello", 3), extra: true },
				{ text: "   ", ipa: "", at: 2 },
				{ text: "missing ipa", at: 2 },
				{ text: "bad time", ipa: "", at: "yesterday" },
				entry("HELLO", 1),
				entry("world", 1),
			],
		});
		expect(parseStoredHistory(raw)).toEqual([entry("hello", 3), entry("world", 1)]);
	});

	it("enforces the limit on stored history", () => {
		const entries = Array.from({ length: TRANSCRIPTION_HISTORY_LIMIT + 10 }, (_, i) =>
			entry(`word ${i}`),
		);
		const raw = JSON.stringify({ version: 1, entries });
		expect(parseStoredHistory(raw)).toHaveLength(TRANSCRIPTION_HISTORY_LIMIT);
	});
});

describe("useTranscriptionHistoryStore", () => {
	beforeEach(() => {
		useTranscriptionHistoryStore.setState({ entries: [] });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("loads what is stored", () => {
		const storage = memoryStorage({
			[TRANSCRIPTION_HISTORY_STORAGE_KEY]: serializeHistory([entry("hello")]),
		});
		vi.stubGlobal("localStorage", storage);

		useTranscriptionHistoryStore.getState().load();

		expect(useTranscriptionHistoryStore.getState().entries).toEqual([entry("hello")]);
	});

	it("keeps another tab's entries when recording", () => {
		const storage = memoryStorage();
		vi.stubGlobal("localStorage", storage);
		useTranscriptionHistoryStore.getState().load();
		// Another tab writes after this one loaded.
		storage.setItem(TRANSCRIPTION_HISTORY_STORAGE_KEY, serializeHistory([entry("other tab")]));

		useTranscriptionHistoryStore.getState().record(entry("this tab", 2));

		const expected = [entry("this tab", 2), entry("other tab")];
		expect(useTranscriptionHistoryStore.getState().entries).toEqual(expected);
		expect(parseStoredHistory(storage.getItem(TRANSCRIPTION_HISTORY_STORAGE_KEY))).toEqual(
			expected,
		);
	});

	it("removes and clears, dropping the key when empty", () => {
		const storage = memoryStorage();
		vi.stubGlobal("localStorage", storage);
		const { record, remove, clear } = useTranscriptionHistoryStore.getState();

		record(entry("hello"));
		record(entry("world", 2));
		remove("hello");
		expect(useTranscriptionHistoryStore.getState().entries).toEqual([entry("world", 2)]);

		clear();
		expect(useTranscriptionHistoryStore.getState().entries).toEqual([]);
		expect(storage.values.has(TRANSCRIPTION_HISTORY_STORAGE_KEY)).toBe(false);
	});

	it("keeps working in memory when storage throws", () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.stubGlobal("localStorage", {
			getItem: () => {
				throw new Error("SecurityError");
			},
			setItem: () => {
				throw new Error("QuotaExceededError");
			},
			removeItem: () => {
				throw new Error("SecurityError");
			},
		});
		const { load, record } = useTranscriptionHistoryStore.getState();

		load();
		record(entry("hello"));
		record(entry("world", 2));

		expect(useTranscriptionHistoryStore.getState().entries).toEqual([
			entry("world", 2),
			entry("hello"),
		]);
	});
});
