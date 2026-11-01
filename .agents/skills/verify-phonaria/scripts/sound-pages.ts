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
			howTo: (details?.textContent ?? "").includes("is made with the tongue"),
			differences: Array.from(
				details?.querySelectorAll('dl[aria-label="How /θ/ and /t/ differ"] > div') ?? [],
			).map((row) => Array.from(row.children).map((cell) => cell.textContent?.trim())),
			near: Array.from(section("Sounds near it")?.querySelectorAll("h3") ?? []).map((h) => ({
				label: h.textContent?.trim(),
				links: Array.from(h.nextElementSibling?.querySelectorAll("a") ?? []).map((a) =>
					a.getAttribute("href"),
				),
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
			"Spelling",
			"Common words with /θ/",
			"Sounds near it",
		],
		rank: "38th most common of 40 sounds",
		spellingWords: ["thin", "think"],
		back: "All sounds",
		howTo: false,
		// Term first for screen readers, each value named by its sound.
		differences: [
			["Place", "/θ/: dental", "/t/: alveolar"],
			["Manner", "/θ/: fricative", "/t/: plosive"],
		],
		near: [
			{ label: "Voicing partner", links: ["/sounds/th-this"] },
			{
				label: "Other fricatives",
				links: [
					"/sounds/f-fan",
					"/sounds/v-van",
					"/sounds/s-sun",
					"/sounds/z-zoo",
					"/sounds/sh-shop",
					"/sounds/zh-vision",
					"/sounds/h-house",
				],
			},
		],
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

const schwaNear = observation(
	() => {
		const details = document.querySelector("[data-phoneme-details]");
		const near = Array.from(details?.querySelectorAll("section") ?? []).find(
			(section) => section.querySelector("h2")?.textContent?.trim() === "Sounds near it",
		);
		return {
			path: location.pathname,
			near: Array.from(near?.querySelectorAll("a") ?? []).map((a) => a.getAttribute("href")),
		};
	},
	{
		path: "/sounds/schwa",
		// Plain vowels one step away on the simple vowel chart, nearest on the IPA chart first.
		near: ["/sounds/er-her", "/sounds/eh-red", "/sounds/uh-cup", "/sounds/aw-saw"],
	},
);

const tVariants = observation(
	() => {
		const details = document.querySelector("[data-phoneme-details]");
		const variants = Array.from(details?.querySelectorAll("section") ?? []).find(
			(section) => section.querySelector("h2")?.textContent?.trim() === "How it changes",
		);
		return {
			path: location.pathname,
			variants: Array.from(variants?.querySelectorAll(":scope li:has(> span)") ?? []).map(
				(row) => ({
					ipa: row.querySelector(":scope > span")?.textContent?.trim(),
					label: row.querySelector("p")?.textContent?.trim(),
					words: Array.from(row.querySelectorAll("li")).map((li) => li.textContent?.trim()),
				}),
			),
		};
	},
	{
		path: "/sounds/t-top",
		// The flap in "water" and the glottal stop in "button" are #418's examples.
		variants: [
			{
				ipa: "/tʰ/",
				label: "With a puff of air, at the start of a stressed syllable",
				words: ["top", "time"],
			},
			{ ipa: "/ɾ/", label: "A quick tap of the tongue, between vowels", words: ["water"] },
			{ ipa: "/ʔ/", label: "A catch in the throat, before an n sound", words: ["button"] },
		],
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
		const share = Array.from(details?.querySelectorAll("span") ?? []).find((span) =>
			/^· \S+ of speech$/.test(span.textContent?.trim() ?? ""),
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
		return {
			width: window.innerWidth,
			rank: rank?.textContent?.trim() ?? null,
			rankLines: lines(rank),
			share: share?.textContent?.trim() ?? null,
			// The share keeps its arrow on its own line, never an arrow alone.
			shareLines: lines(share),
			overflow: document.documentElement.scrollWidth > window.innerWidth,
		};
	},
	{
		width: 390,
		rank: "26th most common of 40 sounds",
		rankLines: 1,
		share: "· 1.7% of speech",
		shareLines: 1,
		overflow: false,
	},
);

export const soundPages = {
	title: "Sound pages",
	checkpoints: {
		index,
		"sound-page": soundPage,
		"schwa-near": schwaNear,
		"t-variants": tVariants,
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
