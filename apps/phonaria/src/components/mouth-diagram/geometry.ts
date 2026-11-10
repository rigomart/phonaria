export type Point = readonly [number, number];

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerpPoint = (a: Point, b: Point, t: number): Point => [
	lerp(a[0], b[0], t),
	lerp(a[1], b[1], t),
];

export const lerpPoints = (a: readonly Point[], b: readonly Point[], t: number): Point[] =>
	a.map((point, index) => lerpPoint(point, b[index] ?? point, t));

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Turns `point` about `pivot`; a positive angle is anticlockwise on screen, the way the jaw opens. */
export function rotateAround(point: Point, pivot: Point, degrees: number): Point {
	const angle = (degrees * Math.PI) / 180;
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const dx = point[0] - pivot[0];
	const dy = point[1] - pivot[1];
	return [pivot[0] + dx * cos + dy * sin, pivot[1] - dx * sin + dy * cos];
}

const n = (value: number) => value.toFixed(1);

/** A smooth closed outline through every point (Catmull-Rom, written as cubic Béziers). */
export function closedSplinePath(points: readonly Point[], tension = 1): string {
	const count = points.length;
	const at = (index: number) => points[(index + count) % count] as Point;
	let d = `M${n(at(0)[0])} ${n(at(0)[1])}`;
	for (let i = 0; i < count; i++) {
		const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
		const k = tension / 6;
		d += `C${n(p1[0] + (p2[0] - p0[0]) * k)} ${n(p1[1] + (p2[1] - p0[1]) * k)} ${n(p2[0] - (p3[0] - p1[0]) * k)} ${n(p2[1] - (p3[1] - p1[1]) * k)} ${n(p2[0])} ${n(p2[1])}`;
	}
	return `${d}Z`;
}

/** A smooth open line through every point, as path commands that continue from the first point. */
export function openSplineSegments(points: readonly Point[]): string {
	const last = points.length - 1;
	const at = (index: number) => points[Math.min(last, Math.max(0, index))] as Point;
	let d = "";
	for (let i = 0; i < last; i++) {
		const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
		d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
	}
	return d;
}

export const moveTo = (point: Point) => `M${n(point[0])} ${n(point[1])}`;
export const lineTo = (...points: Point[]) =>
	points.map((point) => `L${n(point[0])} ${n(point[1])}`).join("");

/** The same smooth line as `openSplineSegments`, sampled into short straight pieces. */
export function sampleSpline(points: readonly Point[], perSegment = 6): Point[] {
	const last = points.length - 1;
	const at = (index: number) => points[Math.min(last, Math.max(0, index))] as Point;
	const out: Point[] = [at(0)];
	for (let i = 0; i < last; i++) {
		const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
		for (let step = 1; step <= perSegment; step++) {
			const t = step / perSegment;
			const t2 = t * t;
			const t3 = t2 * t;
			const coordinate = (axis: 0 | 1) =>
				0.5 *
				(2 * p1[axis] +
					(-p0[axis] + p2[axis]) * t +
					(2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 +
					(-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3);
			out.push([coordinate(0), coordinate(1)]);
		}
	}
	return out;
}

/** A sampled line with its running length, so a distance along it can be turned into a position. */
export type Track = { points: Point[]; lengths: number[]; total: number };

export function buildTrack(points: Point[]): Track {
	const lengths = [0];
	for (let i = 1; i < points.length; i++) {
		const a = points[i - 1] as Point;
		const b = points[i] as Point;
		lengths.push((lengths[i - 1] as number) + Math.hypot(b[0] - a[0], b[1] - a[1]));
	}
	return { points, lengths, total: lengths[lengths.length - 1] as number };
}

export function trackAt(track: Track, distance: number): { point: Point; normal: Point } {
	const { points, lengths } = track;
	const d = Math.min(track.total, Math.max(0, distance));
	let i = 1;
	while (i < lengths.length - 1 && (lengths[i] as number) < d) i++;
	const a = points[i - 1] as Point;
	const b = points[i] as Point;
	const span = (lengths[i] as number) - (lengths[i - 1] as number) || 1;
	const t = (d - (lengths[i - 1] as number)) / span;
	const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
	return {
		point: [lerp(a[0], b[0], t), lerp(a[1], b[1], t)],
		normal: [-(b[1] - a[1]) / length, (b[0] - a[0]) / length],
	};
}

export function nearestDistance(track: Track, target: Point): number {
	let best = 0;
	let bestGap = Number.POSITIVE_INFINITY;
	track.points.forEach((point, index) => {
		const gap = Math.hypot(point[0] - target[0], point[1] - target[1]);
		if (gap < bestGap) {
			bestGap = gap;
			best = index;
		}
	});
	return track.lengths[best] as number;
}

/** A closed outline as its start point, then two handles and an end point per curve. */
export type Outline = readonly Point[];

/** Reads a closed path made only of an `M` and `C` commands with absolute coordinates. */
export function parseOutline(d: string): Point[] {
	const numbers = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
	const points: Point[] = [];
	for (let i = 0; i + 1 < numbers.length; i += 2) {
		points.push([numbers[i] as number, numbers[i + 1] as number]);
	}
	return points;
}

export function outlinePath(points: Outline): string {
	let d = moveTo(points[0] as Point);
	for (let i = 1; i + 2 < points.length; i += 3) {
		const [a, b, c] = [points[i], points[i + 1], points[i + 2]] as [Point, Point, Point];
		d += `C${n(a[0])} ${n(a[1])} ${n(b[0])} ${n(b[1])} ${n(c[0])} ${n(c[1])}`;
	}
	return `${d}Z`;
}

type Cubic = readonly [Point, Point, Point, Point];

export function cubicAt([a, b, c, d]: Cubic, t: number): Point {
	const u = 1 - t;
	const mix = (axis: 0 | 1) =>
		u * u * u * a[axis] + 3 * u * u * t * b[axis] + 3 * u * t * t * c[axis] + t * t * t * d[axis];
	return [mix(0), mix(1)];
}

/** The part of a cubic from `t` to its end, as a cubic of its own. */
export function cubicTail([a, b, c, d]: Cubic, t: number): Cubic {
	const bc = lerpPoint(b, c, t);
	const cd = lerpPoint(c, d, t);
	const abc = lerpPoint(lerpPoint(a, b, t), bc, t);
	const bcd = lerpPoint(bc, cd, t);
	return [lerpPoint(abc, bcd, t), bcd, cd, d];
}
