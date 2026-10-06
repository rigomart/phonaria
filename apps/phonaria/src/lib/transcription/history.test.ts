import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	addHistoryEntry,
	filterHistory,
	filterHistoryBySound,
	HISTORY_SOUND_FILTER_MIN_ENTRIES,
	parseStoredHistory,
	rankHistorySounds,
	removeHistoryEntry,
	serializeHistory,
	splitHistoryIpa,
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

describe("filterHistory", () => {
	const entries = [
		{ text: "Judge the rhythm", ipa: "ˈdʒʌdʒ ðə ˈɹɪ.ðəm", at: 3 },
		{ text: "thorough", ipa: "ˈθɝ.oʊ", at: 2 },
		{ text: "Hello world", ipa: "hə.ˈloʊ ˈwɝld", at: 1 },
	];

	it("keeps everything for a blank query", () => {
		expect(filterHistory(entries, "  ")).toEqual(entries);
	});

	it("matches text ignoring case and spacing, in stored order", () => {
		expect(filterHistory(entries, "  HELLO   wor").map((e) => e.text)).toEqual(["Hello world"]);
		expect(filterHistory(entries, "th").map((e) => e.text)).toEqual([
			"Judge the rhythm",
			"thorough",
		]);
	});

	it("matches IPA", () => {
		expect(filterHistory(entries, "oʊ").map((e) => e.text)).toEqual(["thorough", "Hello world"]);
	});
});

describe("splitHistoryIpa", () => {
	it("splits ˈskwɝ.əl into s, k, w, ɝ, ə, l", () => {
		expect(splitHistoryIpa("ˈskwɝ.əl")).toEqual(["s", "k", "w", "ɝ", "ə", "l"]);
	});

	it("splits ˈðoʊ into ð and oʊ", () => {
		const sounds = splitHistoryIpa("ˈðoʊ");
		expect(sounds).toEqual(["ð", "oʊ"]);
		expect(sounds).not.toContain("ʊ");
	});

	it("keeps affricates whole and skips stress, dots, and spaces", () => {
		expect(splitHistoryIpa("dʒ")).toEqual(["dʒ"]);
		expect(splitHistoryIpa("hə.ˈloʊ ˈwɝld")).toEqual(["h", "ə", "l", "oʊ", "w", "ɝ", "l", "d"]);
	});
});

describe("filterHistoryBySound", () => {
	const entries = [
		{ text: "though", ipa: "ˈðoʊ", at: 2 },
		{ text: "book", ipa: "bʊk", at: 1 },
	];

	it("matches a whole symbol", () => {
		expect(filterHistoryBySound(entries, "oʊ").map((entry) => entry.text)).toEqual(["though"]);
		expect(filterHistoryBySound(entries, "ʊ").map((entry) => entry.text)).toEqual(["book"]);
	});

	it("keeps everything when no sound is selected", () => {
		expect(filterHistoryBySound(entries, "")).toEqual(entries);
	});
});

describe("rankHistorySounds", () => {
	it("returns no chips below 10 entries", () => {
		const entries = Array.from({ length: HISTORY_SOUND_FILTER_MIN_ENTRIES - 1 }, (_, index) => ({
			text: `word ${index}`,
			ipa: "pə",
			at: index,
		}));
		expect(rankHistorySounds(entries)).toEqual([]);
	});

	it("counts each entry once per sound", () => {
		const entries = [
			{ text: "a", ipa: "ppp", at: 10 },
			{ text: "b", ipa: "p", at: 9 },
			{ text: "c", ipa: "b", at: 8 },
			{ text: "d", ipa: "b", at: 7 },
			{ text: "e", ipa: "b", at: 6 },
			{ text: "f", ipa: "ə", at: 5 },
			{ text: "g", ipa: "ə", at: 4 },
			{ text: "h", ipa: "ə", at: 3 },
			{ text: "i", ipa: "ə", at: 2 },
			{ text: "j", ipa: "ə", at: 1 },
		];
		expect(rankHistorySounds(entries)).toEqual(["ə", "b", "p"]);
	});

	it("returns at most 8 sounds and breaks ties by inventory order", () => {
		const ranked = [
			["ə", 10],
			["p", 9],
			["b", 8],
			["t", 7],
			["d", 6],
			["k", 5],
			["f", 4],
			["v", 3],
			["θ", 3],
			["s", 1],
		] as const;
		const entries = Array.from({ length: HISTORY_SOUND_FILTER_MIN_ENTRIES }, (_, index) => ({
			text: `word ${index}`,
			ipa: ranked
				.filter(([, count]) => index < count)
				.map(([symbol]) => symbol)
				.join(""),
			at: HISTORY_SOUND_FILTER_MIN_ENTRIES - index,
		}));

		expect(rankHistorySounds(entries)).toEqual(["ə", "p", "b", "t", "d", "k", "f", "v"]);
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
