import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected copy is the wording approved in issue #365, with /r/ written as the app's /ɹ/.

function readNotes() {
	const details = document.querySelector("[data-phoneme-details]");
	const sections = Array.from(details?.querySelectorAll("section") ?? []);
	const notes = sections.filter((section) => section.querySelector("p em"));
	return {
		openTrigger:
			document.querySelector("[data-details-open][aria-label]")?.getAttribute("aria-label") ?? null,
		sections: sections.map((section) => section.querySelector("h3")?.textContent?.trim() ?? null),
		notes: notes.map((section) => ({
			title: section.querySelector("h3")?.textContent?.trim() ?? null,
			text: section.querySelector("p")?.textContent?.trim() ?? null,
			words: Array.from(section.querySelectorAll("p em")).map((word) => word.textContent),
			sounds: Array.from(section.querySelectorAll("p .font-display")).map(
				(sound) => sound.textContent,
			),
		})),
	};
}

const COT_CAUGHT = {
	title: "Cot and caught",
	text: "Many Americans say cot and caught with the same vowel, usually the /ɑ/ of father. Linguists call this the cot–caught merger. It's common in the West and across Canada, and it has been spreading in the rest of the US. Both ways of speaking are ordinary American English. The recordings in this app use a voice with this merger, so its /ɔ/ words sound like /ɑ/.",
	words: ["cot", "caught", "father"],
	sounds: ["/ɑ/"],
};

const MARY_MARRY_MERRY = {
	title: "Mary, marry and merry",
	text: "Before /ɹ/, many Americans say Mary, marry and merry the same way. People in parts of the Northeast, such as New York, Philadelphia and Boston, are more likely to keep the vowels apart. Both are normal American speech. If marry and merry sound alike in a recording, that's this merger, not a mistake.",
	words: ["Mary", "marry", "merry", "marry", "merry"],
	sounds: ["/ɹ/"],
};

const openO = observation(readNotes, {
	openTrigger: "Open-mid back rounded vowel (ɔ)",
	sections: ["How it's made", "Spelling", "Cot and caught"],
	notes: [COT_CAUGHT],
});

const openAe = observation(readNotes, {
	openTrigger: "Near-open front unrounded vowel (æ)",
	sections: ["How it's made", "Compare with", "Spelling", "Mary, marry and merry"],
	notes: [MARY_MARRY_MERRY],
});

const openE = observation(readNotes, {
	openTrigger: "Open-mid front unrounded vowel (ɛ)",
	sections: ["How it's made", "Compare with", "Spelling", "Mary, marry and merry"],
	notes: [MARY_MARRY_MERRY],
});

const noNote = observation(readNotes, {
	openTrigger: "Open back unrounded vowel (ɑ)",
	sections: ["How it's made", "Compare with", "Spelling"],
	notes: [],
});

export const mergerNotes = {
	title: "Merger notes on sound details",
	checkpoints: {
		"o-note": openO,
		"ae-note": openAe,
		"e-note": openE,
		"no-note": noNote,
	},
	coverageLimits: [
		"note text, italic words and IPA spans read from the DOM; typography and spacing checked by screenshot review only",
		"en-us only; es-419 has no notes and no route renders its details, so that path is covered by unit tests",
		"the words in the notes have no recordings, so playback is not exercised",
		"viewport screenshots and no DevTools trace: full-page captures of the pinned panel, or tracing, drove the renderer to 100% CPU after three or four panel opens until every agent-browser command timed out, on sounds with and without notes alike",
	],
	screenshot: "viewport",
	trace: "skip",
} satisfies Feature;
