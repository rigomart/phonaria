import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches. False on the server and during hydration, so
 * anything it opens appears only after the page is interactive.
 */
export function useMediaQuery(query: string): boolean {
	return useSyncExternalStore(
		(onChange) => {
			const list = window.matchMedia(query);
			list.addEventListener("change", onChange);
			return () => list.removeEventListener("change", onChange);
		},
		() => window.matchMedia(query).matches,
		() => false,
	);
}
