import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";

const DURATION_MS = 280;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

/**
 * Moves tracked elements from where they were to where an update puts them
 * (FLIP). A key may land on a different element after the update, such as a
 * small faded variant becoming the large active transcription: the new element
 * starts at the old one's position and scale, so it reads as one moving thing.
 * Rects are read mid-flight, so a second swap starts from what is on screen.
 */
export function useSwapAnimation<K>() {
	const nodes = useRef(new Map<K, HTMLElement>());

	const track = useCallback(
		(key: K) => (node: HTMLElement | null) => {
			if (!node) return;
			nodes.current.set(key, node);
			return () => {
				if (nodes.current.get(key) === node) nodes.current.delete(key);
			};
		},
		[],
	);

	const swap = useCallback((update: () => void) => {
		const first = new Map<K, DOMRect>();
		for (const [key, node] of nodes.current) {
			first.set(key, node.getBoundingClientRect());
			for (const animation of node.getAnimations()) animation.cancel();
		}

		flushSync(update);

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		for (const [key, node] of nodes.current) {
			const from = first.get(key);
			const to = node.getBoundingClientRect();
			if (!from || to.height === 0) continue;

			const dx = from.left + from.width / 2 - (to.left + to.width / 2);
			const dy = from.top + from.height / 2 - (to.top + to.height / 2);
			const scale = from.height / to.height;
			if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(scale - 1) < 0.01) continue;

			node.animate(
				[{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` }, { transform: "none" }],
				{ duration: DURATION_MS, easing: EASING },
			);
		}
	}, []);

	return { track, swap };
}
