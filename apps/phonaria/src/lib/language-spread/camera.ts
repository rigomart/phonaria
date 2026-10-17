import { MAP_HEIGHT, MAP_WIDTH, project } from "./projection";

/** A region to frame, in degrees. `east` may pass 180 to frame across the Pacific. */
export type Bounds = { west: number; south: number; east: number; north: number };

/** Space covered by story cards, in pixels from each edge of the map viewport. */
export type Insets = { top: number; right: number; bottom: number; left: number };

export type Viewport = { width: number; height: number; insets: Insets };

/**
 * Where the camera looks: the map point at the center of the uncovered area,
 * and how many map units one screen pixel spans (smaller is closer).
 */
export type Camera = { x: number; y: number; unitsPerPixel: number };

/** The SVG viewBox for a camera, covering the whole viewport. */
export type View = { x: number; y: number; width: number; height: number };

const MAX_ZOOM = 8;
const PADDING = 0.12;

function freeArea({ width, height, insets }: Viewport) {
	return {
		width: Math.max(1, width - insets.left - insets.right),
		height: Math.max(1, height - insets.top - insets.bottom),
	};
}

/** Units per pixel at which the whole map fits the uncovered area. */
function worldUnitsPerPixel(viewport: Viewport): number {
	const free = freeArea(viewport);
	return Math.max(MAP_WIDTH / free.width, MAP_HEIGHT / free.height);
}

/** The camera that frames `bounds` inside the uncovered area, with a margin. */
export function fitCamera(bounds: Bounds, viewport: Viewport): Camera {
	const northWest = project(bounds.west, bounds.north);
	const southEast = project(bounds.east, bounds.south);
	const free = freeArea(viewport);
	const world = worldUnitsPerPixel(viewport);
	const fit =
		Math.max((southEast.x - northWest.x) / free.width, (southEast.y - northWest.y) / free.height) *
		(1 + PADDING * 2);
	const unitsPerPixel = Math.min(world, Math.max(world / MAX_ZOOM, fit));
	const camera = {
		x: (northWest.x + southEast.x) / 2,
		y: (northWest.y + southEast.y) / 2,
		unitsPerPixel,
	};
	return { ...camera, y: clampY(camera, viewport) };
}

/** Keeps the poles from scrolling into view when the map is taller than the free area. */
function clampY(camera: Camera, viewport: Viewport): number {
	const free = freeArea(viewport);
	const halfHeight = (free.height / 2) * camera.unitsPerPixel;
	if (halfHeight * 2 >= MAP_HEIGHT) return MAP_HEIGHT / 2;
	return Math.min(MAP_HEIGHT - halfHeight, Math.max(halfHeight, camera.y));
}

export function toView(camera: Camera, viewport: Viewport): View {
	const free = freeArea(viewport);
	const { unitsPerPixel: u } = camera;
	return {
		x: camera.x - (viewport.insets.left + free.width / 2) * u,
		y: camera.y - (viewport.insets.top + free.height / 2) * u,
		width: viewport.width * u,
		height: viewport.height * u,
	};
}

/** The copy of `x`, one map width apart, nearest to `center`. The map repeats east and west. */
export function nearestCopy(x: number, center: number): number {
	return x + MAP_WIDTH * Math.round((center - x) / MAP_WIDTH);
}

/** Moves the camera to the map copy within half a map of the middle one, which looks identical. */
export function normalizeCamera(camera: Camera): Camera {
	return { ...camera, x: nearestCopy(camera.x, MAP_WIDTH / 2) };
}

/**
 * The camera `t` of the way (0 to 1) from `from` to `to`. Zoom changes
 * geometrically so it feels even, and long moves pull back mid-flight so the
 * reader keeps their bearings. `to` is taken from the nearest map copy.
 */
export function interpolateCamera(from: Camera, to: Camera, t: number): Camera {
	const targetX = nearestCopy(to.x, from.x);
	const distance = Math.hypot(targetX - from.x, to.y - from.y);
	const closest = Math.min(from.unitsPerPixel, to.unitsPerPixel);
	const pullBack = Math.min(1, distance / (closest * 2000));
	const zoom = from.unitsPerPixel * (to.unitsPerPixel / from.unitsPerPixel) ** t;
	return {
		x: from.x + (targetX - from.x) * t,
		y: from.y + (to.y - from.y) * t,
		unitsPerPixel: zoom * (1 + pullBack * Math.sin(Math.PI * t)),
	};
}

/** Ease-in-out for camera flights. */
export function easeCamera(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
