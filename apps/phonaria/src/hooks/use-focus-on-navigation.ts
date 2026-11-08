import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

/** The id of the app shell's `<main>`, which the skip link targets. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * Moves focus to the main content: the page's h1, else `<main>` itself, without
 * scrolling to it.
 */
export function focusMainContent({ preferHeading = true } = {}): void {
	const main = document.getElementById(MAIN_CONTENT_ID);
	if (!main) return;
	const heading = preferHeading ? main.querySelector<HTMLElement>("h1") : null;
	if (heading && focusUntilBlur(heading)) return;
	focusUntilBlur(main);
}

/**
 * Focuses an element that isn't a control through a `tabindex="-1"` that lasts
 * until it loses focus. Left in place, a click on any text inside it would focus
 * it, and the next Tab would start from its top instead of from the click.
 */
function focusUntilBlur(element: HTMLElement): boolean {
	const added = !element.hasAttribute("tabindex");
	if (added) element.setAttribute("tabindex", "-1");
	element.focus({ preventScroll: true });
	const focused = document.activeElement === element;
	if (added && focused) {
		element.addEventListener("blur", () => element.removeAttribute("tabindex"), { once: true });
	} else if (added) {
		element.removeAttribute("tabindex");
	}
	return focused;
}

/**
 * Whether `element` holds focus only because a page change or the skip link
 * put it there, so features that act on "nothing focused" (typing to reach the
 * transcription field) still do.
 */
export function isMainContentFocus(element: Element): boolean {
	return (
		element.id === MAIN_CONTENT_ID ||
		(element.tagName === "H1" && element.closest(`#${MAIN_CONTENT_ID}`) !== null)
	);
}

/**
 * After an in-app move to another page, focus goes to the new page's h1 (or
 * `<main>`), so keyboard and screen reader users start reading there instead
 * of on the link they left. The first load keeps the browser's own start, and
 * a change of only the query or hash on the same path (another word on a
 * minimal-pair page) leaves focus where it is. A page that puts focus in its
 * content itself keeps it. Scrolling stays with the router's scroll restoration.
 */
export function useFocusOnNavigation(): void {
	const router = useRouter();

	useEffect(() => {
		let focusedBefore: Element | null = null;
		let frame = 0;

		const stopBefore = router.subscribe("onBeforeNavigate", (event) => {
			if (event.pathChanged) focusedBefore = document.activeElement;
		});
		const stopRendered = router.subscribe("onRendered", (event) => {
			if (!event.fromLocation || !event.pathChanged) return;
			const previous = focusedBefore;
			focusedBefore = null;
			cancelAnimationFrame(frame);
			// After the new page's own effects, so focus it placed is seen.
			frame = requestAnimationFrame(() => {
				const active = document.activeElement;
				const main = document.getElementById(MAIN_CONTENT_ID);
				const placedByPage =
					active !== null && active !== previous && main?.contains(active) && active !== main;
				if (!placedByPage) focusMainContent();
			});
		});

		return () => {
			stopBefore();
			stopRendered();
			cancelAnimationFrame(frame);
		};
	}, [router]);
}
