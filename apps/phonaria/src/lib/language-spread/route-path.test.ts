import { describe, expect, it } from "vitest";
import { buildRoute, partialRoute, pointAt } from "./route-path";
import { angularDistance, RAD, toVector } from "./sphere";
import { STEPS } from "./story";

function sharpestTurn(points: readonly [number, number][]): number {
	const vectors = points.map(([lon, lat]) => toVector(lon, lat));
	let sharpest = 0;
	for (let i = 1; i < vectors.length - 1; i += 1) {
		const [a, b, c] = [vectors[i - 1], vectors[i], vectors[i + 1]];
		const d1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
		const d2 = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
		const cos =
			(d1[0] * d2[0] + d1[1] * d2[1] + d1[2] * d2[2]) / (Math.hypot(...d1) * Math.hypot(...d2));
		sharpest = Math.max(sharpest, Math.acos(Math.min(1, cos)) / RAD);
	}
	return sharpest;
}

describe("spread routes", () => {
	it("joins two waypoints along the great circle", () => {
		const london: [number, number] = [-0.1, 51.5];
		const virginia: [number, number] = [-76.5, 37.3];
		const route = buildRoute([london, virginia]);
		const total = angularDistance(london, virginia);
		expect(route.length).toBeCloseTo(total, 6);
		for (const point of route.points) {
			expect(angularDistance(london, point) + angularDistance(point, virginia)).toBeCloseTo(
				total,
				6,
			);
		}
		expect(
			Math.max(...route.points.map(([, lat]) => lat)),
			"bows north of the flat-map line",
		).toBeGreaterThan(52);
	});

	it("passes through every waypoint, about a degree between samples", () => {
		const waypoints = [
			[10, 50],
			[40, 45],
			[60, 20],
		] as const;
		const route = buildRoute(waypoints);
		for (const waypoint of waypoints) {
			expect(route.points.some(([lon, lat]) => lon === waypoint[0] && lat === waypoint[1])).toBe(
				true,
			);
		}
		for (let i = 1; i < route.points.length; i += 1) {
			expect(route.lengths[i] - route.lengths[i - 1]).toBeLessThanOrEqual(2 * RAD);
		}
	});

	it("bends smoothly through waypoints instead of turning a corner", () => {
		const london: [number, number] = [-0.1, 51.5];
		const sydney: [number, number] = [151.2, -33.9];
		const waypoints = [london, [-20, 10], [18, -36], [80, -25], sydney] as const;
		expect(sharpestTurn(buildRoute(waypoints).points)).toBeLessThan(6);
		for (const step of STEPS) {
			for (const route of step.routes) {
				const { points } = buildRoute(route);
				expect(sharpestTurn(points), step.id).toBeLessThan(10);
				for (const [lon, lat] of route) {
					const wrapped = ((((lon + 180) % 360) + 360) % 360) - 180;
					expect(points.some((p) => p[0] === wrapped && p[1] === lat)).toBe(true);
				}
			}
		}
	});

	it("crosses the antimeridian with wrapped longitudes", () => {
		const route = buildRoute([
			[170, -15],
			[200, -20],
		]);
		expect(route.points.every(([lon]) => lon >= -180 && lon < 180)).toBe(true);
		expect(route.length).toBeCloseTo(angularDistance([170, -15], [-160, -20]), 6);
		const [lon] = pointAt(route, route.length / 2);
		expect(Math.abs(lon)).toBeGreaterThan(170);
	});

	it("draws part of a route up to the exact tip, reusing its buffers", () => {
		const route = buildRoute([
			[0, 0],
			[40, 0],
		]);
		const out: [number, number][] = [];
		const tip: [number, number] = [0, 0];
		expect(partialRoute(route, 0, out, tip)).toHaveLength(0);
		const half = partialRoute(route, 0.5, out, tip);
		expect(half).toBe(out);
		expect(half.at(-1)).toBe(tip);
		expect(tip[0]).toBeCloseTo(20);
		expect(tip[1]).toBeCloseTo(0);
		expect(half.length).toBeLessThan(route.points.length);
		const whole = partialRoute(route, 1, out, tip);
		expect(whole).toEqual(route.points);
	});

	it("clamps points to the ends of the route", () => {
		const route = buildRoute([
			[0, 0],
			[10, 10],
		]);
		expect(pointAt(route, -1)).toEqual([0, 0]);
		expect(pointAt(route, route.length + 1)).toEqual([10, 10]);
	});
});
