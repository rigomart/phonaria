import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
//
// Expected values are literals taken from the story data in
// apps/phonaria/src/lib/language-spread/story.ts and from the product requirements:
// 25 steps, 49 places, 80 spread routes, 12 main works. Routes drawn by step are cumulative:
// intro 0, africa 0, out-of-africa 2, americas 3, afroasiatic 8, sino-tibetan 11, indo-european 13,
// sahul-families 18, bantu 20, austronesian 24, ... empires 80, today 80.
//
// Camera bounds are the step's `camera` rectangle in degrees (west, south, east, north):
//   africa -20, -36, 55, 38   out-of-africa 20, -40, 150, 45   bantu -12, -36, 52, 16.
// The camera centre reads as "lon,lat" in data-camera-center. The zoom reads in data-camera-zoom,
// where 1 means the whole map is as wide as the screen. Measured at 1280 x 800: the intro and today
// sit at 0.54 and every zoomed-in step is above 1.2, so 1 separates "whole world" from "zoomed in".

const stepsInOrder = [
	"intro",
	"africa",
	"out-of-africa",
	"americas",
	"afroasiatic",
	"sino-tibetan",
	"indo-european",
	"sahul-families",
	"bantu",
	"austronesian",
	"southern-asia",
	"uralic",
	"americas-families",
	"oldest-texts",
	"east-asia",
	"lapita",
	"europe",
	"arabic",
	"indian-ocean",
	"steppe",
	"polynesia",
	"americas-late",
	"iberia",
	"empires",
	"today",
];

const intro = observation(
	() => {
		const region = document.querySelector(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const box = region?.getBoundingClientRect();
		const tile = document.querySelector("svg g[transform]");
		const routes = Array.from(tile?.querySelectorAll("path[pathLength]") ?? []);
		const sources = document.querySelector('section[aria-labelledby="language-spread-sources"]');
		const links = Array.from(sources?.querySelectorAll("a") ?? []);
		return {
			path: location.pathname,
			heading: document.querySelector("h1")?.textContent?.trim() ?? null,
			navCurrent:
				document
					.querySelector('nav[aria-label="Main"] a[href="/language-spread"]')
					?.getAttribute("aria-current") ?? null,
			robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			stepLabel: document.querySelector("p.sr-only")?.textContent?.trim() ?? null,
			steps: Array.from(document.querySelectorAll("li[data-step]")).map((item) =>
				item.getAttribute("data-step"),
			),
			ticks: document.querySelectorAll("ol[aria-hidden] > li").length,
			revealed: document.querySelectorAll("[data-stop][data-revealed]").length,
			stops: document.querySelectorAll("[data-stop]").length,
			routes: routes.length,
			drawn: routes.filter((route) => getComputedStyle(route).strokeDashoffset === "0px").length,
			pinnedTop: !!box && Math.abs(box.top - 48) <= 2,
			pinnedHeight: !!box && Math.abs(box.height - (innerHeight - 48)) <= 2,
			sources: {
				heading: sources?.querySelector("h2")?.textContent?.trim() ?? null,
				links: links.length,
				https: links.every((link) => link.getAttribute("href")?.startsWith("https://")),
			},
		};
	},
	{
		path: "/language-spread",
		heading: "How languages spread",
		navCurrent: "page",
		robots: "noindex, follow",
		era: "~70,000 years ago",
		step: "intro",
		stepLabel: "Step 1 of 25",
		steps: stepsInOrder,
		ticks: 25,
		revealed: 0,
		stops: 49,
		routes: 80,
		drawn: 0,
		pinnedTop: true,
		pinnedHeight: true,
		sources: { heading: "Sources", links: 12, https: true },
	},
);

const outOfAfrica = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const box = region?.getBoundingClientRect();
		const tile = document.querySelector("svg g[transform]");
		const routes = Array.from(tile?.querySelectorAll("path[pathLength]") ?? []);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const label = (id: string) => {
			const text = document.querySelector(`[data-stop="${id}"] > span:last-child`);
			return text?.getClientRects().length ? (text.textContent?.trim() ?? null) : null;
		};
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			stepLabel: document.querySelector("p.sr-only")?.textContent?.trim() ?? null,
			revealed: Array.from(document.querySelectorAll("[data-stop][data-revealed]")).map((pin) =>
				pin.getAttribute("data-stop"),
			),
			labels: {
				"humans-in-africa": label("humans-in-africa"),
				"leaving-africa": label("leaving-africa"),
				sahul: label("sahul"),
			},
			drawn: routes.filter((route) => getComputedStyle(route).strokeDashoffset === "0px").length,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= 20 && lon <= 150 && lat >= -40 && lat <= 45,
			zoomedIn: Number(region?.dataset.cameraZoom) > 1,
			pinnedTop: !!box && Math.abs(box.top - 48) <= 2,
			pinnedHeight: !!box && Math.abs(box.height - (innerHeight - 48)) <= 2,
		};
	},
	{
		era: "~60,000 years ago",
		step: "out-of-africa",
		stepLabel: "Step 3 of 25",
		revealed: ["humans-in-africa", "leaving-africa", "sahul"],
		labels: {
			"humans-in-africa": null,
			"leaving-africa": "Leaving Africa",
			sahul: "Reaching Australia",
		},
		drawn: 2,
		camera: "settled",
		centerInBounds: true,
		zoomedIn: true,
		pinnedTop: true,
		pinnedHeight: true,
	},
);

