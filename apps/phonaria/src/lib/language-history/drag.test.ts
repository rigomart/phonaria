import { describe, expect, it } from "vitest";
import type { Camera, Viewport } from "./camera";
import {
	AWAY_PX,
	clampLatitude,
	decayVelocity,
	dragCamera,
	INERTIA_MAX,
	INERTIA_MS,
	isAway,
	LATITUDE_LIMIT,
	releaseVelocity,
} from "./drag";
import { orthographic, RAD } from "./sphere";

const viewport: Viewport = {
	width: 1280,
	height: 752,
	insets: { top: 0, right: 0, bottom: 0, left: 0 },
};
const globe: Camera = { lon: 10, lat: 0, radius: 300, x: 640, y: 376 };

describe("dragging the globe", () => {
	it("keeps the place under the pointer under it near the center", () => {
		const moved = dragCamera(globe, 30, -20, "free");
		const { x, y } = orthographic(globe.lon, globe.lat, [moved.lon, moved.lat]);
		expect(x * globe.radius).toBeCloseTo(30, 0);
		expect(y * globe.radius).toBeCloseTo(-20, 0);
	});

	it("turns less when zoomed in, as the same pixels cover less of the globe", () => {
		const close = { ...globe, radius: 3000 };
		expect(Math.abs(dragCamera(close, 30, 0, "free").lon - close.lon)).toBeCloseTo(
			Math.abs(dragCamera(globe, 30, 0, "free").lon - globe.lon) / 10,
		);
	});

	it("turns east when dragged right, north when dragged down", () => {
		expect(dragCamera(globe, 50, 0, "free").lon).toBeLessThan(globe.lon);
		expect(dragCamera(globe, 0, 50, "free").lat).toBeGreaterThan(globe.lat);
	});

	it("only spins east or west for touch", () => {
		const spun = dragCamera(globe, 40, 200, "spin");
		expect(spun.lat).toBe(globe.lat);
		expect(spun.lon).not.toBe(globe.lon);
	});

	it("keeps the poles from flipping over", () => {
		expect(clampLatitude(89)).toBe(LATITUDE_LIMIT);
		expect(clampLatitude(-120)).toBe(-LATITUDE_LIMIT);
		expect(dragCamera(globe, 0, 10_000, "free").lat).toBe(LATITUDE_LIMIT);
		expect(dragCamera({ ...globe, lat: 74 }, 100, 0, "free").lon).toBeGreaterThan(-180);
	});

	it("wraps across the antimeridian", () => {
		const lon = dragCamera({ ...globe, lon: -179 }, (5 * RAD * 300) / 1, 0, "free").lon;
		expect(lon).toBeCloseTo(176);
	});
});

describe("gliding after release", () => {
	it("decays quickly and smoothly", () => {
		expect(decayVelocity(1, 0)).toBe(1);
		expect(decayVelocity(1, INERTIA_MS)).toBeCloseTo(Math.exp(-1));
		expect(decayVelocity(1, 1000)).toBeLessThan(0.02);
		expect(decayVelocity(-2, 100)).toBeCloseTo(-2 * Math.exp(-100 / INERTIA_MS));
	});

	it("caps a flick", () => {
		const [vx, vy] = releaseVelocity(30, 40);
		expect(Math.hypot(vx, vy)).toBeCloseTo(INERTIA_MAX);
		expect(vx / vy).toBeCloseTo(30 / 40);
		expect(releaseVelocity(0.5, 0)).toEqual([0.5, 0]);
	});
});

describe("noticing the view was dragged away", () => {
	it("ignores small nudges and notices moves past a few dozen pixels", () => {
		const nudge = dragCamera(globe, AWAY_PX / 2, 0, "free");
		const moved = dragCamera(globe, AWAY_PX * 2, 0, "free");
		expect(isAway(nudge, globe, viewport)).toBe(false);
		expect(isAway(moved, globe, viewport)).toBe(true);
	});

	it("counts a step's center turned behind the globe as away", () => {
		expect(isAway({ ...globe, lon: globe.lon + 170 }, globe, viewport)).toBe(true);
	});
});
