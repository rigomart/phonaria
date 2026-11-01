import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// The steps and expected values are the ones #425 reports: the head after an
// in-app move must describe the new page, as it does on a direct load.

function readHead() {
	const path = (href: string | null | undefined) => (href ? new URL(href).pathname : null);
	const hrefs = Array.from(document.querySelectorAll('link[rel="canonical"]'), (link) =>
		link.getAttribute("href"),
	);
	const ogUrls = Array.from(document.querySelectorAll('meta[property="og:url"]'), (meta) =>
		meta.getAttribute("content"),
	);
	const breadcrumbs = Array.from(
		document.querySelectorAll('script[type="application/ld+json"]'),
		(script) => {
			try {
				return JSON.parse(script.textContent ?? "");
			} catch {
				return null;
			}
		},
	)
		.filter((data) => data?.["@type"] === "BreadcrumbList")
		.map((data) => (data.itemListElement as { item: string }[]).map((entry) => entry.item));
	const urls = [...hrefs, ...ogUrls, ...breadcrumbs.flat()].filter(Boolean) as string[];
	return {
		path: location.pathname,
		inAppMove: (window as unknown as { __setBeforeMove?: boolean }).__setBeforeMove === true,
		title: document.title,
		canonical: hrefs.map(path),
		ogUrl: ogUrls.map(path),
		breadcrumbs: breadcrumbs.map((items) => items.map(path)),
		origins: new Set(urls.map((url) => new URL(url).origin)).size,
	};
}

const direct = observation(readHead, {
	path: "/sounds/th-thin",
	inAppMove: false,
	title: "How to pronounce the voiceless TH sound /θ/ (as in 'thin') - Phonaria",
	canonical: ["/sounds/th-thin"],
	ogUrl: ["/sounds/th-thin"],
	breadcrumbs: [["/sounds", "/sounds/th-thin"]],
	origins: 1,
});

const afterMove = observation(readHead, {
	path: "/minimal-pairs/th-t",
	inAppMove: true,
	title: "Three vs tree: /θ/ and /t/ minimal pairs with audio - Phonaria",
	canonical: ["/minimal-pairs/th-t"],
	ogUrl: ["/minimal-pairs/th-t"],
	breadcrumbs: [["/minimal-pairs", "/minimal-pairs/th-t"]],
	origins: 1,
});

export const headNavigation = {
	title: "Document head follows in-app navigation",
	checkpoints: { direct, "after-move": afterMove },
	coverageLimits: [
		"one move, from a sound page to a contrast page; other route pairs share the same head plumbing but are not exercised",
		"canonical and JSON-LD origins come from SITE_URL, which differs per target, so only paths and a single shared origin are compared",
	],
} satisfies Feature;