// Reads the details panel for whichever place is open, and the opener's state.
const detailsOpen = () => {
	const panel = document.querySelector("[data-stop-details]");
	const id = panel?.getAttribute("data-stop-details") ?? null;
	const paragraphs = Array.from(panel?.querySelectorAll("p") ?? []).map((p) =>
		p.textContent?.trim(),
	);
	return {
		panel: id,
		inLiveRegion: !!panel?.closest("[aria-live]"),
		name: panel?.querySelector("h3")?.textContent?.trim() ?? null,
		kindAndDate: paragraphs[0] ?? null,
		description: paragraphs[1] ?? null,
		area: paragraphs[2] ?? null,
		sources: panel?.querySelector("details > summary")?.textContent?.trim() ?? null,
		close: !!panel?.querySelector(
			`button[aria-label="Close ${panel.querySelector("h3")?.textContent?.trim()}"]`,
		),
		pinExpanded: id
			? document.querySelector(`[data-stop="${id}"]`)?.getAttribute("aria-expanded")
			: null,
		era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
		step:
			document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? null,
	};
};

// Sino-Tibetan belongs to an earlier step. At "austronesian" its pin is on screen, clear of the
// cards and the era indicator, while the Bantu pin is off the left edge (x of about -140).
const earlierPin = observation(detailsOpen, {
	panel: "sino-tibetan",
	inLiveRegion: true,
	name: "Sino-Tibetan",
	kindAndDate: "Language family, ~7,200–5,900 years ago",
	description:
		"Chinese, Tibetan and Burmese share an ancestor. Two studies of language trees place it among millet farmers on the Yellow River; other scholars place it in the eastern Himalaya, where the family's branches are most varied.",
	area: "Roughly the middle Yellow River in northern China, in two dated studies; others favour the eastern Himalaya. The pin marks the general area, not an exact spot.",
	sources: "Sources (3)",
	close: true,
	pinExpanded: "true",
	era: "~3000 BCE",
	step: "austronesian",
});

const detailsClosed = observation(
	() => ({
		panel: document.querySelector("[data-stop-details]") !== null,
		focus: document.activeElement?.getAttribute("data-stop") ?? null,
		pinExpanded: document
			.querySelector('[data-stop="sino-tibetan"]')
			?.getAttribute("aria-expanded"),
		step:
			document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? null,
	}),
	{ panel: false, focus: "sino-tibetan", pinExpanded: "false", step: "austronesian" },
);

