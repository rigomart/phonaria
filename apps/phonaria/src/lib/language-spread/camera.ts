import { geoInterpolate } from "d3-geo";
import { angularDistance, invertOrthographic, orthographic, wrapLongitude } from "./sphere";
import { easeInOut } from "./tween";

/** A region to frame, in degrees. `east` may pass 180 to frame across the Pacific. */
export type Bounds = { west: number; south: number; east: number; north: number };

/** Space covered by story cards, in pixels from each edge of the map viewport. */
export type Insets = { top: number; right: number; bottom: number; left: number };

export type Viewport = { width: number; height: number; insets: Insets };

/**
 * Where the camera looks: the place drawn at screen point (x, y), the middle
 * of the area the cards leave free, and the globe's radius in pixels.
 */
export type Camera = { lon: number; lat: number; radius: number; x: number; y: number };

/** The whole globe, as a share of the free area it would exactly fill. */
export const GLOBE_FIT = 0.88;
const MAX_ZOOM = 32;
/** Margin around a framed region, as a share of the free area on each side. */
const PADDING = 0.12;
const GRID = 9;
const CENTERING_PASSES = 4;

function freeArea({ width, height, insets }: Viewport) {
	const free = {
		width: Math.max(1, width - insets.left - insets.right),
		height: Math.max(1, height - insets.top - insets.bottom),
	};
	return { ...free, x: insets.left + free.width / 2, y: insets.top + free.height / 2 };
}

/** Radius at which the globe exactly fills the free area: zoom 1. */
export function unitRadius(viewport: Viewport): number {
	const { width, height } = freeArea(viewport);
	return Math.min(width, height) / 2;
}

export function zoomOf(camera: Camera, viewport: Viewport): number {
	return camera.radius / unitRadius(viewport);
}

