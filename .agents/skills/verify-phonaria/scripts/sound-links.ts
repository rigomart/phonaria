import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected slugs are the ones reviewed in #392 (PR #399); the "Open full page"
// link is the one #394 asks for.

function readOpenTile() {
	const tile = document.querySelector("[data-details-open]");
	const details = document.querySelector("[data-phoneme-details]");
	const dialog = details?.closest("[aria-labelledby]");
	const page = Array.from(details?.querySelectorAll("a") ?? []).find(
		(link) => link.textContent?.trim() === "Open full page",
	);
	return {
		path: location.pathname,
		tag: tile?.tagName.toLowerCase() ?? null,
		label: tile?.getAttribute("aria-label") ?? null,
		href: tile?.getAttribute("href") ?? null,
		title:
			document.getElementById(dialog?.getAttribute("aria-labelledby") ?? "")?.textContent?.trim() ??
			null,
		pageLink: page?.getAttribute("href") ?? null,
	};
}

const consonantTile = observation(readOpenTile, {
	path: "/ipa-chart/consonants",
	tag: "a",
	label: "Voiceless dental fricative (θ)",
	href: "/sounds/th-thin",
	title: "Voiceless TH /θ/",
	pageLink: "/sounds/th-thin",
});

const vowelTile = observation(readOpenTile, {
	path: "/ipa-chart/vowels",
	tag: "a",
	label: "Near-open front unrounded vowel (æ)",
	href: "/sounds/ae-cat",
	title: "Short A /æ/",
	pageLink: "/sounds/ae-cat",
});

const frequencyRow = observation(readOpenTile, {
	path: "/ipa-chart/frequency",
	tag: "a",
	label: "/ʃ/ as in shop: 33rd, 0.8%",
	href: "/sounds/sh-shop",
	title: "SH /ʃ/",
	pageLink: "/sounds/sh-shop",
});

const fullPage = observation(
	() => ({
		path: location.pathname,
		h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent?.trim()),
		details: document.querySelectorAll("[data-phoneme-details]").length,
	}),
	{ path: "/sounds/th-thin", h1: ["Voiceless TH /θ/"], details: 1 },
);

const sitemap = observation(
	() => {
		const locs = Array.from(
			document.getElementsByTagName("loc"),
			(loc) => new URL(loc.textContent ?? "").pathname,
		);
		return {
			sounds: locs.filter((path) => path === "/sounds").length,
			soundPages: locs.filter((path) => path.startsWith("/sounds/")).length,
			thThin: locs.includes("/sounds/th-thin"),
		};
	},
	{ sounds: 1, soundPages: 40, thThin: true },
);

export const soundLinks = {
	title: "Chart tiles and the details link to sound pages",
	checkpoints: {
		"consonant-tile": consonantTile,
		"open-full-page": fullPage,
		"vowel-tile": vowelTile,
		"frequency-row": frequencyRow,
		sitemap,
	},
	coverageLimits: [
		"cmd/ctrl-click and middle-click following the link are proved by the browser contract's charts spec, not here",
		"en-us only; es-419 has no sound pages",
	],
} satisfies Feature;
