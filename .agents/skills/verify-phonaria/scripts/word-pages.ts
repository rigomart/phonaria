import { type Feature, observation } from "./feature";

// Runs in the browser after serialization; keep dependencies inside the body.
// Expected values come from #459's "You see" and from English facts: enough is
// /ɪˈnʌf/, spelled e, n, ou, gh; gh spells /f/ in tough; know pairs with now.

const enough = observation(
	() => {
		const main = document.querySelector("main");
		const breakdown = main?.querySelector('ol[aria-label^="Each group of letters"]');
		const unusual = Array.from(main?.querySelectorAll("section") ?? []).find((section) =>
			/unusual spelling/i.test(section.querySelector("h2")?.textContent ?? ""),
		);
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
			letters: Array.from(breakdown?.querySelectorAll("li") ?? []).map((li) => [
				li.firstElementChild?.textContent?.trim(),
				Array.from(li.querySelectorAll("a")).map((a) => [
					a.textContent?.trim(),
					a.getAttribute("href"),
				]),
			]),
			unusualStartsWith: unusual?.querySelector("p")?.textContent?.trim().slice(0, 17) ?? null,
			alsoIn: Array.from(unusual?.querySelectorAll("li") ?? []).map((li) => li.textContent?.trim()),
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
		h2: ["Letters and sounds", "An unusual spelling"],
		recordings: ["Hear enough"],
		letters: [
			["e", [["/ɪ/", "/sounds/ih-sit"]]],
			["n", [["/n/", "/sounds/n-sun"]]],
			["ou", [["/ʌ/", "/sounds/uh-cup"]]],
			["gh", [["/f/", "/sounds/f-fan"]]],
		],
		unusualStartsWith: "gh spells /f/ her",
		alsoIn: ["tough", "laugh", "laughing"],
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
	() => {
		const section = Array.from(document.querySelectorAll("main section")).find((s) =>
			(s.querySelector("h2")?.textContent ?? "").startsWith("Minimal pairs"),
		);
		return {
			path: location.pathname,
			heading: section?.querySelector("h2")?.textContent?.trim() ?? null,
			rows: Array.from(section?.querySelectorAll("li") ?? []).map((li) => [
				Array.from(li.querySelectorAll("button")).map((b) => b.textContent?.trim()),
				li.querySelector("a")?.getAttribute("href"),
			]),
		};
	},
	{
		path: "/words/know",
		heading: "Minimal pairs with know",
		rows: [[["know", "now"], "/minimal-pairs/ou-au"]],
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

export const wordPages = {
	title: "Word pages",
	checkpoints: { enough, forms, pairs, sitemap, "not-found": notFound, capitalized, phone },
	coverageLimits: [
		"canonical and robots come from the dev server; production values depend on SITE_URL and indexing",
		"audio playback is not checked beyond the recordings rendering as buttons",
		"word pages render on request in the Worker and are not prerendered; the production build is checked outside this journey",
		"the status comes from the navigation timing entry, so open each page directly before observing",
	],
	expectedResponses: [{ path: "/words/zzzz", status: 404 }],
} satisfies Feature;
