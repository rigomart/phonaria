import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
//
// Expected words are English facts, not app output: thick, thin, thing and
// theory start with /θɪ/ followed by /k/, /n/, /ŋ/ and /ɹ/; "this" starts with /ð/;
// no English word starts with /ŋ/.

const read = () => {
	const visible = (element: Element | null) => !!element?.getClientRects().length;
	const url = new URL(location.href);
	const toggle = document.querySelector('[aria-label="Find a word by its sounds"]');
	const field = document.querySelector('[aria-label="Sounds to find"]');
	const panel = document.querySelector('[role="dialog"][aria-label="Sound keys"]');
	const keys = panel
		? Array.from(panel.querySelectorAll<HTMLButtonElement>("button[aria-label^='/']")).filter(
				(key) => !key.closest("[inert]"),
			)
		: [];
	const results = Array.from(
		document.querySelectorAll('section[aria-label="Words found"] li button'),
	).map((button) => button.querySelector("span")?.textContent?.trim() ?? "");
	return {
		path: url.pathname,
		sounds: url.searchParams.get("sounds"),
		query: url.searchParams.get("q"),
		toggle: toggle ? toggle.getAttribute("aria-pressed") : null,
		field: field ? (field.textContent ?? "").trim() : null,
		panelOpen: visible(panel),
		group: panel?.querySelector('[aria-pressed="true"]')?.textContent?.trim() ?? null,
		keys: keys.length,
		enabledKeys: keys
			.filter((key) => !key.disabled)
			.map((key) => key.querySelector("span")?.textContent ?? ""),
		results: results.filter((word) => ["think", "thing", "thin", "thick", "this"].includes(word)),
		textInput:
			document.querySelector<HTMLInputElement>('[aria-label="Text to transcribe"]')?.value ?? null,
		overflow: document.documentElement.scrollWidth > window.innerWidth,
	};
};

/** Every consonant but /ŋ/ starts some word. */
const CONSONANTS_THAT_START_WORDS = [
	"p",
	"b",
	"t",
	"d",
	"k",
	"ɡ",
	"f",
	"v",
	"θ",
	"ð",
	"s",
	"z",
	"ʃ",
	"ʒ",
	"h",
	"m",
	"n",
	"l",
	"ɹ",
	"w",
	"j",
	"tʃ",
	"dʒ",
];
const FOUR_WORDS = ["think", "thing", "thin", "thick"];
const closed = { panelOpen: false, group: null, keys: 0, enabledKeys: [] };

export const soundSearch: Feature = {
	title: "Find a word by its sounds",
	checkpoints: {
		"text-mode": observation(read, {
			path: "/",
			sounds: null,
			query: null,
			toggle: "false",
			field: null,
			...closed,
			results: [],
			textInput: "",
			overflow: false,
		}),
		opened: observation(read, {
			path: "/",
			sounds: null,
			query: null,
			toggle: "true",
			field: "Pick the sounds you heard...",
			panelOpen: true,
			group: "Consonants",
			keys: 24,
			enabledKeys: CONSONANTS_THAT_START_WORDS,
			results: [],
			textInput: null,
			overflow: false,
		}),
		picked: observation(read, {
			path: "/",
			sounds: null,
			query: null,
			toggle: "true",
			field: "/θɪ/",
			panelOpen: true,
			group: "Consonants",
			keys: 24,
			enabledKeys: ["k", "n", "ŋ", "ɹ"],
			results: [],
			textInput: null,
			overflow: false,
		}),
		searched: observation(read, {
			path: "/search",
			sounds: "TH-IX",
			query: null,
			toggle: "true",
			field: "/θɪ/",
			...closed,
			results: FOUR_WORDS,
			textInput: null,
			overflow: false,
		}),
		live: observation(read, {
			path: "/search",
			sounds: "TH",
			query: null,
			toggle: "true",
			field: "/θ/",
			...closed,
			results: FOUR_WORDS,
			textInput: null,
			overflow: false,
		}),
		"opened-word": observation(read, {
			path: "/search",
			sounds: null,
			query: "think",
			toggle: "false",
			field: null,
			...closed,
			results: [],
			textInput: "think",
			overflow: false,
		}),
		back: observation(read, {
			path: "/search",
			sounds: "TH",
			query: null,
			toggle: "true",
			field: "/θ/",
			...closed,
			results: FOUR_WORDS,
			textInput: null,
			overflow: false,
		}),
	},
	coverageLimits: [
		"Needs FLAG_SOUND_SEARCH on, the local default; the journey cannot tell how the server was started.",
		"Checks the consonant keys and four expected words, not the order or count of every result.",
		"Does not check the Vowels tab's keys, Backspace or Escape in the panel, or a failed word-list load.",
	],
};

export const soundSearchOff: Feature = {
	title: "Find a word by its sounds, FLAG_SOUND_SEARCH off",
	checkpoints: {
		"no-toggle": observation(
			() => ({
				path: location.pathname,
				toggle: !!document.querySelector('[aria-label="Find a word by its sounds"]'),
				field: !!document.querySelector('[aria-label="Sounds to find"]'),
				textInput: !!document.querySelector('[aria-label="Text to transcribe"]'),
			}),
			{ path: "/", toggle: false, field: false, textInput: true },
		),
	},
	coverageLimits: [
		"The server must be started with FLAG_SOUND_SEARCH=0; the journey cannot tell how it was started.",
	],
};
