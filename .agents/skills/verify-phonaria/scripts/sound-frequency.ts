import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected ranks and shares come from docs/research/issue-287-phoneme-frequency.md.

const ranking = observation(
	() => {
		const rows = Array.from(document.querySelectorAll("ol > li > a"));
		const ipa = (row: Element) => row.children[1]?.textContent?.trim() ?? null;
		return {
			path: location.pathname,
			heading: document.querySelector("h1")?.textContent?.trim() ?? null,
			tabs: document.querySelectorAll('[role="tab"]').length,
			comparisonChart: !!document.querySelector('svg[role="img"]'),
			legend: Array.from(document.querySelectorAll('[aria-label="Bar colors"] li')).map((item) =>
				item.textContent?.trim(),
			),
			rows: rows.length,
			first: rows.slice(0, 3).map(ipa),
			last: rows.length ? ipa(rows[rows.length - 1]) : null,
			categories: rows.some((row) =>
				/very common|less common|rare|, common/i.test(row.getAttribute("aria-label") ?? ""),
			),
			shades: new Set(
				rows.map((row) => {
					const bar = row.querySelector("[aria-hidden='true'] > span");
					return bar ? getComputedStyle(bar).backgroundColor : null;
				}),
			).size,
		};
	},
	{
		path: "/ipa-chart/frequency",
		heading: "How common each sound is",
		tabs: 0,
		comparisonChart: false,
		legend: [],
		rows: 40,
		first: ["ə", "t", "n"],
		last: "ʒ",
		categories: false,
		shades: 40,
	},
);

function readCard() {
	const details = document.querySelector("[data-phoneme-details]");
	const section = (heading: string) =>
		Array.from(details?.querySelectorAll("section") ?? []).find(
			(node) => node.querySelector("h3")?.textContent?.trim() === heading,
		);
	// How common the sound is: a block in the header, a link where the host allows it. Its
	// label reads "Common: 11th most common of 40 sounds".
	const frequency = Array.from(details?.querySelectorAll("a, p") ?? []).find((node) =>
		node.getAttribute("aria-label")?.includes("most common"),
	);
	const label = /^(.+?): (.+? most common) of (\d+) sounds/.exec(
		frequency?.getAttribute("aria-label") ?? "",
	);
	const bars = Array.from(frequency?.querySelectorAll("[aria-hidden='true'] > span") ?? []);
	const lit = bars.filter((bar) =>
		Array.from(bar.classList).some((name) => name.startsWith("bg-frequency-")),
	);
	const spelling = section("Spelling");
	return {
		openTrigger:
			document.querySelector("[data-details-open][aria-label]")?.getAttribute("aria-label") ?? null,
		band: frequency?.querySelector(".font-medium")?.textContent?.trim() ?? null,
		rank: label?.[2] ?? null,
		of: label?.[3] ?? null,
		link: frequency?.tagName === "A" ? frequency.getAttribute("href") : null,
		meter: bars.length ? `${lit.length} of ${bars.length}` : null,
		spellings: Array.from(spelling?.querySelectorAll("li") ?? []).map((row) =>
			Array.from(row.children).map((part) => part.textContent?.trim()),
		),
		highlighted: Array.from(spelling?.querySelectorAll("mark") ?? []).map((mark) =>
			mark.textContent?.trim(),
		),
	};
}

// The meter lights one bar per band step: /ð/ 3.1% is Common, 3 of 4 (issue-287 record);
// /h/ 1.35% is Less common, 2 of 4 (phoneme-frequency.json).
const pageCard = observation(readCard, {
	openTrigger: "/ð/ as in this: 11th, 3.1%",
	band: "Common",
	rank: "11th most common",
	of: "40",
	link: null,
	meter: "3 of 4",
	spellings: [["th", "this, mother"]],
	highlighted: ["th", "th"],
});

const resultCard = observation(readCard, {
	openTrigger: "Details for /h/",
	band: "Less common",
	rank: "29th most common",
	of: "40",
	link: "/ipa-chart/frequency",
	meter: "2 of 4",
	spellings: [["h", "house, hello"]],
	highlighted: ["h", "h"],
});

const followedLink = observation(
	() => ({
		path: location.pathname,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
	}),
	{ path: "/ipa-chart/frequency", heading: "How common each sound is" },
);

const menu = observation(
	() =>
		Array.from(document.querySelectorAll('nav[aria-label="IPA Chart"] a'))
			.filter((link) => link.getClientRects().length > 0)
			.map((link) => link.getAttribute("href")),
	["/ipa-chart/consonants", "/ipa-chart/vowels", "/ipa-chart/frequency"],
);

const plainCharts = observation(
	() => ({
		path: location.pathname,
		switches: Array.from(document.querySelectorAll('[role="switch"]')).map(
			(control) => control.closest("label")?.textContent?.trim() ?? null,
		),
		voicingLegend: ["Voiceless", "Voiced"].every((text) => document.body.innerText.includes(text)),
	}),
	{ path: "/ipa-chart/consonants", switches: [], voicingLegend: true },
);

export const soundFrequency = {
	title: "Frequency page and sound card",
	checkpoints: {
		ranking,
		"page-card": pageCard,
		menu,
		"plain-charts": plainCharts,
		"result-card": resultCard,
		"followed-link": followedLink,
	},
	coverageLimits: [
		"order, band colors and lit meter bars read from the DOM; bar lengths, color steps and layout checked by screenshot review only",
		"en-us only; the unavailable-accent path is covered by unit tests, as no route renders es-419 data",
		"desktop Chromium; mobile layout reviewed by screenshot only when captured",
	],
} satisfies Feature;

export const frequencyPage = {
	title: "Frequency page with continuous shading",
	checkpoints: { ranking },
	coverageLimits: [
		"Ranks, category absence and distinct rendered shades checked in Chromium; layout reviewed in saved screenshots",
		"Sound details, audio playback and other routes are outside this focused journey",
	],
} satisfies Feature;
