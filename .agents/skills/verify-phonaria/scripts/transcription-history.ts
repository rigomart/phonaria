import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
const list = () => {
	const input = document.querySelector<HTMLInputElement>('[aria-label="Text to transcribe"]');
	const listbox = document.querySelector('[role="listbox"]');
	return {
		input: input?.value ?? null,
		query: new URL(location.href).searchParams.get("q"),
		focused: !!input && document.activeElement === input,
		open: !!listbox?.getClientRects().length,
		options: Array.from(document.querySelectorAll('[role="option"]')).map(
			(option) => option.querySelector("span span")?.textContent ?? null,
		),
		helloWorldIpa:
			Array.from(document.querySelectorAll('[role="option"]'))
				.find((option) => option.querySelector("span span")?.textContent === "Hello world")
				?.querySelector("span span:nth-child(2)")?.textContent ?? null,
		headerButton: !!document.querySelector('header [aria-label^="History"]'),
		stored: (() => {
			const raw = localStorage.getItem("transcription-history");
			return raw
				? (JSON.parse(raw) as { entries: { text: string }[] }).entries.map((entry) => entry.text)
				: [];
		})(),
	};
};

const recent = observation(list, {
	input: "",
	query: null,
	focused: true,
	open: true,
	options: ["She chose well", "Hello world"],
	helloWorldIpa: "/hə.ˈloʊ ˈwɝld/",
	headerButton: false,
	stored: ["She chose well", "Hello world"],
});

const filtered = observation(list, {
	input: "hel",
	query: null,
	focused: true,
	open: true,
	options: ["Hello world"],
	helloWorldIpa: "/hə.ˈloʊ ˈwɝld/",
	headerButton: false,
	stored: ["She chose well", "Hello world"],
});

const listClosed = observation(list, {
	input: "hel",
	query: null,
	focused: true,
	open: false,
	options: [],
	helloWorldIpa: null,
	headerButton: false,
	stored: ["She chose well", "Hello world"],
});

const fieldCleared = observation(list, {
	input: "",
	query: null,
	focused: true,
	open: false,
	options: [],
	helloWorldIpa: null,
	headerButton: false,
	stored: ["She chose well", "Hello world"],
});

// The field is disabled while transcribing, so a submit leaves it unfocused.
const picked = observation(list, {
	input: "She chose well",
	query: "She chose well",
	focused: false,
	open: false,
	options: [],
	helloWorldIpa: null,
	headerButton: false,
	stored: ["She chose well", "Hello world"],
});

const resultShowing = observation(list, {
	input: "She chose well",
	query: "She chose well",
	focused: true,
	open: false,
	options: [],
	helloWorldIpa: null,
	headerButton: false,
	stored: ["She chose well", "Hello world"],
});

const footerFocused = observation(
	() => ({
		open: !!document.querySelector('[role="listbox"]')?.getClientRects().length,
		active: document.activeElement?.textContent?.trim() ?? null,
	}),
	{ open: true, active: "Clear history" },
);

const removed = observation(list, {
	input: "",
	query: null,
	focused: true,
	open: true,
	options: ["Hello world"],
	helloWorldIpa: "/hə.ˈloʊ ˈwɝld/",
	headerButton: false,
	stored: ["Hello world"],
});

const emptied = observation(list, {
	input: "",
	query: null,
	focused: true,
	open: false,
	options: [],
	helloWorldIpa: null,
	headerButton: false,
	stored: [],
});

export const transcriptionHistory = {
	title: "Transcription history in the input",
	checkpoints: {
		recent,
		filtered,
		"escape-closes": listClosed,
		"escape-clears": fieldCleared,
		picked,
		"no-list-for-result": resultShowing,
		removed,
		"footer-focus": footerFocused,
		emptied,
	},
	coverageLimits: [
		"common-word client lookup only; no Turso or spelling service",
		"pointer removal (row ×) and the touch-screen always-visible × unverified; keyboard Shift+Delete checked",
		"Tab into the footer checked; the rest of the footer focus order (Shift+Tab back, Tab out to submit, Escape) unverified",
		"cross-tab sync unverified",
		"desktop Chromium; phone list height unverified",
	],
} satisfies Feature;
