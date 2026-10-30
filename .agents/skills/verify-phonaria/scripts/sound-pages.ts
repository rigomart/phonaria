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
		title: "The sounds of American English - Phonaria",
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
		const spelling = Array.from(details?.querySelectorAll("section") ?? []).find(
			(section) => section.querySelector("h2")?.textContent?.trim() === "Spelling",
		);
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
		};
	},
	{
		path: "/sounds/th-thin",
		title: "The /θ/ sound (th in 'thin'): how to pronounce it - Phonaria",
		canonical: "http://localhost:3000/sounds/th-thin",
		h1: ["/θ/, Voiceless dental fricative"],
		sections: ["How it's made", "Compare with", "Spelling"],
		rank: "38th most common of 40 sounds",
		spellingWords: ["thin", "think"],
		back: "All sounds",
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
