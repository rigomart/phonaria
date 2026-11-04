import { type Feature, observation } from "./feature";

function readScroll() {
	const containsItsScroll = (node: HTMLElement) =>
		getComputedStyle(node).overscrollBehaviorY === "contain";
	const details = Array.from(document.querySelectorAll<HTMLElement>("[data-phoneme-details]")).find(
		containsItsScroll,
	);
	if (!details) return null;
	const box = details.getBoundingClientRect();
	const visibleBottom = Math.min(box.bottom, window.innerHeight);
	const stickyAncestor = (node: Element | null) => {
		for (let el = node; el && el !== details; el = el.parentElement) {
			if (getComputedStyle(el).position === "sticky") return el;
		}
		return null;
	};
	const title =
		details.querySelector("h2") ?? details.querySelector('button[aria-label^="More about"]');
	const pinned = stickyAncestor(title);
	const pinnedBottom = pinned ? pinned.getBoundingClientRect().bottom : box.top;
	const frequency = Array.from(details.querySelectorAll("p")).find((node) =>
		/most common of \d+ sounds/.test(node.textContent ?? ""),
	);
	const rect = frequency?.getBoundingClientRect();
	const frequencyPinned = !!stickyAncestor(frequency ?? null);
	const top = frequencyPinned ? box.top : pinnedBottom;
	return {
		scrolled: details.scrollTop > 0,
		titlePinned: !!pinned && Math.abs(pinned.getBoundingClientRect().top - box.top) < 1,
		closeInPinned: Array.from(pinned?.querySelectorAll("button") ?? []).some(
			(button) => button.textContent?.trim() === "Close",
		),
		frequencyPinned,
		frequencyVisible: !!rect && rect.top >= top - 1 && rect.bottom <= visibleBottom + 1,
	};
}

const atTop = observation(readScroll, {
	scrolled: false,
	titlePinned: true,
	closeInPinned: true,
	frequencyPinned: false,
	frequencyVisible: true,
});

const scrolled = observation(readScroll, {
	scrolled: true,
	titlePinned: true,
	closeInPinned: true,
	frequencyPinned: false,
	frequencyVisible: false,
});

export const detailsScroll = {
	title: "Full sound details scroll under the pinned sound name",
	checkpoints: {
		"panel-top": atTop,
		"panel-scrolled": scrolled,
		"drawer-compact": atTop,
		"drawer-scrolled": scrolled,
	},
	coverageLimits: [
		"pinning and visibility read from computed styles and bounding boxes; the look while scrolling checked by screenshot review only",
		"the drawer is expanded by its name button, not by a touch drag",
		"viewport screenshots and no DevTools trace, as in the merger-notes journey: full-page captures of the pinned panel, or tracing, stall the renderer",
	],
	screenshot: "viewport",
	trace: "skip",
} satisfies Feature;