const chipKeyboard = observation(
	() => {
		const chip = document.querySelector(
			'[data-step="austronesian"] ul[aria-label="Places on the map"] button[aria-label="Austronesian, show details"]',
		);
		const panel = document.querySelector("[data-stop-details]");
		return {
			panel: panel?.getAttribute("data-stop-details") ?? null,
			name: panel?.querySelector("h3")?.textContent?.trim() ?? null,
			sources: panel?.querySelector("details > summary")?.textContent?.trim() ?? null,
			chipExpanded: chip?.getAttribute("aria-expanded") ?? null,
			chipFocused: !!chip && document.activeElement === chip,
		};
	},
	{
		panel: "austronesian",
		name: "Austronesian",
		sources: "Sources (3)",
		chipExpanded: "true",
		chipFocused: true,
	},
);

const scrollBack = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const tile = document.querySelector("svg g[transform]");
		const routes = Array.from(tile?.querySelectorAll("path[pathLength]") ?? []);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const later = (id: string) => {
			const pin = document.querySelector(`[data-stop="${id}"]`);
			return {
				inert: pin?.closest("li")?.hasAttribute("inert") ?? null,
				revealed: pin?.hasAttribute("data-revealed") ?? null,
			};
		};
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			stepLabel: document.querySelector("p.sr-only")?.textContent?.trim() ?? null,
			revealed: Array.from(document.querySelectorAll("[data-stop][data-revealed]")).map((pin) =>
				pin.getAttribute("data-stop"),
			),
			sahul: later("sahul"),
			bantu: later("bantu"),
			drawn: routes.filter((route) => getComputedStyle(route).strokeDashoffset === "0px").length,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -20 && lon <= 55 && lat >= -36 && lat <= 38,
			zoomedIn: Number(region?.dataset.cameraZoom) > 1,
		};
	},
	{
		era: "~70,000 years ago",
		step: "africa",
		stepLabel: "Step 2 of 25",
		revealed: ["humans-in-africa"],
		sahul: { inert: true, revealed: false },
		bantu: { inert: true, revealed: false },
		drawn: 0,
		camera: "settled",
		centerInBounds: true,
		zoomedIn: true,
	},
);

// 24 earlier ticks are past-coloured and the last is current, so none keeps the unfilled border colour.
const today = observation(
	() => {
		const tile = document.querySelector("svg g[transform]");
		const routes = Array.from(tile?.querySelectorAll("path[pathLength]") ?? []);
		const ticks = Array.from(document.querySelectorAll("ol[aria-hidden] > li"));
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			stepLabel: document.querySelector("p.sr-only")?.textContent?.trim() ?? null,
			revealed: document.querySelectorAll("[data-stop][data-revealed]").length,
			inert: document.querySelectorAll("[data-stop]:not([data-revealed])").length,
			drawn: routes.filter((route) => getComputedStyle(route).strokeDashoffset === "0px").length,
			filledTicks: ticks.filter((tick) => !tick.classList.contains("bg-border")).length,
			ticks: ticks.length,
		};
	},
	{
		era: "Today",
		step: "today",
		stepLabel: "Step 25 of 25",
		revealed: 49,
		inert: 0,
		drawn: 80,
		filledTicks: 25,
		ticks: 25,
	},
);

// Phone, 390 x 844: the cards stick to the bottom edge and the camera frames Africa above them.
const mobile = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const box = region?.getBoundingClientRect();
		const card = document.querySelector('[data-step="bantu"] article')?.getBoundingClientRect();
		const era = document.querySelector("[data-era]")?.getBoundingClientRect();
		const pin = document.querySelector('[data-stop="bantu"]')?.getBoundingClientRect();
		return {
			width: innerWidth,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			camera: region?.dataset.camera ?? null,
			pinnedTop: !!box && Math.abs(box.top - 48) <= 2,
			pinnedHeight: !!box && Math.abs(box.height - (innerHeight - 48)) <= 2,
			cardAtBottom: !!card && card.bottom <= innerHeight && card.bottom >= innerHeight - 40,
			eraInTop: !!era && era.width > 0 && era.top >= 0 && era.bottom <= 160,
			pinAboveCard: !!pin && !!card && pin.top >= 0 && pin.bottom < card.top,
			pinOnScreen: !!pin && pin.left >= 0 && pin.right <= innerWidth,
		};
	},
	{
		width: 390,
		step: "bantu",
		camera: "settled",
		pinnedTop: true,
		pinnedHeight: true,
		cardAtBottom: true,
		eraInTop: true,
		pinAboveCard: true,
		pinOnScreen: true,
	},
);

