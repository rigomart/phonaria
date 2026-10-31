import { type Feature, observation } from "./feature";

// Runs in the browser after serialization; keep dependencies inside the body.
// Expected values come from the About page request in #264: production-live
// tools only, indexable, linked from the footer before Credits.

const page = observation(
	() => {
		const main = document.querySelector("main");
		const footerLinks = Array.from(document.querySelectorAll("footer a")).map((a) =>
			a.textContent?.trim(),
		);
		return {
			path: location.pathname,
			title: document.title,
			robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
			canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
			ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? null,
			h1: Array.from(main?.querySelectorAll("h1") ?? []).map((h) => h.textContent?.trim()),
			h2: Array.from(main?.querySelectorAll("h2") ?? []).map((h) => h.textContent?.trim()),
			tools: Array.from(main?.querySelectorAll('[data-about="tools"] a') ?? []).map((a) =>
				a.getAttribute("href"),
			),
			unreleased: Array.from(main?.querySelectorAll("a") ?? []).some((a) =>
				/^\/(practice|history)/.test(a.getAttribute("href") ?? ""),
			),
			recordings: Array.from(main?.querySelectorAll("button[data-status]") ?? []).filter((b) =>
				["pick", "peak"].includes(b.textContent?.trim() ?? ""),
			).length,
			boardSounds: main?.querySelectorAll('[data-about="board"] button').length ?? 0,
			footerAboutBeforeCredits:
				footerLinks.indexOf("About") >= 0 &&
				footerLinks.indexOf("About") < footerLinks.indexOf("Credits"),
			overflow: document.documentElement.scrollWidth > window.innerWidth,
		};
	},
	{
		path: "/about",
		title: "About - Phonaria",
		// SITE_INDEXING_ENABLED is unset locally, so every page says noindex.
		robots: "noindex, follow",
		canonical: "http://localhost:3000/about",
		ogTitle: "About",
		h1: ["About Phonaria"],
		h2: ["The tools", "How pronunciation improves"],
		tools: ["/", "/ipa-chart/consonants", "/sounds", "/minimal-pairs"],
		unreleased: false,
		recordings: 2,
		boardSounds: 12,
		footerAboutBeforeCredits: true,
		overflow: false,
	},
);

const soundDetails = observation(
	() => ({
		open: !!document.querySelector("[data-phoneme-details]"),
		theta: document.querySelector("[data-phoneme-details]")?.textContent?.includes("θ") ?? false,
	}),
	{ open: true, theta: true },
);

const sitemap = observation(
	() => ({
		about: Array.from(document.querySelectorAll("loc")).some((loc) =>
			loc.textContent?.trim().endsWith("/about"),
		),
	}),
	{ about: true },
);

export const about = {
	title: "About page",
	checkpoints: { page, "sound-details": soundDetails, sitemap },
	coverageLimits: [
		"robots and canonical are read from the dev server; production values depend on SITE_URL and indexing",
		"audio playback is not checked beyond the recordings rendering as buttons",
		"prerendering is checked by the production build, outside this journey",
	],
} satisfies Feature;
