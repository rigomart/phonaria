import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { flags } from "@/lib/flags";
import { SEARCH_PATH } from "@/lib/home-metadata";
import { loadTier2 } from "@/lib/phoneme-lookup/shared";
import {
	buildExampleWords,
	buildSoundIndex,
	formatSoundsParam,
	type IndexedWord,
	parseSoundsParam,
	type SoundId,
	type SoundSearchResult,
	searchBySounds,
} from "@/lib/sound-search/search";
import { useG2PStore } from "@/lib/transcription/g2p-store";

type WordList =
	| { status: "loading" }
	| { status: "error" }
	| { status: "ready"; index: IndexedWord[]; examples: Map<SoundId, string> };

type InputMode = "text" | "sounds";

type SoundSearch = {
	/** `FLAG_SOUND_SEARCH`: without it the input only takes text. */
	enabled: boolean;
	/** On /search, where each pick updates the results right away. */
	live: boolean;
	mode: InputMode;
	setMode: (mode: InputMode) => void;
	sounds: SoundId[];
	status: WordList["status"];
	/** What `sounds` finds; null until the word list has loaded. */
	result: SoundSearchResult | null;
	examples: ReadonlyMap<SoundId, string>;
	/** Searches any sounds, for the results under the input. */
	find: (sounds: readonly SoundId[]) => SoundSearchResult | null;
	add: (id: SoundId) => void;
	removeLast: () => void;
	clear: () => void;
	submit: () => void;
	/** Transcribes the word, as if it had been typed. */
	openWord: (word: string) => void;
	retry: () => void;
};

const NO_EXAMPLES: ReadonlyMap<SoundId, string> = new Map();

const SoundSearchContext = createContext<SoundSearch | null>(null);

/**
 * The input's mode and the sounds picked in it. On the homepage the picks stay
 * in the input until it searches. On /search they live in `?sounds=`, so each
 * pick updates the results and the search can be shared. The 10k word list
 * loads the first time sound mode opens, from the chunk transcription uses.
 */
export function SoundSearchProvider({ live, children }: { live: boolean; children: ReactNode }) {
	const enabled = flags.isEnabled("soundSearch");
	const search: { q?: string; sounds?: string } = useSearch({ strict: false });
	const navigate = useNavigate();
	const setDraftText = useG2PStore((state) => state.setDraftText);

	const urlSounds = live ? search.sounds : undefined;
	const urlQuery = live ? search.q : undefined;
	const urlMode: InputMode = enabled && urlSounds !== undefined ? "sounds" : "text";
	const searchKey = `${urlQuery ?? ""}|${urlSounds ?? ""}`;
	const [modeOverride, setModeOverride] = useState<{ mode: InputMode; searchKey: string } | null>(
		null,
	);
	const overrideApplies = modeOverride !== null && modeOverride.searchKey === searchKey;
	const mode = enabled ? (overrideApplies ? modeOverride.mode : urlMode) : "text";

	const [localSounds, setLocalSounds] = useState<SoundId[]>([]);
	const sounds = useMemo(
		() => (live ? parseSoundsParam(urlSounds) : localSounds),
		[live, urlSounds, localSounds],
	);

	const [wordList, setWordList] = useState<WordList>({ status: "loading" });
	const [attempt, setAttempt] = useState(0);
	const loaded = useRef(false);
	const needsWords = mode === "sounds" || urlSounds !== undefined;

	useEffect(() => {
		if (!needsWords || loaded.current) return;
		let cancelled = false;
		setWordList({ status: "loading" });
		loadTier2().then(
			(data) => {
				if (cancelled) return;
				const index = buildSoundIndex(data);
				loaded.current = true;
				setWordList({ status: "ready", index, examples: buildExampleWords(index) });
			},
			() => {
				if (!cancelled) setWordList({ status: "error" });
			},
		);
		return () => {
			cancelled = true;
		};
	}, [needsWords, attempt]);

	const find = useCallback(
		(picked: readonly SoundId[]) =>
			wordList.status === "ready" ? searchBySounds(wordList.index, picked) : null,
		[wordList],
	);
	const result = useMemo(() => find(sounds), [find, sounds]);

	const setSounds = useCallback(
		(next: SoundId[]) => {
			if (!live) {
				setLocalSounds(next);
				return;
			}
			const refiningSounds = urlSounds !== undefined;
			void navigate({
				to: SEARCH_PATH,
				search: { sounds: formatSoundsParam(next) },
				replace: refiningSounds,
			});
		},
		[live, navigate, urlSounds],
	);

	const value = useMemo<SoundSearch>(
		() => ({
			enabled,
			live,
			mode,
			setMode: (next) => setModeOverride({ mode: next, searchKey }),
			sounds,
			status: wordList.status,
			result,
			examples: wordList.status === "ready" ? wordList.examples : NO_EXAMPLES,
			find,
			add: (id) => setSounds([...sounds, id]),
			removeLast: () => setSounds(sounds.slice(0, -1)),
			clear: () => setSounds([]),
			submit: () => {
				if (sounds.length === 0) return;
				void navigate({ to: SEARCH_PATH, search: { sounds: formatSoundsParam(sounds) } });
			},
			openWord: (word) => {
				setDraftText(word);
				void navigate({ to: SEARCH_PATH, search: { q: word } });
			},
			retry: () => setAttempt((count) => count + 1),
		}),
		[
			enabled,
			find,
			live,
			mode,
			navigate,
			result,
			searchKey,
			setDraftText,
			setSounds,
			sounds,
			wordList,
		],
	);

	return <SoundSearchContext.Provider value={value}>{children}</SoundSearchContext.Provider>;
}

export function useSoundSearch(): SoundSearch {
	const context = useContext(SoundSearchContext);
	if (!context) throw new Error("useSoundSearch needs a SoundSearchProvider");
	return context;
}

export function prefetchSoundSearch() {
	void loadTier2().catch(() => undefined);
}
