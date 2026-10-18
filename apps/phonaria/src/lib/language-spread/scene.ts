import { horizonOpacity } from "./sphere";

/** Where a step stands relative to the one being read. */
export type Phase = "past" | "current" | "future";

export const phaseOf = (stepIndex: number, active: number): Phase =>
	stepIndex < active ? "past" : stepIndex === active ? "current" : "future";

/**
 * How much of a step's arrows is drawn, and how strongly (1 for the step being
 * read, 0 muted). Future arrows are undrawn and keep whatever look they had.
 */
export const ROUTE_LOOK: Record<Phase, { progress: number; emphasis?: number }> = {
	past: { progress: 1, emphasis: 0 },
	current: { progress: 1, emphasis: 1 },
	future: { progress: 0 },
};

export const AREA_OPACITY: Record<Phase, number> = { past: 0.4, current: 1, future: 0 };

export const TIMING = {
	/** Each arrow of a step starts this long after the previous one. */
	routeStagger: 180,
	routeDraw: 900,
	/** Arrows of steps scrolled back past, or skipped over, are quick. */
	routeQuick: 400,
	emphasis: 500,
	areaFade: 700,
	/** Pins of one step appear this far apart. */
	pinStagger: 140,
} as const;

/**
 * When a step's arrows, areas and pins start to appear, in ms after the step
 * changes: once the camera is mostly there, so they appear in view.
 */
export function revealDelay(flightMs: number): number {
	return Math.round(flightMs * 0.6);
}

/**
 * A pin's head, in CSS pixels: as wide as its button and standing this tall
 * above its place, centred on it.
 */
export type PinHead = { width: number; height: number };

/**
 * Opacity of a pin at screen point (x, y) in a map `width` by `height`, whose
 * place has orthographic `z`. A pin counts as on the map when its head is
 * inside it for its full height and at least half its width; otherwise, or
 * behind the globe, it is 0, so it can be neither seen nor reached.
 */
export function pinOpacity(
	z: number,
	x: number,
	y: number,
	head: PinHead,
	width: number,
	height: number,
): number {
	const inside = Math.min(x + head.width / 2, width) - Math.max(x - head.width / 2, 0);
	const onMap = inside >= head.width / 2 && y - head.height >= 0 && y <= height;
	return onMap ? horizonOpacity(z) : 0;
}
