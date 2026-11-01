import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected slugs and titles are the ones reviewed in #392 (PR #399); the /θ/
// and /ɔ/ ranks come from docs/research/issue-287-phoneme-frequency.md.

const index = observation(
	() => {
		const groups = Array.from(document.querySelectorAll("main section"));
		return {
			path: location.pathname,
			title: document.title,
			heading: document.querySelector("h1")?.textContent?.trim() ?? null,
			groups: groups.map((group) => {
				const links = Array.from(group.querySelectorAll("li a"));
				return {
					title: group.querySelector("h2")?.textContent?.trim() ?? null,
					count: links.length,
					first: links[0]?.getAttribute("href") ?? null,
					last: links.at(-1)?.getAttribute("href") ?? null,
				};
			}),
			uniqueLinks: new Set(
				Array.from(document.querySelectorAll("main section li a")).map((link) =>
					link.getAttribute("href"),
				),
			).size,
			thLabel:
				document.querySelector('main a[href="/sounds/th-thin"]')?.getAttribute("aria-label") ??
				null,
		};
	},
	{
		path: "/sounds",
		title: "The 40 sounds of American English, with IPA and examples - Phonaria",
		heading: "The sounds of American English",
		groups: [
			{ title: "Consonants", count: 24, first: "/sounds/p-pat", last: "/sounds/j-jeep" },
			{ title: "Vowels", count: 16, first: "/sounds/ee-seed", last: "/sounds/oy-boy" },
		],
		uniqueLinks: 40,
		thLabel: "/θ/ as in thin",
	},
);

const soundPage = observation(
	() => {
		const details = document.querySelector("[data-phoneme-details]");
		const section = (title: string) =>
			Array.from(details?.querySelectorAll("section") ?? []).find(
				(candidate) => candidate.querySelector("h2")?.textContent?.trim() === title,
			);
		const spelling = section("Spelling");
		const common = section("Common words with /θ/");
		return {
			path: location.pathname,
			title: document.title,
			canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
			h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent?.trim()),
			sections: Array.from(details?.querySelectorAll("section h2") ?? []).map((h) =>
				h.textContent?.trim(),
			),
			rank:
				Array.from(details?.querySelectorAll("span") ?? [])
					.find((span) => /most common of/.test(span.textContent ?? ""))
					?.textContent?.trim() ?? null,
			spellingWords: Array.from(spelling?.querySelectorAll("li li") ?? []).map((word) =>
				word.textContent?.trim(),
			),
			back: document.querySelector('main a[href="/sounds"]')?.textContent?.trim() ?? null,
			paragraphs: Array.from(details?.querySelectorAll("p") ?? [])
				.map((p) => p.textContent?.trim() ?? "")
				.filter((text) => text.startsWith("/θ/ is ")),
			related: Array.from(section("Related sounds")?.querySelectorAll("a") ?? []).map((a) => ({
				href: a.getAttribute("href"),
				text: a.textContent?.trim(),
			})),
			commonWords: Array.from(common?.querySelectorAll("h3") ?? []).map((h) => ({
				label: h.textContent?.trim(),
				words: Array.from(h.nextElementSibling?.querySelectorAll("li") ?? []).map((li) =>
					li.textContent?.trim(),
				),
			})),
		};
	},
	{
		path: "/sounds/th-thin",
		title: "How to pronounce the voiceless TH sound /θ/ (as in 'thin') - Phonaria",
		canonical: "http://localhost:3000/sounds/th-thin",
		h1: ["Voiceless TH /θ/"],
		sections: [
			"How it's made",
			"Compare with",
			"Related sounds",
			"Spelling",
			"Common words with /θ/",
		],
		rank: "38th most common of 40 sounds",
		spellingWords: ["thin", "think"],
		back: "All sounds",
		// Text from #418's expected result.
		paragraphs: [
			"/θ/ is the th in 'thin' and 'think'. Its voiced partner is /ð/, the th in 'this'.",
			"/θ/ is made with the tongue between the teeth, pushing air through a narrow gap, with the voice off.",
		],
		related: [{ href: "/sounds/th-this", text: "/ð/voiced TH, as in 'this'" }],
		commonWords: [
			{
				label: "At the start",
				words: ["think", "through", "three", "things", "thing", "thought"],
			},
			{
				label: "Inside",
				words: ["something", "without", "anything", "nothing", "everything", "months"],
			},
			{ label: "At the end", words: ["both", "health", "death", "south", "north", "month"] },
		],
	},
);

const schwaRelated = observation(
	() => {
		const details = document.querySelector("[data-phoneme-details]");
		const related = Array.from(details?.querySelectorAll("section") ?? []).find(
			(section) => section.querySelector("h2")?.textContent?.trim() === "Related sounds",
		);
		return {
			path: location.pathname,
			related: Array.from(related?.querySelectorAll("a") ?? []).map((a) => a.getAttribute("href")),
		};
	},
	{
		path: "/sounds/schwa",
		related: ["/sounds/ae-cat", "/sounds/er-her", "/sounds/eh-red", "/sounds/uh-cup"],
	},
);

const notFound = observation(
	() => ({
		path: location.pathname,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
		details: !!document.querySelector("[data-phoneme-details]"),
	}),
	{ path: "/sounds/nope", heading: "This page doesn't exist", details: false },
);

const rankLine = observation(
	() => {
		const details = document.querySelector("[data-phoneme-details]");
		const rank = Array.from(details?.querySelectorAll("span") ?? []).find((span) =>
			/^\S+ most common of \d+ sounds$/.test(span.textContent?.trim() ?? ""),
		);
		const link = Array.from(details?.querySelectorAll("a") ?? []).find(
			(a) => a.textContent?.trim() === "See ranking",
		);
		const lines = (node: Element | undefined) => {
			if (!node) return null;
			const range = document.createRange();
			range.selectNodeContents(node);
			// The rank number is larger than the words after it, so rects on one line
			// differ in height; a rect starting below the previous line's bottom starts a new line.
			const rects = Array.from(range.getClientRects()).sort((a, b) => a.top - b.top);
			let count = 0;
			let bottom = -Infinity;
			for (const rect of rects) {
				if (rect.top >= bottom) count += 1;
				bottom = Math.max(bottom, rect.bottom);
			}
			return count;
		};
		const box = rank?.getBoundingClientRect();
		const linkBox = link?.getBoundingClientRect();
		return {
			width: window.innerWidth,
			rank: rank?.textContent?.trim() ?? null,
			rankLines: lines(rank),
			linkBesideRank: box && linkBox ? linkBox.top < box.bottom && linkBox.bottom > box.top : null,
			overflow: document.documentElement.scrollWidth > window.innerWidth,
		};
	},
	{
		width: 390,
		rank: "26th most common of 40 sounds",
		rankLines: 1,
		linkBesideRank: false,
		overflow: false,
	},
);

export const soundPages = {
	title: "Sound pages",
	checkpoints: {
		index,
		"sound-page": soundPage,
		"schwa-related": schwaRelated,
		"not-found": notFound,
		"rank-line": rankLine,
	},
	coverageLimits: [
		"en-us only; es-419 has no sound pages",
		"server-rendered HTML is checked with curl, outside this journey",
		"audio playback and the articulation diagram's drawing are not exercised; layout is checked by screenshot review",
	],
	expectedResponses: [{ path: "/sounds/nope", status: 404 }],
} satisfies Feature;
