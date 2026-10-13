import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected ranks, shares and bands come from docs/research/issue-287-phoneme-frequency.md.

const ranking = observation(
	() => {
		const rows = Array.from(document.querySelectorAll("ol > li > a"));
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

// Clicking a ranked sound opens its page. Meter width is the sound's position
// among 40: (40 - rank + 1) / 40.
const soundPage = observation(
	() => {
		const section = (heading: string) =>
			Array.from(document.querySelectorAll("section")).find(
				(node) => node.querySelector("h2")?.textContent?.trim() === heading,
			);
		const frequency = section("Frequency");
		const spelling = section("Spelling");
		const rank = frequency?.querySelectorAll("p > span");
		return {
			path: location.pathname,
			heading: document.querySelector("h1")?.textContent?.trim() ?? null,
			band: rank?.[0]?.textContent?.trim() ?? null,
			ranking: rank?.[1]?.textContent?.trim() ?? null,
			meter:
				frequency?.querySelector<HTMLElement>("[aria-hidden='true'] > span")?.style.width ?? null,
			link: frequency?.querySelector("a")?.getAttribute("href") ?? null,
			patterns: Array.from(spelling?.querySelectorAll("li") ?? []).map((item) =>
				item.textContent?.trim(),
			),
			examples: spelling?.querySelector("p")?.textContent?.trim() ?? null,
			highlighted: Array.from(spelling?.querySelectorAll("mark") ?? []).map((mark) =>
				mark.textContent?.trim(),
			),
		};
	},
	{
		path: "/ipa-chart/dh",
		heading: "/ð/",
		band: "Common",
		ranking: "11th of 40",
		meter: "75%",
		link: "/ipa-chart/frequency",
		patterns: ["th"],
		examples: "as in this, mother",
		highlighted: ["th", "th"],
	},
);

// Outside the chart the card is the short popover; the sound's name links to its page.
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
		link: "/ipa-chart/h",
	},
);

const followedLink = observation(
	() => ({
		path: location.pathname,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
		tab:
			document.querySelector('nav[aria-label="IPA Chart"] a.bg-secondary')?.getAttribute("href") ??
			null,
	}),
	{ path: "/ipa-chart/h", heading: "/h/", tab: "/ipa-chart/consonants" },
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
	title: "Frequency page and sound pages",
	checkpoints: {
		ranking,
		"sound-page": soundPage,
		menu,
		"plain-charts": plainCharts,
		"result-card": resultCard,
		"followed-link": followedLink,
	},
	coverageLimits: [
		"order and band colors read from the DOM; bar lengths, color steps and layout checked by screenshot review only",
		"en-us only; the unavailable-accent path is covered by unit tests, as no route renders es-419 data",
		"desktop Chromium; mobile layout reviewed by screenshot only when captured",
	],
} satisfies Feature;
