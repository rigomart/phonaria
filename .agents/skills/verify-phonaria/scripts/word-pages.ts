import { type Feature, observation } from "./feature";

// Runs in the browser after serialization; keep dependencies inside the body.
// Expected values come from #459's "You see" and from English facts: enough is
// /ɪˈnʌf/, spelled e, n, ou, gh; gh spells /f/ in tough; know pairs with now.

const enough = observation(
	() => {
		const main = document.querySelector("main");
		const cards = Array.from(main?.querySelectorAll('ol[aria-label="Sounds"] > li') ?? []);
		const rare = cards.find((li) => li.hasAttribute("data-rare"));
		return {
			path: location.pathname,
			status: (
				performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
			)?.responseStatus,
			title: document.title,
			canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
			h1: Array.from(main?.querySelectorAll("h1") ?? []).map((h) => h.textContent?.trim()),
			h2: Array.from(main?.querySelectorAll("h2") ?? []).map((h) => h.textContent?.trim()),
			recordings: Array.from(main?.querySelectorAll("header button") ?? []).map((b) =>
				b.getAttribute("aria-label"),
			),
			sounds: cards.map((li) => {
				const link = li.querySelector('a[href^="/sounds/"]');
				return [
					li.firstElementChild?.firstElementChild?.textContent?.trim(),
					link?.textContent?.trim(),
					link?.getAttribute("href"),
					li.querySelector('button[aria-label^="Play "]')?.getAttribute("aria-label") ?? null,
					li.hasAttribute("data-rare"),
				];
			}),
			rareBar: rare?.querySelector('[role="img"]')?.getAttribute("aria-label") ?? null,
			rareNumber: rare?.querySelector('[role="img"] + span')?.textContent?.trim() ?? null,
			rareWords: Array.from(rare?.querySelectorAll("ul li") ?? []).map((li) =>
				li.textContent?.trim(),
			),
			wiktionary:
				Array.from(main?.querySelectorAll("a") ?? [])
					.map((a) => a.getAttribute("href"))
					.find((href) => href?.startsWith("https://en.wiktionary.org/")) ?? null,
			overflow: document.documentElement.scrollWidth > window.innerWidth,
		};
	},
	{
		path: "/words/enough",
		status: 200,
		title: "Enough in IPA: /ɪˈnʌf/, phonetic transcription and audio - Phonaria",
		canonical: "http://localhost:3000/words/enough",
		h1: ["Enough in IPA: /ɪˈnʌf/"],
		h2: [],
		recordings: ["Hear enough"],
		sounds: [
			["e", "/ɪ/", "/sounds/ih-sit", "Play Short I", false],
			["n", "/n/", "/sounds/n-sun", "Play N", false],
			["ou", "/ʌ/", "/sounds/uh-cup", "Play Short U", false],
			["gh", "/f/", "/sounds/f-fan", "Play F", true],
		],
		rareBar:
			"Rare spelling. 1.0% of /f/ sounds in everyday speech are spelled gh. Other common spellings: f 89.0%, ff 7.0%, ph 2.6%.",
		rareNumber: "1.0% of /f/",
		rareWords: ["tough", "laugh", "rough"],
		wiktionary: "https://en.wiktionary.org/wiki/enough#English",
		overflow: false,
	},
);

const forms = observation(
	() => ({
		path: location.pathname,
		recordings: Array.from(document.querySelectorAll("main header button")).map((b) =>
			b.getAttribute("aria-label"),
		),
	}),
	{ path: "/words/either", recordings: ["Hear either", "Hear either, also said"] },
);

const pairs = observation(
	() => ({
		path: location.pathname,
		contrasts: Array.from(document.querySelectorAll('main a[href^="/minimal-pairs/"]')).map((a) => [
			a.textContent?.replace(/\s+/g, " ").trim(),
			a.getAttribute("href"),
		]),
	}),
	{
		path: "/words/know",
		contrasts: [["vs /aʊ/ now", "/minimal-pairs/ou-au"]],
	},
);

const sitemap = observation(
	() => {
		const locs = Array.from(document.querySelectorAll("loc")).map(
			(loc) => loc.textContent?.trim() ?? "",
		);
		return {
			enough: locs.some((loc) => loc.endsWith("/words/enough")),
			colonel: locs.some((loc) => loc.endsWith("/words/colonel")),
			will: locs.some((loc) => loc.endsWith("/words/will")),
			search: locs.some((loc) => loc.includes("/search")),
		};
	},
	{ enough: true, colonel: true, will: false, search: false },
);

const notFound = observation(
	() => ({
		path: location.pathname,
		status: (
			performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
		)?.responseStatus,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
	}),
	{ path: "/words/zzzz", status: 404, heading: "This page doesn't exist" },
);

const capitalized = observation(() => ({ path: location.pathname }), { path: "/words/enough" });

const phone = observation(
	() => ({
		path: location.pathname,
		h1: document.querySelector("main h1")?.textContent?.trim() ?? null,
		overflow: document.documentElement.scrollWidth > window.innerWidth,
	}),
	{ path: "/words/colonel", h1: "Colonel in IPA: /ˈkɝnəl/", overflow: false },
);

const soundPageLinks = observation(
	() => {
		const section = Array.from(document.querySelectorAll("main section")).find((s) =>
			(s.querySelector("h2")?.textContent ?? "").startsWith("Common words"),
		);
		const cells = Array.from(section?.querySelectorAll("li") ?? []);
		const cell = (word: string) => cells.find((li) => li.textContent?.trim() === word);
		return {
			path: location.pathname,
			enough: cell("enough")?.querySelector("a")?.getAttribute("href") ?? null,
			enoughPlays: !!cell("enough")?.querySelector('button[aria-label="Hear enough"]'),
			ifLink: cell("if")?.querySelector("a")?.getAttribute("href") ?? null,
			ifPlays: !!cell("if")?.querySelector('button[aria-label="Hear if"]'),
			linked: cells.flatMap((li) => {
				const href = li.querySelector("a")?.getAttribute("href");
				return href ? [href] : [];
			}),
		};
	},
	{
		path: "/sounds/f-fan",
		enough: "/words/enough",
		enoughPlays: true,
		ifLink: null,
		ifPlays: true,
		linked: ["/words/often", "/words/enough", "/words/half"],
	},
);

const popoverLink = (word: string, href: string | null) =>
	observation(
		() => {
			const popup = document.querySelector('[data-slot="popover-content"], [role="dialog"]');
			return {
				open: !!popup,
				href:
					Array.from(popup?.querySelectorAll("a") ?? [])
						.map((a) => a.getAttribute("href"))
						.find((h) => h?.startsWith("/words/")) ?? null,
			};
		},
		{ open: true, href },
	);

export const wordPages = {
	title: "Word pages",
	checkpoints: {
		enough,
		forms,
		pairs,
		sitemap,
		"not-found": notFound,
		capitalized,
		phone,
		"sound-page-links": soundPageLinks,
		"popover-enough": popoverLink("enough", "/words/enough"),
		"popover-and": popoverLink("and", null),
	},
	coverageLimits: [
		"canonical and robots come from the dev server; production values depend on SITE_URL and indexing",
		"audio playback is not checked beyond the recordings rendering as buttons",
		"word pages render on request in the Worker and are not prerendered; the production build is checked outside this journey",
		"the status comes from the navigation timing entry, so open each page directly before observing",
	],
	expectedResponses: [{ path: "/words/zzzz", status: 404 }],
} satisfies Feature;
