import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected ranks, shares and bands come from docs/research/issue-287-phoneme-frequency.md.

const ranking = observation(
	() => {
		const rows = Array.from(document.querySelectorAll("ol > li > button"));
		const ipa = (row: Element) => row.children[1]?.textContent?.trim() ?? null;
		const barColor = (row: Element) =>
			Array.from(row.querySelector("[aria-hidden='true'] > span")?.classList ?? []).find((name) =>
				name.startsWith("bg-frequency-"),
			) ?? null;
		const rowFor = (symbol: string) => rows.find((row) => ipa(row) === symbol);
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
			// One sound per band, so each color is checked against a known share.
			colors: ["t", "ð", "h", "ʒ"].map((symbol) => {
				const row = rowFor(symbol);
				return row ? barColor(row) : null;
			}),
		};
	},
	{
		path: "/ipa-chart/frequency",
		heading: "Frequency",
		tabs: 0,
		comparisonChart: false,
		legend: ["Very common", "Common", "Less common", "Rare"],
		rows: 40,
		first: ["ə", "t", "n"],
		last: "ʒ",
		colors: ["bg-frequency-4", "bg-frequency-3", "bg-frequency-2", "bg-frequency-1"],
	},
);

function readCard() {
	const section = (heading: string) =>
		Array.from(document.querySelectorAll("section")).find(
			(node) => node.querySelector("h3")?.textContent?.trim() === heading,
		);
	const frequency = section("Frequency");
	const spelling = section("Spelling");
	const meter = frequency?.querySelector<HTMLElement>("[aria-hidden='true'] > span");
	return {
		selected:
			document.querySelector('[aria-current="true"][aria-label]')?.getAttribute("aria-label") ??
			null,
		link: frequency?.querySelector("a")?.getAttribute("href") ?? null,
		rank: frequency?.querySelector("p")?.textContent?.trim() ?? null,
		meter: meter?.style.width ?? null,
		spelling: Array.from(spelling?.querySelectorAll("p > span") ?? []).map((part) =>
			part.textContent?.trim(),
		),
		highlighted: Array.from(spelling?.querySelectorAll("mark") ?? []).map((mark) =>
			mark.textContent?.trim(),
		),
	};
}

// On the Frequency page the card is the sheet beside the list.
// Meter width is the sound's position among 40: (40 - rank + 1) / 40.
const pageCard = observation(readCard, {
	selected: "/ð/ as in this: 11th, 3.1%, common",
	link: null,
	rank: "Common · 11th of 40",
	meter: "75%",
	spelling: ["th", "this, mother"],
	highlighted: ["th", "th"],
});

// Outside the chart the card is the short popover; the sound's name links to the chart.
const resultCard = observation(
	() => {
		const popup = document.querySelector('[data-slot="popover-content"]');
		return {
			openTrigger:
				document
					.querySelector('button[aria-expanded="true"][aria-label]')
					?.getAttribute("aria-label") ?? null,
			name: popup?.querySelector("a")?.textContent?.trim() ?? null,
			lines: Array.from(popup?.querySelectorAll("p") ?? []).map((line) => line.textContent?.trim()),
			highlighted: Array.from(popup?.querySelectorAll("mark") ?? []).map((mark) =>
				mark.textContent?.trim(),
			),
			link: popup?.querySelector("a")?.getAttribute("href") ?? null,
		};
	},
	{
		openTrigger: "Details for /h/",
		name: "Voiceless glottal fricative",
		lines: ["Less common · 29th of 40", "as in house, hello"],
		highlighted: ["h", "h"],
		link: "/ipa-chart/consonants?sound=H",
	},
);

// The details open in the sheet beside the chart.
const followedLink = observation(
	() => ({
		path: location.pathname,
		search: location.search,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
		selected:
			document.querySelector('[aria-current="true"][aria-label]')?.getAttribute("aria-label") ??
			null,
		details: document.querySelector("aside[data-open] h2")?.textContent?.trim() ?? null,
	}),
	{
		path: "/ipa-chart/consonants",
		search: "?sound=H",
		heading: "Consonants",
		selected: "Voiceless glottal fricative (h)",
		details: "/h/",
	},
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
	title: "Frequency page and sound details",
	checkpoints: {
		ranking,
		"page-card": pageCard,
		menu,
		"plain-charts": plainCharts,
		"result-card": resultCard,
		"followed-link": followedLink,
	},
	coverageLimits: [
		"order and band colors read from the DOM; bar lengths, color steps and layout checked by screenshot review only",
		"en-us only; the unavailable-accent path is covered by unit tests, as no route renders es-419 data",
		"desktop Chromium at 1280px; the mobile drawer is reviewed by screenshot only when captured",
	],
} satisfies Feature;
