import { angularDistance, RAD, toLonLat, toVector, type Vector, wrapLongitude } from "./sphere";
import type { LonLat } from "./types";

export type RoutePath = {
	/** Longitudes are wrapped to [-180, 180). */
	points: [number, number][];
	/** Great-circle distance from the start to each point, in radians. */
	lengths: Float64Array;
	length: number;
};

const SAMPLE_DEGREES = 1;
const MIN_SAMPLES = 24;
/** Centripetal Catmull-Rom: knots spaced by the square root of the distance, so the curve never loops or overshoots. */
const ALPHA = 0.5;

const lerp = (a: Vector, b: Vector, wa: number, wb: number): Vector => [
	a[0] * wa + b[0] * wb,
	a[1] * wa + b[1] * wb,
	a[2] * wa + b[2] * wb,
];
const chord = (a: Vector, b: Vector) =>
	Math.max(1e-9, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) ** ALPHA);

/** The point `u` (0 to 1) of the way from p1 to p2 on the centripetal Catmull-Rom curve through p0 to p3. */
function catmullRom(p0: Vector, p1: Vector, p2: Vector, p3: Vector, u: number): Vector {
	const t1 = chord(p0, p1);
	const t2 = t1 + chord(p1, p2);
	const t3 = t2 + chord(p2, p3);
	const t = t1 + (t2 - t1) * u;
	const a1 = lerp(p0, p1, (t1 - t) / t1, t / t1);
	const a2 = lerp(p1, p2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1));
	const a3 = lerp(p2, p3, (t3 - t) / (t3 - t2), (t - t2) / (t3 - t2));
	const b1 = lerp(a1, a2, (t2 - t) / t2, t / t2);
	const b2 = lerp(a2, a3, (t3 - t) / (t3 - t1), (t - t1) / (t3 - t1));
	return lerp(b1, b2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1));
}

/** The point past `a`, continuing the line from `b` through `a`, so the curve leaves its ends straight. */
const beyond = (a: Vector, b: Vector): Vector => [
	2 * a[0] - b[0],
	2 * a[1] - b[1],
	2 * a[2] - b[2],
];

/**
 * A smooth arrow through every waypoint: a centripetal Catmull-Rom curve
 * through the waypoints as points in space, pushed back onto the globe and
 * sampled about a degree apart. Between two waypoints alone it is the great
 * circle.
 */
export function buildRoute(waypoints: readonly LonLat[]): RoutePath {
	if (waypoints.length < 2) throw new Error("A route needs at least two points.");
	const at = (i: number): [number, number] => [wrapLongitude(waypoints[i][0]), waypoints[i][1]];
	const vectors = waypoints.map(([lon, lat]) => toVector(lon, lat));
	const last = vectors.length - 1;
	const points: [number, number][] = [at(0)];
	for (let i = 0; i < last; i += 1) {
		const p1 = vectors[i];
		const p2 = vectors[i + 1];
		const p0 = vectors[i - 1] ?? beyond(p1, p2);
		const p3 = vectors[i + 2] ?? beyond(p2, p1);
		const arc = angularDistance(at(i), at(i + 1)) / RAD;
		const samples = Math.max(MIN_SAMPLES, Math.ceil(arc / SAMPLE_DEGREES));
		for (let k = 1; k < samples; k += 1) {
			const [lon, lat] = toLonLat(catmullRom(p0, p1, p2, p3, k / samples));
			points.push([wrapLongitude(lon), lat]);
		}
		points.push(at(i + 1));
	}
	const lengths = new Float64Array(points.length);
	for (let i = 1; i < points.length; i += 1) {
		lengths[i] = lengths[i - 1] + angularDistance(points[i - 1], points[i]);
	}
	return { points, lengths, length: lengths[points.length - 1] };
}

function unwrapLongitude(from: number, lon: number): number {
	if (lon - from > 180) return lon - 360;
	if (from - lon > 180) return lon + 360;
	return lon;
}

function sampleBefore(route: RoutePath, distance: number): number {
	let low = 0;
	let high = route.points.length - 1;
	while (high - low > 1) {
		const middle = (low + high) >> 1;
		if (route.lengths[middle] <= distance) low = middle;
		else high = middle;
	}
	return low;
}

/** Writes the point `distance` radians along the route, clamped to its ends, into `out`. */
export function pointAt(
	route: RoutePath,
	distance: number,
	out: [number, number] = [0, 0],
): [number, number] {
	const { points, lengths } = route;
	const last = points.length - 1;
	if (distance <= 0 || distance >= route.length) {
		const end = points[distance <= 0 ? 0 : last];
		out[0] = end[0];
		out[1] = end[1];
		return out;
	}
	const low = sampleBefore(route, distance);
	const high = low + 1;
	const span = lengths[high] - lengths[low];
	const t = span > 0 ? (distance - lengths[low]) / span : 0;
	const [lon1, lat1] = points[low];
	const lon2 = unwrapLongitude(lon1, points[high][0]);
	out[0] = wrapLongitude(lon1 + (lon2 - lon1) * t);
	out[1] = lat1 + (points[high][1] - lat1) * t;
	return out;
}

/**
 * The first `progress` (0 to 1) of the route, ending exactly at the drawn tip.
 * Fills and returns `out`, reusing `tip` for the last point, so drawing an
 * arrow frame by frame allocates nothing once `out` has grown.
 */
export function partialRoute(
	route: RoutePath,
	progress: number,
	out: [number, number][],
	tip: [number, number] = [0, 0],
): [number, number][] {
	out.length = 0;
	if (progress <= 0) return out;
	if (progress >= 1) {
		for (const point of route.points) out.push(point);
		return out;
	}
	const distance = progress * route.length;
	const end = sampleBefore(route, distance);
	for (let i = 0; i <= end; i += 1) out.push(route.points[i]);
	out.push(pointAt(route, distance, tip));
	return out;
}
