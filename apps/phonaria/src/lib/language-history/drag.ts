import { type Camera, visibleRadius, type Viewport } from "./camera";
import { angularDistance, RAD, wrapLongitude } from "./sphere";

/**
 * How a drag turns the globe: mice and pens turn it freely, while a finger
 * only spins it east or west, leaving vertical swipes to scroll the page.
 */
export type DragMode = "free" | "spin";

/** The view's center stays this far from the poles, so the globe never flips over. */
export const LATITUDE_LIMIT = 75;
/** Pixels a pointer moves before a press becomes a drag. */
export const DRAG_THRESHOLD = 4;
/** Decay time constant: release velocity halves about every 110 ms. */
export const INERTIA_MS = 160;
/** Below this speed, in pixels per ms, a glide stops. */
export const INERTIA_STOP = 0.02;
/** Fastest release, in pixels per ms. */
export const INERTIA_MAX = 3;
/** The view counts as dragged away once the step's center has moved this far on screen. */
export const AWAY_PX = 48;

export const clampLatitude = (lat: number) =>
	Math.max(-LATITUDE_LIMIT, Math.min(LATITUDE_LIMIT, lat));

/**
 * The camera after dragging the globe by (dx, dy) pixels. The place under the
 * pointer stays under it near the center of the view, so the turn scales with
 * the globe's radius on screen.
 */
export function dragCamera(camera: Camera, dx: number, dy: number, mode: DragMode): Camera {
	const degreesPerPixel = 1 / camera.radius / RAD;
	// A step east covers fewer degrees of longitude near the equator than near the poles.
	const cosLat = Math.max(0.2, Math.cos(camera.lat * RAD));
	return {
		...camera,
		lon: wrapLongitude(camera.lon - (dx * degreesPerPixel) / cosLat),
		lat: mode === "free" ? clampLatitude(camera.lat + dy * degreesPerPixel) : camera.lat,
	};
}

/** A glide's velocity, in pixels per ms, `elapsed` ms after it was `velocity`. */
export function decayVelocity(velocity: number, elapsed: number): number {
	return velocity * Math.exp(-elapsed / INERTIA_MS);
}

/** Release velocity, capped at INERTIA_MAX. */
export function releaseVelocity(vx: number, vy: number): [number, number] {
	const speed = Math.hypot(vx, vy);
	const scale = speed > INERTIA_MAX ? INERTIA_MAX / speed : 1;
	return [vx * scale, vy * scale];
}

/** Whether `camera` has been turned noticeably away from the step's own view, `home`. */
export function isAway(camera: Camera, home: Camera, viewport: Viewport): boolean {
	const distance = angularDistance([camera.lon, camera.lat], [home.lon, home.lat]);
	if (distance > visibleRadius(home, viewport)) return true;
	return camera.radius * Math.sin(distance) > AWAY_PX;
}
