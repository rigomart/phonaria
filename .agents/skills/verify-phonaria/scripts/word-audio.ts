import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// The /i/ words are the catalog's seat/sit and sheep/ship pairs and its spelling examples.

const readSoundCard = () => {
	const sections = Array.from(document.querySelectorAll("[data-phoneme-details] section"));
	const hear = (title: string) =>
		Array.from(
			sections
				.find((section) => section.querySelector("h3")?.textContent?.trim() === title)
				?.querySelectorAll('button[aria-label^="Hear "]') ?? [],
		).map((button) => button.getAttribute("aria-label"));
	return { compareWith: hear("Compare with"), spelling: hear("Spelling") };
};

const readReveal = () => {
	const rows = Array.from(document.querySelectorAll("li")).filter((row) =>
		row.querySelector('button[aria-label^="Hear "]'),
	);
	return {
		rows: rows.length,
		mismatched: rows
			.map((row) => ({
				word: row.querySelector(".font-display")?.textContent?.trim(),
				label: row.querySelector('button[aria-label^="Hear "]')?.getAttribute("aria-label"),
			}))
			.filter(({ word, label }) => label !== `Hear ${word}`),
	};
};

const readLookup = () => ({
	buttons: Array.from(document.querySelectorAll('button[aria-label^="Hear "]')).map((button) =>
		button.getAttribute("aria-label"),
	),
});

const readPlayback = () => ({
	errored: Array.from(document.querySelectorAll('button[aria-label^="Hear "]'))
		.filter((button) => button.getAttribute("data-status") === "error")
		.map((button) => button.getAttribute("aria-label")),
	errorToasts: Array.from(document.querySelectorAll("[data-sonner-toast]")).filter((toast) =>
		toast.textContent?.includes("Playback error"),
	).length,
});

export const wordAudio = {
	title: "Word recordings on sound cards, Practice reveals and word lookups",
	checkpoints: {
		"sound-card": observation(readSoundCard, {
			compareWith: ["Hear seat", "Hear sit", "Hear sheep", "Hear ship"],
			spelling: ["Hear seed", "Hear sea", "Hear happy", "Hear be"],
		}),
		"practice-reveal": observation(readReveal, { rows: 5, mismatched: [] }),
		lookup: observation(readLookup, { buttons: ["Hear seat"] }),
		played: observation(readPlayback, { errored: [], errorToasts: 0 }),
	},
	coverageLimits: [
		"playback is proven by waiting for the clicked button's data-status to reach playing, which the audio manager sets on the media element's playing event; nobody listens to the sound",
		"the published manifest has no labelled forms yet, so a word with several recordings is covered by unit tests with a manifest fixture, not here",
		"Practice words are drawn at random; the reveal checks that each row's button names its own word",
		"definitions in the lookup popover need the Worker to reach Wiktionary and are not checked",
		"viewport screenshots: a full-page capture closed the pinned sound card before the next click",
	],
	screenshot: "viewport",
} satisfies Feature;
