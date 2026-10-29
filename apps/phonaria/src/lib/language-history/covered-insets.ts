import type { Insets } from "./camera";

type Rect = Pick<DOMRect, "top" | "right" | "bottom" | "left">;

const freeArea = (container: Rect, insets: Insets) =>
	Math.max(0, container.right - container.left - insets.left - insets.right) *
	Math.max(0, container.bottom - container.top - insets.top - insets.bottom);

/**
 * How far UI floating over the map reaches in from each edge of `container`,
 * so the camera can frame a region in the space left free. The era dial spans
 * the top. The card is cleared by cutting off whichever edge of the map it
 * sits against that leaves the largest free rectangle: a side for a tall card,
 * the bottom for a phone's full-width card. `margin` is kept from every edge,
 * `gap` between the free area and the UI.
 */
export function coveredInsets({
	container,
	card,
	dial,
	margin,
	gap,
}: {
	container: Rect;
	card?: Rect;
	dial?: Rect;
	margin: number;
	gap: number;
}): Insets {
	const base: Insets = {
		top: dial ? Math.max(margin, dial.bottom - container.top + gap) : margin,
		right: margin,
		bottom: margin,
		left: margin,
	};
	if (!card || card.right <= card.left) return base;
	const cuts: Insets[] = [
		{ ...base, left: Math.max(base.left, card.right - container.left + gap) },
		{ ...base, right: Math.max(base.right, container.right - card.left + gap) },
		{ ...base, top: Math.max(base.top, card.bottom - container.top + gap) },
		{ ...base, bottom: Math.max(base.bottom, container.bottom - card.top + gap) },
	];
	return cuts.reduce((best, cut) =>
		freeArea(container, cut) > freeArea(container, best) ? cut : best,
	);
}
