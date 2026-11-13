import { type Feature, observation } from "./feature";

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
		thLabel: "Voiceless TH, as in thin",
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
		const common = section("Common words with θ");
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
			howItsMade:
				Array.from(details?.querySelectorAll("p") ?? [])
					.find((p) => /is made with/.test(p.textContent ?? ""))
					?.textContent?.trim() ?? null,
			differences: Array.from(
				details?.querySelectorAll('dl[aria-label="How θ and t differ"] > div') ?? [],
			).map((row) => Array.from(row.children).map((cell) => cell.textContent?.trim())),
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
		h1: ["Voiceless TH"],
		sections: ["How it's made", "Compare with", "Spelling", "Common words with θ"],
		rank: "38th most common of 40 sounds",
		spellingWords: ["think", "something", "both"],
		back: "All sounds",
		howItsMade:
			"/θ/ is made with the tongue between the teeth, pushing air through a narrow gap, with the voice off.",
		// Term first for screen readers, each value named by its sound.
		differences: [
			["Place", "θ: dental", "t: alveolar"],
			["Manner", "θ: fricative", "t: plosive"],
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
					text: Array.from(row.querySelectorAll(":scope > div > p")).map((p) =>
						p.textContent?.trim(),
					),
					words: Array.from(row.querySelectorAll("li")).map((li) => li.textContent?.trim()),
				}),
			),
		};
	},
	{
		path: "/sounds/t-top",
		variants: [
			{
				ipa: "tʰ",
				text: [
					"A short burst of air comes out after the sound. You can feel it on your hand.",
					"When: at the start of a word, or at the start of a stressed syllable.",
				],
				words: ["top", "attack"],
			},
			{
				ipa: "t",
				text: [
					"No burst of air, so it sounds closer to b, d or g.",
					"When: right after s at the start of a word.",
				],
				words: ["stop", "stay"],
			},
			{
				ipa: "ɾ",
				text: [
					"Sounds like a very quick d: the tongue taps the roof of the mouth once.",
					"When: after a vowel or r, if the next vowel is not stressed.",
				],
				words: ["water", "city", "party"],
			},
			{
				ipa: "ʔ",
				text: [
					"No t sound. The air stops in the throat for a moment instead.",
					"When: before a consonant, as in button and football, and often at the end of a sentence.",
				],
				words: ["button", "football"],
			},
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
			/^\S+% of everyday speech$/.test(span.textContent?.trim() ?? ""),
		);
		const centre = (node: Element | undefined) => {
			const rect = node?.getBoundingClientRect();
			return rect ? rect.top + rect.height / 2 : null;
		};
		const shareCentre = centre(share);
		const rankCentre = centre(rank);
		const tileHeight = share?.getBoundingClientRect().height ?? 0;
		return {
			width: window.innerWidth,
			rank: rank?.textContent?.trim() ?? null,
			share: share?.textContent?.trim() ?? null,
			sameRow:
				shareCentre !== null &&
				rankCentre !== null &&
				Math.abs(shareCentre - rankCentre) < tileHeight,
			overflow: document.documentElement.scrollWidth > window.innerWidth,
		};
	},
	{
		width: 390,
		rank: "26th most common of 40 sounds",
		share: "1.7% of everyday speech",
		sameRow: true,
		overflow: false,
	},
);

export const soundPages = {
	title: "Sound pages",
	checkpoints: {
		index,
		"sound-page": soundPage,
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