/** Places on the far side count at the globe's edge. */
function measure(bounds: Bounds, center: readonly [number, number]) {
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	const point = { x: 0, y: 0, z: 0 };
	for (let i = 0; i < GRID; i += 1) {
		const lon = bounds.west + ((bounds.east - bounds.west) * i) / (GRID - 1);
		for (let j = 0; j < GRID; j += 1) {
			const lat = bounds.south + ((bounds.north - bounds.south) * j) / (GRID - 1);
			orthographic(lon, lat, center, point);
			let { x, y } = point;
			if (point.z < 0) {
				const rho = Math.hypot(x, y) || 1;
				x /= rho;
				y /= rho;
			}
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
	}
	return { minX, maxX, minY, maxY };
}

/** The camera that frames `bounds` in the free area with a margin. A region wider than the visible half of the globe gets the whole globe. */
export function fitCamera(bounds: Bounds, viewport: Viewport): Camera {
	let center: [number, number] = [
		(bounds.west + bounds.east) / 2,
		(bounds.south + bounds.north) / 2,
	];
	let extent = measure(bounds, center);
	for (let pass = 0; pass < CENTERING_PASSES; pass += 1) {
		center = invertOrthographic(
			(extent.minX + extent.maxX) / 2,
			(extent.minY + extent.maxY) / 2,
			center,
		);
		extent = measure(bounds, center);
	}
	const free = freeArea(viewport);
	const unit = unitRadius(viewport);
	const fit =
		Math.min(free.width / (extent.maxX - extent.minX), free.height / (extent.maxY - extent.minY)) *
		(1 - PADDING * 2);
	return {
		lon: wrapLongitude(center[0]),
		lat: center[1],
		radius: Math.min(unit * MAX_ZOOM, Math.max(unit * GLOBE_FIT, fit)),
		x: free.x,
		y: free.y,
	};
}

/**
 * Angular radius, in radians, of the largest circle around the camera's
 * center that fits in the free area: a quarter turn once the whole globe shows.
 */
export function visibleRadius(camera: Camera, viewport: Viewport): number {
	return Math.asin(Math.min(1, unitRadius(viewport) / camera.radius));
}

/** A move is far when it travels more than this many times the wider view's visible radius. */
const FAR_FACTOR = 1.5;
const MIN_FLIGHT_MS = 900;
const MAX_FLIGHT_MS = 2200;
const PACE_SAMPLES = 64;

export type Flight = {
	from: Camera;
	to: Camera;
	/** Great-circle distance between the two centers, in radians. */
	distance: number;
	/** Far flights pull back toward the whole globe mid-flight; near ones only pan and zoom. */
	far: boolean;
	/** Globe radius halfway through a far flight. */
	peakRadius: number;
	duration: number;
	/** Share of the turn done at each of PACE_SAMPLES + 1 evenly spaced moments of eased time. */
	pace: Float64Array;
	interpolate: (t: number) => [number, number];
};

/**
 * Whether the move from `from` to `to` should pull back first: when the
 * destination lies further than FAR_FACTOR visible radii of the wider of the
 * two views, panning would sweep the screen too fast to follow.
 */
export function isFarMove(from: Camera, to: Camera, viewport: Viewport): boolean {
	const distance = angularDistance([from.lon, from.lat], [to.lon, to.lat]);
	const wider = Math.max(visibleRadius(from, viewport), visibleRadius(to, viewport));
	return distance > FAR_FACTOR * wider;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function logRadius(flight: Pick<Flight, "from" | "to" | "far" | "peakRadius">, s: number): number {
	const from = Math.log(flight.from.radius);
	const to = Math.log(flight.to.radius);
	if (!flight.far) return from + (to - from) * s;
	const peak = Math.log(flight.peakRadius);
	return s < 0.5
		? from + (peak - from) * smoothstep(s * 2)
		: peak + (to - peak) * smoothstep(s * 2 - 1);
}

function pullBackRadius(from: Camera, to: Camera, distance: number, viewport: Viewport): number {
	return Math.min(
		from.radius,
		to.radius,
		(unitRadius(viewport) * GLOBE_FIT) / Math.sin(Math.min(Math.PI / 2, distance)),
	);
}

/** Plans a flight; `near` skips the pull-back, as when returning to the step from a drag. */
export function planFlight(
	from: Camera,
	to: Camera,
	viewport: Viewport,
	{ near = false }: { near?: boolean } = {},
): Flight {
	const distance = angularDistance([from.lon, from.lat], [to.lon, to.lat]);
	const far = !near && isFarMove(from, to, viewport);
	const peakRadius = far
		? pullBackRadius(from, to, distance, viewport)
		: Math.max(from.radius, to.radius);
	const plan = { from, to, far, peakRadius };
	// Turn at a steady speed on screen, so the turn follows the zoom.
	const pace = new Float64Array(PACE_SAMPLES + 1);
	for (let i = 1; i <= PACE_SAMPLES; i += 1) {
		const s = (i - 0.5) / PACE_SAMPLES;
		pace[i] = pace[i - 1] + 1 / Math.exp(logRadius(plan, s));
	}
	for (let i = 1; i <= PACE_SAMPLES; i += 1) pace[i] /= pace[PACE_SAMPLES];
	const zoomTravel = far
		? Math.abs(Math.log(from.radius / peakRadius)) + Math.abs(Math.log(to.radius / peakRadius))
		: Math.abs(Math.log(to.radius / from.radius));
	const duration = Math.min(
		MAX_FLIGHT_MS,
		Math.max(MIN_FLIGHT_MS, 700 + (900 * distance) / Math.PI + 180 * zoomTravel),
	);
	return {
		...plan,
		distance,
		duration,
		pace,
		interpolate: geoInterpolate([from.lon, from.lat], [to.lon, to.lat]),
	};
}

/** Share of the great-circle turn done at eased time `s`. */
function turnAt(flight: Flight, s: number): number {
	const position = Math.min(1, Math.max(0, s)) * PACE_SAMPLES;
	const i = Math.min(PACE_SAMPLES - 1, Math.floor(position));
	return flight.pace[i] + (flight.pace[i + 1] - flight.pace[i]) * (position - i);
}

/** The camera `t` of the way (0 to 1, in time) through a flight. */
export function flightCamera(flight: Flight, t: number): Camera {
	if (t >= 1) return flight.to;
	const s = easeInOut(Math.max(0, t));
	const [lon, lat] = flight.interpolate(turnAt(flight, s));
	return {
		lon: wrapLongitude(lon),
		lat,
		radius: Math.exp(logRadius(flight, s)),
		x: flight.from.x + (flight.to.x - flight.from.x) * s,
		y: flight.from.y + (flight.to.y - flight.from.y) * s,
	};
}
