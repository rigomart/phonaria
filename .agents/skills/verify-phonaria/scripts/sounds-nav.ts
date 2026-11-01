import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.

function readHeader() {
	const label = (item: Element) => item.firstChild?.textContent?.trim() ?? "";
	const nav = document.querySelector('header nav[aria-label="Main"]');
	const items = Array.from(nav?.querySelectorAll(":scope > ul > li > :is(a, button)") ?? []);
	const menu = document.querySelector('[data-slot="navigation-menu-content"]');
	const visible = !!menu && menu.getClientRects().length > 0;
	const links = visible ? Array.from(menu?.querySelectorAll("a") ?? []) : [];
	const box = menu?.getBoundingClientRect();
	return {
		path: location.pathname,
		main: items.map(label),
		active: items.filter((item) => item.hasAttribute("data-nav-active")).map(label),
		current: items
			.filter((item) => item.hasAttribute("aria-current"))
			.map((item) => `${label(item)} ${item.getAttribute("aria-current")}`),
		tabRow: !!document.querySelector('header nav[aria-label="Sounds"]'),
		menuOpen: visible,
		menu: links.map((link) => `${link.textContent?.trim()} ${link.getAttribute("href")}`),
		menuCurrent: links
			.filter((link) => link.getAttribute("aria-current") === "page")
			.map((link) => link.textContent?.trim()),
		menuShaded: links
			.filter((link) => getComputedStyle(link).backgroundColor !== "rgba(0, 0, 0, 0)")
			.map((link) => link.textContent?.trim()),
		menuInView:
			!visible ||
			(!!box &&
				box.left >= 0 &&
				box.right <= window.innerWidth &&
				box.top >= 0 &&
				box.bottom <= window.innerHeight),
		overflow: document.documentElement.scrollWidth > window.innerWidth,
	};
}

const MAIN = ["Transcription", "Sounds", "Minimal pairs", "Practice", "History"];
const MENU = [
	"All sounds /sounds",
	"Consonant chart /ipa-chart/consonants",
	"Vowel chart /ipa-chart/vowels",
	"How common /ipa-chart/frequency",
];

const page = (path: string, active: string, current: "page" | "true") =>
	observation(readHeader, {
		path,
		main: MAIN,
		active: [active],
		current: [`${active} ${current}`],
		tabRow: false,
		menuOpen: false,
		menu: [],
		menuCurrent: [],
		menuShaded: [],
		menuInView: true,
		overflow: false,
	});

const menuOpen = (path: string, menuCurrent: string[]) =>
	observation(readHeader, {
		path,
		main: MAIN,
		active: ["Sounds"],
		current: ["Sounds true"],
		tabRow: false,
		menuOpen: true,
		menu: MENU,
		menuCurrent,
		menuShaded: menuCurrent,
		menuInView: true,
		overflow: false,
	});

const mobileMenu = observation(
	() => {
		const label = (link: Element) => link.textContent?.trim() ?? "";
		const menu = document.querySelector('[role="dialog"] nav[aria-label="Main"]');
		const links = Array.from(menu?.querySelectorAll("a") ?? []);
		const sounds = links.find((link) => label(link) === "Sounds");
		const pills = Array.from(sounds?.parentElement?.querySelectorAll(":scope > div a") ?? []);
		return {
			path: location.pathname,
			items: links.filter((link) => !pills.includes(link)).map(label),
			current: links
				.filter((link) => !pills.includes(link) && link.hasAttribute("aria-current"))
				.map((link) => `${label(link)} ${link.getAttribute("aria-current")}`),
			pills: pills.map((link) => `${label(link)} ${link.getAttribute("href")}`),
			activePill: pills.filter((link) => link.getAttribute("aria-current") === "page").map(label),
			pillsInView: pills.every((link) => link.getBoundingClientRect().right <= window.innerWidth),
		};
	},
	{
		path: "/ipa-chart/vowels",
		items: MAIN,
		current: ["Sounds true"],
		pills: MENU,
		activePill: ["Vowel chart"],
		pillsInView: true,
	},
);

export const soundsNav = {
	title: "Sounds menu in the header",
	checkpoints: {
		home: page("/", "Transcription", "page"),
		index: page("/sounds", "Sounds", "page"),
		consonants: page("/ipa-chart/consonants", "Sounds", "true"),
		"sound-page": page("/sounds/th-thin", "Sounds", "true"),
		"menu-open": menuOpen("/ipa-chart/vowels", ["Vowel chart"]),
		"menu-on-sound-page": menuOpen("/sounds/th-thin", []),
		"menu-closed": page("/ipa-chart/vowels", "Sounds", "true"),
		"keyboard-open": menuOpen("/ipa-chart/vowels", ["Vowel chart"]),
		"followed-link": page("/ipa-chart/frequency", "Sounds", "true"),
		narrow: page("/ipa-chart/frequency", "Sounds", "true"),
		"mobile-menu": mobileMenu,
	},
	coverageLimits: [
		"expects the local default flags, with Practice and History on",
		"the sliding indicator's position and the menu's animation are checked only in screenshots",
		"that the menu links are in the server-rendered HTML is checked with curl, outside this journey",
	],
} satisfies Feature;