// With reduced motion Tailwind's motion-reduce:transition-none computes transition-property to
// "none" (the duration keeps its 0.9s and 0.4s defaults but no property transitions), so nothing animates.
const reducedMotion = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const route = document.querySelector("path[pathLength]");
		const pin = document.querySelector('[data-stop="bantu"]');
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		return {
			reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -12 && lon <= 52 && lat >= -36 && lat <= 16,
			routeTransition: route ? getComputedStyle(route).transitionProperty : null,
			pinTransition: pin ? getComputedStyle(pin).transitionProperty : null,
		};
	},
	{
		reduced: true,
		era: "~3000 BCE",
		step: "bantu",
		camera: "settled",
		centerInBounds: true,
		routeTransition: "none",
		pinTransition: "none",
	},
);

export const languageSpread = {
	title: "Language Spread story page",
	checkpoints: {
		intro,
		"out-of-africa": outOfAfrica,
		"earlier-pin-mid-story": earlierPin,
		"details-closed": detailsClosed,
		"chip-keyboard": chipKeyboard,
		"scroll-back": scrollBack,
		today,
		mobile,
		"reduced-motion": reducedMotion,
	},
	coverageLimits: [
		"Chromium only, with the page flag on; flag-off behaviour is the separate language-spread-off journey",
		"camera placement is checked as a centre inside the step's bounds and a zoom above 1; pin positions, projection accuracy, map art, the tilt and visual quality are reviewed in screenshots only",
		"no frame rate or flight smoothness is measured; a settled attribute proves the flight ended, not that it looked right",
		"only some steps are exercised (intro, africa, out-of-africa, austronesian, bantu, today); the rest are covered by the story data tests",
		"route drawing is read from stroke-dashoffset, not from what is painted; the arrowheads and the dash animation are not observed",
		"phone coverage is one step at 390 x 844 and skips the menu and landscape; the desktop nav is not asserted there",
		"reduced motion is checked through computed transition properties and a 300 ms settle, not by comparing frames",
		"place descriptions and sources are read from the page, not checked against the cited studies",
	],
} satisfies Feature;

export const languageSpreadOff = {
	title: "Language Spread flag off",
	checkpoints: {
		"not-found": observation(
			() => ({
				path: location.pathname,
				status: (
					performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
				)?.responseStatus,
				heading: document.querySelector("h1")?.textContent?.trim() ?? null,
				map: !!document.querySelector(
					'[role="region"][aria-label^="Map of where languages spread"]',
				),
				stops: document.querySelectorAll("[data-stop]").length,
				navLinks: Array.from(document.querySelectorAll('nav[aria-label="Main"] a')).map((link) =>
					link.textContent?.trim(),
				),
			}),
			{
				path: "/language-spread",
				status: 404,
				heading: "This page doesn't exist",
				map: false,
				stops: 0,
				navLinks: ["Transcription", "IPA Chart", "Practice"],
			},
		),
		"nav-hidden": observation(
			() => ({
				path: location.pathname,
				navLinks: Array.from(document.querySelectorAll('nav[aria-label="Main"] a')).map((link) =>
					link.textContent?.trim(),
				),
				visible: Array.from(document.querySelectorAll('nav[aria-label="Main"] a')).every(
					(link) => link.getClientRects().length > 0,
				),
				spreadLinks: document.querySelectorAll('a[href="/language-spread"]').length,
			}),
			{
				path: "/",
				navLinks: ["Transcription", "IPA Chart", "Practice"],
				visible: true,
				spreadLinks: 0,
			},
		),
	},
	coverageLimits: [
		"Chromium desktop only; the phone menu is not opened, but any link to the page anywhere in the DOM is counted",
		"the status comes from the navigation timing entry of the first page load, so open the page directly before observing",
		"Practice is on locally unless FLAG_PRACTICE=0, so the expected labels include it",
		"the server must be started with FLAG_LANGUAGE_SPREAD=0; the journey cannot tell whether it was",
	],
} satisfies Feature;
